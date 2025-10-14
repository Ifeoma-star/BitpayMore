/**
 * POST /api/webhooks/chainhook/nft
 * Handles BitPay NFT events from Chainhook
 * Events: obligation-transferred, obligation-minted, recipient NFT mint/burn
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  NFTEvent,
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

    console.log('📨 NFT events webhook received:', {
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
          const blockResult = await processNFTBlock(block);
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
      eventType: 'nft-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ NFT webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for NFT events
 */
async function processNFTBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`🎨 Processing NFT events from block ${block.block_identifier.index}`);

  for (const tx of block.transactions) {
    if (!tx.metadata.success) {
      continue;
    }

    // Handle both print events and NFT events
    const printEvents = extractPrintEvents(tx);
    const nftEvents = tx.metadata.events?.filter((e) => e.type === 'nft_event') || [];

    // Process obligation NFT print events (transfers, mints)
    for (const event of printEvents) {
      const eventData = parseEventData<NFTEvent>(event);
      if (!eventData) {
        continue;
      }

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      logWebhookEvent(eventData.event, eventData, context);
      await handleNFTEvent(eventData, context);
      processed++;
    }

    // Process recipient NFT events (mint/burn from Stacks)
    for (const event of nftEvents) {
      const context = getWebhookContext(tx, block);
      logWebhookEvent('nft_event', event, context);
      // TODO: Handle recipient NFT mint/burn
      processed++;
    }
  }

  return processed;
}

/**
 * Handle NFT events
 */
async function handleNFTEvent(
  event: NFTEvent,
  context: any
): Promise<void> {
  switch (event.event) {
    case 'obligation-transferred':
      console.log(`🔄 Obligation NFT #${event['token-id']} transferred: ${event.from} → ${event.to}`);
      // TODO: Update NFT ownership in database
      // TODO: Notify both parties
      // TODO: Update marketplace if listed
      break;

    case 'obligation-minted':
      console.log(`✨ Obligation NFT #${event['token-id']} minted to ${event.recipient}`);
      // TODO: Create NFT record in database
      // TODO: Notify recipient
      break;

    default:
      console.warn(`Unknown NFT event: ${(event as any).event}`);
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay NFT Events webhook endpoint',
    status: 'active',
    events: [
      'obligation-transferred',
      'obligation-minted',
      'recipient-nft-minted',
      'recipient-nft-burned',
    ],
  });
}
