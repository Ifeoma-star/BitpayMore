/**
 * POST /api/webhooks/chainhook/streams
 * Handles BitPay Core stream events from Chainhook
 * Events: stream-created, stream-withdrawal, stream-cancelled, stream-sender-updated
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  ChainhookTransaction,
  CoreStreamEvent,
  StreamCreatedEvent,
  StreamWithdrawalEvent,
  StreamCancelledEvent,
  StreamSenderUpdatedEvent,
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
  normalizeBigIntValues,
} from '@/lib/webhooks/chainhook-utils';
import {
  saveStreamCreated,
  saveStreamWithdrawal,
  saveStreamCancelled,
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

    console.log('📨 Stream events webhook received:', {
      apply: payload.apply?.length || 0,
      rollback: payload.rollback?.length || 0,
      uuid: payload.chainhook?.uuid,
    });

    let processedCount = 0;
    const errors: string[] = [];

    // Handle rollbacks (blockchain reorgs)
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
          const blockResult = await processStreamBlock(block);
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
      eventType: 'stream-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Stream webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for stream events
 */
async function processStreamBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`📦 Processing stream events from block ${block.block_identifier.index}`);

  for (const tx of block.transactions) {
    if (!tx.metadata.success) {
      console.log(`⏭️ Skipping failed transaction ${tx.transaction_identifier.hash}`);
      continue;
    }

    const printEvents = extractPrintEvents(tx);

    for (const event of printEvents) {
      const eventData = parseEventData<CoreStreamEvent>(event);
      if (!eventData) {
        console.warn('Failed to parse event data');
        continue;
      }

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      try {
        await handleStreamEvent(eventData, context);
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
 * Route stream events to appropriate handlers
 */
async function handleStreamEvent(
  event: CoreStreamEvent,
  context: any
): Promise<void> {
  switch (event.event) {
    case 'stream-created':
      await handleStreamCreated(event, context);
      break;

    case 'stream-withdrawal':
      await handleStreamWithdrawal(event, context);
      break;

    case 'stream-cancelled':
      await handleStreamCancelled(event, context);
      break;

    case 'stream-sender-updated':
      await handleStreamSenderUpdated(event, context);
      break;

    default:
      console.warn(`Unknown stream event: ${(event as any).event}`);
  }
}

/**
 * Handle stream-created event
 */
async function handleStreamCreated(
  event: StreamCreatedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-created', event, context);

  await saveStreamCreated({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient: event.recipient,
    amount: event.amount.toString(),
    startBlock: event['start-block'].toString(),
    endBlock: event['end-block'].toString(),
    context,
  });

  // TODO: Send notification to recipient
  // TODO: Trigger real-time UI update via WebSocket
}

/**
 * Handle stream-withdrawal event
 */
async function handleStreamWithdrawal(
  event: StreamWithdrawalEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-withdrawal', event, context);

  await saveStreamWithdrawal({
    streamId: event['stream-id'].toString(),
    recipient: event.recipient,
    amount: event.amount.toString(),
    context,
  });

  // TODO: Send notification to sender and recipient
  // TODO: Trigger real-time UI update via WebSocket
}

/**
 * Handle stream-cancelled event
 */
async function handleStreamCancelled(
  event: StreamCancelledEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-cancelled', event, context);

  await saveStreamCancelled({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    unvestedReturned: event['unvested-returned'].toString(),
    vestedPaid: event['vested-paid'].toString(),
    cancelledAtBlock: event['cancelled-at-block'].toString(),
    context,
  });

  // TODO: Send notification to sender and recipient
  // TODO: Trigger real-time UI update via WebSocket
}

/**
 * Handle stream-sender-updated event
 */
async function handleStreamSenderUpdated(
  event: StreamSenderUpdatedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-sender-updated', event, context);

  // TODO: Update stream ownership in database
  // TODO: Send notification to old and new sender
  // TODO: Trigger real-time UI update via WebSocket
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay Stream Events webhook endpoint',
    status: 'active',
    events: [
      'stream-created',
      'stream-withdrawal',
      'stream-cancelled',
      'stream-sender-updated',
    ],
  });
}
