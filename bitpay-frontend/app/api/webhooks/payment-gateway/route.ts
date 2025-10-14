/**
 * POST /api/webhooks/payment-gateway
 * Handles external payment gateway webhooks (Stripe, PayPal, etc.)
 * Used for marketplace purchases via fiat currency
 * 
 * Flow:
 * 1. User initiates purchase via initiate-purchase contract call
 * 2. Frontend shows payment link/button
 * 3. User completes payment via external gateway
 * 4. Gateway sends webhook to this endpoint
 * 5. Backend verifies payment and calls complete-purchase contract
 * 6. Chainhook picks up gateway-purchase-completed event
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Payment gateway webhook payload types
interface StripeWebhookPayload {
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: {
        streamId: string;
        paymentId: string;
        buyer: string;
        seller: string;
      };
    };
  };
}

interface PayPalWebhookPayload {
  event_type: string;
  resource: {
    id: string;
    amount: {
      total: string;
      currency: string;
    };
    state: string;
    custom_id: string; // Our payment ID
  };
}

export async function POST(request: Request) {
  try {
    // Determine payment gateway from headers or body
    const gateway = detectPaymentGateway(request);

    console.log(`💳 Payment gateway webhook received: ${gateway}`);

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request, gateway);
    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload based on gateway
    const payload = await request.json();

    switch (gateway) {
      case 'stripe':
        return await handleStripeWebhook(payload as StripeWebhookPayload);

      case 'paypal':
        return await handlePayPalWebhook(payload as PayPalWebhookPayload);

      default:
        console.error(`Unknown payment gateway: ${gateway}`);
        return NextResponse.json(
          { success: false, error: 'Unknown gateway' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Payment gateway webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Detect which payment gateway sent the webhook
 */
function detectPaymentGateway(request: Request): string {
  const stripeSignature = request.headers.get('stripe-signature');
  const paypalTransmissionId = request.headers.get('paypal-transmission-id');

  if (stripeSignature) return 'stripe';
  if (paypalTransmissionId) return 'paypal';

  return 'unknown';
}

/**
 * Verify webhook signature to ensure it's from the payment gateway
 */
async function verifyWebhookSignature(
  request: Request,
  gateway: string
): Promise<boolean> {
  try {
    switch (gateway) {
      case 'stripe':
        return await verifyStripeSignature(request);

      case 'paypal':
        return await verifyPayPalSignature(request);

      default:
        return false;
    }
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Verify Stripe webhook signature
 */
async function verifyStripeSignature(request: Request): Promise<boolean> {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  // In production, use stripe.webhooks.constructEvent()
  // For now, basic HMAC verification
  const body = await request.text();
  const timestamp = signature.split(',')[0].split('=')[1];
  const receivedSignature = signature.split(',')[1].split('=')[1];

  const payload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Verify PayPal webhook signature
 */
async function verifyPayPalSignature(request: Request): Promise<boolean> {
  // PayPal webhook verification is more complex
  // Requires calling PayPal API to verify
  // For now, check basic headers
  const transmissionId = request.headers.get('paypal-transmission-id');
  const transmissionTime = request.headers.get('paypal-transmission-time');
  const transmissionSig = request.headers.get('paypal-transmission-sig');

  return !!(transmissionId && transmissionTime && transmissionSig);
}

/**
 * Handle Stripe payment completed webhook
 */
async function handleStripeWebhook(
  payload: StripeWebhookPayload
): Promise<Response> {
  console.log(`🔔 Stripe event: ${payload.type}`);

  switch (payload.type) {
    case 'payment_intent.succeeded':
      return await handlePaymentSuccess({
        paymentId: payload.data.object.metadata.paymentId,
        streamId: payload.data.object.metadata.streamId,
        buyer: payload.data.object.metadata.buyer,
        seller: payload.data.object.metadata.seller,
        amount: payload.data.object.amount,
        currency: payload.data.object.currency,
        gateway: 'stripe',
        gatewayPaymentId: payload.data.object.id,
      });

    case 'payment_intent.payment_failed':
      return await handlePaymentFailed({
        paymentId: payload.data.object.metadata.paymentId,
        streamId: payload.data.object.metadata.streamId,
        reason: 'Payment failed',
      });

    default:
      console.log(`Unhandled Stripe event: ${payload.type}`);
      return NextResponse.json({ received: true });
  }
}

/**
 * Handle PayPal payment completed webhook
 */
async function handlePayPalWebhook(
  payload: PayPalWebhookPayload
): Promise<Response> {
  console.log(`🔔 PayPal event: ${payload.event_type}`);

  switch (payload.event_type) {
    case 'PAYMENT.SALE.COMPLETED':
      // Parse custom_id which should contain: streamId|paymentId|buyer|seller
      const [streamId, paymentId, buyer, seller] = payload.resource.custom_id.split('|');

      return await handlePaymentSuccess({
        paymentId,
        streamId,
        buyer,
        seller,
        amount: parseFloat(payload.resource.amount.total) * 100, // Convert to cents
        currency: payload.resource.amount.currency,
        gateway: 'paypal',
        gatewayPaymentId: payload.resource.id,
      });

    case 'PAYMENT.SALE.DENIED':
      const [failedStreamId, failedPaymentId] = payload.resource.custom_id.split('|');

      return await handlePaymentFailed({
        paymentId: failedPaymentId,
        streamId: failedStreamId,
        reason: 'Payment denied',
      });

    default:
      console.log(`Unhandled PayPal event: ${payload.event_type}`);
      return NextResponse.json({ received: true });
  }
}

/**
 * Handle successful payment - call complete-purchase contract
 */
async function handlePaymentSuccess(data: {
  paymentId: string;
  streamId: string;
  buyer: string;
  seller: string;
  amount: number;
  currency: string;
  gateway: string;
  gatewayPaymentId: string;
}): Promise<Response> {
  console.log(`✅ Payment successful:`, data);

  try {
    // TODO: Call Stacks contract complete-purchase function
    // This should be done by the authorized backend principal
    // 1. Build transaction calling bitpay-marketplace-v2.complete-purchase
    // 2. Sign with backend wallet
    // 3. Broadcast transaction
    // 4. Chainhook will pick up the gateway-purchase-completed event

    // For now, log the intent
    console.log(`📝 Would call complete-purchase for stream ${data.streamId}`);

    // TODO: Store payment confirmation in database
    // await db.collection('payment_confirmations').insertOne({
    //   ...data,
    //   confirmedAt: new Date(),
    //   status: 'pending_blockchain_confirmation',
    // });

    // TODO: Send confirmation email to buyer and seller

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      streamId: data.streamId,
      paymentId: data.paymentId,
    });
  } catch (error) {
    console.error('Failed to process payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(data: {
  paymentId: string;
  streamId: string;
  reason: string;
}): Promise<Response> {
  console.error(`❌ Payment failed:`, data);

  try {
    // TODO: Mark payment as failed in database
    // TODO: Notify buyer
    // TODO: Make listing available again

    return NextResponse.json({
      success: true,
      message: 'Payment failure processed',
      streamId: data.streamId,
      paymentId: data.paymentId,
    });
  } catch (error) {
    console.error('Failed to process payment failure:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment failure',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Payment Gateway webhook endpoint',
    status: 'active',
    supportedGateways: ['stripe', 'paypal'],
  });
}
