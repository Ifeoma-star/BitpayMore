/**
 * POST /api/webhooks/chainhook/marketplace
 * Handles BitPay Marketplace events from Chainhook
 * Events: direct-purchase-completed, purchase-initiated, gateway-purchase-completed, purchase-expired
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  MarketplaceEvent,
  DirectPurchaseCompletedEvent,
  PurchaseInitiatedEvent,
  GatewayPurchaseCompletedEvent,
  PurchaseExpiredEvent,
} from '@/types/chainhook';
import {
  verifyWebhookAuth,
  errorResponse,
  successResponse,
  extractPrintEvents,
  parseEventData,
  getWebhookContext,
  logWebhookEvent,
  handleReorg,
  validatePayload,
  webhookRateLimiter,
} from '@/lib/webhooks/chainhook-utils';
import {
  saveDirectPurchase,
  saveGatewayPurchase,
  savePurchaseInitiated,
} from '@/lib/webhooks/database-handlers';
import { notifyPurchaseCompleted } from '@/lib/notifications/notification-service';
import connectToDatabase from '@/lib/db';
import * as NotificationService from '@/lib/notifications/notification-service';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'chainhook';
    if (!webhookRateLimiter.check(clientId)) {
      return errorResponse('Rate limit exceeded', 429);
    }

    // Verify authorization
    const authResult = verifyWebhookAuth(request);
    if (!authResult.valid) {
      return errorResponse(authResult.error || 'Unauthorized', 401);
    }

    // Parse and validate payload
    const payload: ChainhookPayload = await request.json();
    if (!validatePayload(payload)) {
      return errorResponse('Invalid payload structure', 400);
    }

    console.log('📨 Marketplace events webhook received:', {
      apply: payload.apply?.length || 0,
      rollback: payload.rollback?.length || 0,
      uuid: payload.chainhook?.uuid,
    });

    let processedCount = 0;
    const errors: string[] = [];

    // Handle rollbacks
    if (payload.rollback && payload.rollback.length > 0) {
      console.warn('⚠️ Rollback detected:', payload.rollback.length, 'blocks');
      const result = await handleReorg(payload.rollback);
      if (!result.success && result.errors) {
        errors.push(...result.errors);
      }
    }

    // Process new blocks
    if (payload.apply && payload.apply.length > 0) {
      for (const block of payload.apply) {
        try {
          const blockResult = await processMarketplaceBlock(block);
          processedCount += blockResult;
        } catch (error) {
          const errorMsg = `Failed to process block ${block.block_identifier.index}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    return successResponse({
      success: errors.length === 0,
      eventType: 'marketplace-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Marketplace webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for marketplace events
 */
async function processMarketplaceBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`🛒 Processing marketplace events from block ${block.block_identifier.index}`);

  for (const tx of block.transactions) {
    if (!tx.metadata.success) {
      continue;
    }

    const printEvents = extractPrintEvents(tx);

    for (const event of printEvents) {
      const eventData = parseEventData<MarketplaceEvent>(event);
      if (!eventData) {
        continue;
      }

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      try {
        await handleMarketplaceEvent(eventData, context);
        processed++;
      } catch (error) {
        console.error(`Failed to handle event ${eventData.event}:`, error);
        throw error;
      }
    }
  }

  return processed;
}

/**
 * Route marketplace events to appropriate handlers
 */
async function handleMarketplaceEvent(
  event: MarketplaceEvent,
  context: any
): Promise<void> {
  switch (event.event) {
    case 'direct-purchase-completed':
      await handleDirectPurchase(event, context);
      break;

    case 'purchase-initiated':
      await handlePurchaseInitiated(event, context);
      break;

    case 'gateway-purchase-completed':
      await handleGatewayPurchase(event, context);
      break;

    case 'purchase-expired':
      await handlePurchaseExpired(event, context);
      break;

    case 'backend-authorized':
    case 'backend-deauthorized':
    case 'marketplace-fee-updated':
      // Log these admin events but don't require special handling
      logWebhookEvent(event.event, event, context);
      break;

    default:
      console.warn(`Unknown marketplace event: ${(event as any).event}`);
  }
}

/**
 * Handle direct-purchase-completed event
 */
async function handleDirectPurchase(
  event: DirectPurchaseCompletedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('direct-purchase-completed', event, context);

  await saveDirectPurchase({
    streamId: event['stream-id'].toString(),
    seller: event.seller,
    buyer: event.buyer,
    price: event.price.toString(),
    marketplaceFee: event['marketplace-fee'].toString(),
    saleId: event['sale-id'].toString(),
    context,
  });

  // Send notifications to both buyer and seller
  await notifyPurchaseCompleted({
    streamId: event['stream-id'].toString(),
    buyer: event.buyer,
    seller: event.seller,
    price: event.price.toString(),
    marketplaceFee: event['marketplace-fee'].toString(),
    saleId: event['sale-id'].toString(),
    txHash: context.txHash,
  });
}

/**
 * Handle purchase-initiated event (gateway payment flow)
 */
async function handlePurchaseInitiated(
  event: PurchaseInitiatedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('purchase-initiated', event, context);

  await savePurchaseInitiated({
    streamId: event['stream-id'].toString(),
    seller: event.seller,
    buyer: event.buyer,
    paymentId: event['payment-id'],
    initiatedAt: event['initiated-at'].toString(),
    expiresAt: event['expires-at'].toString(),
    context,
  });

  // Get stream details and listing price for notification
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  let paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace/purchase/${event['payment-id']}`;
  let listingPrice = '0';

  // Fetch listing price from database
  if (db) {
    const listing = await db.collection('marketplace_listings').findOne({
      streamId: event['stream-id'].toString(),
    });
    if (listing && listing.price) {
      listingPrice = listing.price.toString();
    }
  }

  // Create StacksPay payment link if we have the integration
  if (process.env.STACKSPAY_API_URL && listingPrice !== '0') {
    try {
      // Generate payment link with StacksPay
      const stacksPayResponse = await fetch(`${process.env.STACKSPAY_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STACKSPAY_API_KEY}`,
        },
        body: JSON.stringify({
          amount: listingPrice,
          currency: 'SBTC',
          metadata: {
            streamId: event['stream-id'].toString(),
            buyer: event.buyer,
            seller: event.seller,
            paymentId: event['payment-id'],
          },
          webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payment-gateway`,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace/purchase/${event['payment-id']}/complete`,
        }),
      });

      if (stacksPayResponse.ok) {
        const paymentData = await stacksPayResponse.json();
        paymentUrl = paymentData.paymentUrl || paymentUrl;

        // Store payment link in database
        if (db) {
          await db.collection('pending_purchases').updateOne(
            { paymentId: event['payment-id'] },
            {
              $set: {
                stacksPayPaymentUrl: paymentUrl,
                stacksPayId: paymentData.id,
              },
            },
            { upsert: true }
          );
        }
      }
    } catch (error) {
      console.error('Failed to create StacksPay payment link:', error);
    }
  }

  // Send payment link to buyer
  await NotificationService.createNotification(
    event.buyer,
    'purchase_initiated',
    '💳 Complete Your Purchase',
    `Your purchase for stream #${event['stream-id']} has been initiated. Complete payment within 30 minutes.`,
    {
      streamId: event['stream-id'].toString(),
      seller: event.seller,
      paymentId: event['payment-id'],
      expiresAt: event['expires-at'].toString(),
    },
    {
      priority: 'urgent',
      actionUrl: paymentUrl,
      actionText: 'Complete Payment',
    }
  );

  // Notify seller that purchase is pending
  await NotificationService.createNotification(
    event.seller,
    'purchase_initiated',
    '⏳ Purchase Pending',
    `A buyer has initiated purchase for stream #${event['stream-id']}. Awaiting payment confirmation.`,
    {
      streamId: event['stream-id'].toString(),
      buyer: event.buyer,
      paymentId: event['payment-id'],
    },
    {
      priority: 'normal',
      actionUrl: `/dashboard/marketplace/listings/${event['stream-id']}`,
      actionText: 'View Details',
    }
  );
}

/**
 * Handle gateway-purchase-completed event
 */
async function handleGatewayPurchase(
  event: GatewayPurchaseCompletedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('gateway-purchase-completed', event, context);

  await saveGatewayPurchase({
    streamId: event['stream-id'].toString(),
    seller: event.seller,
    buyer: event.buyer,
    price: event.price.toString(),
    marketplaceFee: event['marketplace-fee'].toString(),
    paymentId: event['payment-id'],
    saleId: event['sale-id'].toString(),
    context,
  });

  // Send notifications to both buyer and seller
  await notifyPurchaseCompleted({
    streamId: event['stream-id'].toString(),
    buyer: event.buyer,
    seller: event.seller,
    price: event.price.toString(),
    marketplaceFee: event['marketplace-fee'].toString(),
    saleId: event['sale-id'].toString(),
    txHash: context.txHash,
  });
}

/**
 * Handle purchase-expired event
 */
async function handlePurchaseExpired(
  event: PurchaseExpiredEvent,
  context: any
): Promise<void> {
  logWebhookEvent('purchase-expired', event, context);

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  // Mark purchase as expired in database
  if (db) {
    // Fetch the listing to get seller info since PurchaseExpiredEvent doesn't include seller
    const listing = await db.collection('marketplace_listings').findOne({
      streamId: event['stream-id'].toString(),
      status: 'pending_payment',
    });

    const seller = listing?.seller || 'unknown';

    await db.collection('pending_purchases').updateOne(
      { paymentId: event['payment-id'] },
      {
        $set: {
          status: 'expired',
          expiredAt: new Date(context.timestamp * 1000),
          expiredTxHash: context.txHash,
        },
      }
    );

    // Make listing available again
    await db.collection('marketplace_listings').updateOne(
      { streamId: event['stream-id'].toString(), status: 'pending_payment' },
      {
        $set: {
          status: 'active',
          updatedAt: new Date(),
        },
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'purchase-expired',
      streamId: event['stream-id'].toString(),
      data: {
        streamId: event['stream-id'].toString(),
        buyer: event.buyer,
        seller: seller,
        paymentId: event['payment-id'],
        expiredAt: new Date(context.timestamp * 1000),
      },
      context,
      processedAt: new Date(),
    });

    // Notify buyer that payment window expired
    await NotificationService.createNotification(
      event.buyer,
      'purchase_expired',
      '⏰ Purchase Expired',
      `Your purchase for stream #${event['stream-id']} has expired. The payment window has closed.`,
      {
        streamId: event['stream-id'].toString(),
        seller: seller,
        paymentId: event['payment-id'],
        txHash: context.txHash,
      },
      {
        priority: 'normal',
        actionUrl: `/dashboard/marketplace`,
        actionText: 'Browse Marketplace',
      }
    );

    // Notify seller that purchase expired (if seller found)
    if (seller !== 'unknown') {
      await NotificationService.createNotification(
        seller,
        'purchase_expired',
        '⏰ Purchase Expired',
        `The pending purchase for stream #${event['stream-id']} has expired. Your listing is now available again.`,
        {
          streamId: event['stream-id'].toString(),
          buyer: event.buyer,
          paymentId: event['payment-id'],
          txHash: context.txHash,
        },
        {
          priority: 'low',
          actionUrl: `/dashboard/marketplace/listings/${event['stream-id']}`,
          actionText: 'View Listing',
        }
      );
    }
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay Marketplace Events webhook endpoint',
    status: 'active',
    events: [
      'direct-purchase-completed',
      'purchase-initiated',
      'gateway-purchase-completed',
      'purchase-expired',
      'backend-authorized',
      'backend-deauthorized',
      'marketplace-fee-updated',
    ],
  });
}
