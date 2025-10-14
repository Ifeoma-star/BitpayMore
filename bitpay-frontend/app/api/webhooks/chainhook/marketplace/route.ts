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

  // TODO: Send notifications to buyer and seller
  // TODO: Update UI in real-time
  // TODO: Trigger analytics/metrics update
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

  // TODO: Send payment link to buyer via email/notification
  // TODO: Set up expiration timer/reminder
  // TODO: Update UI showing pending payment
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

  // TODO: Send confirmation to buyer and seller
  // TODO: Update UI showing completed sale
  // TODO: Trigger seller payout process
}

/**
 * Handle purchase-expired event
 */
async function handlePurchaseExpired(
  event: PurchaseExpiredEvent,
  context: any
): Promise<void> {
  logWebhookEvent('purchase-expired', event, context);

  // TODO: Mark purchase as expired in database
  // TODO: Notify buyer that payment window expired
  // TODO: Make listing available again
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
