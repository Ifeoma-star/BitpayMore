/**
 * POST /api/webhooks/chainhook/treasury
 * Handles BitPay Treasury multi-sig events from Chainhook
 * Events: fee-collected, withdrawal-proposed/approved/executed, admin-proposals
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  TreasuryEvent,
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
  saveFeeCollected,
  saveWithdrawalProposal,
  saveWithdrawalApproval,
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

    console.log('📨 Treasury events webhook received:', {
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
          const blockResult = await processTreasuryBlock(block);
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
      eventType: 'treasury-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Treasury webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for treasury events
 */
async function processTreasuryBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`🏦 Processing treasury events from block ${block.block_identifier.index}`);

  for (const tx of block.transactions) {
    if (!tx.metadata.success) {
      continue;
    }

    const printEvents = extractPrintEvents(tx);

    for (const event of printEvents) {
      const eventData = parseEventData<TreasuryEvent>(event);
      if (!eventData) {
        continue;
      }

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      try {
        await handleTreasuryEvent(eventData, context);
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
 * Route treasury events to appropriate handlers
 */
async function handleTreasuryEvent(
  event: TreasuryEvent,
  context: any
): Promise<void> {
  logWebhookEvent(event.event, event, context);

  switch (event.event) {
    case 'cancellation-fee-collected':
      await saveFeeCollected({
        streamId: event['stream-id'].toString(),
        amount: event.amount.toString(),
        collectedFrom: event['collected-from'],
        feeType: 'cancellation',
        context,
      });
      break;

    case 'marketplace-fee-collected':
      await saveFeeCollected({
        streamId: event['stream-id'].toString(),
        amount: event.amount.toString(),
        collectedFrom: event['collected-from'],
        feeType: 'marketplace',
        context,
      });
      break;

    case 'withdrawal-proposed':
      await saveWithdrawalProposal({
        proposalId: event['proposal-id'].toString(),
        proposer: event.proposer,
        recipient: event.recipient,
        amount: event.amount.toString(),
        proposedAt: event['proposed-at'].toString(),
        timelockExpires: event['timelock-expires'].toString(),
        context,
      });
      // TODO: Notify other admins to approve
      break;

    case 'withdrawal-approved':
      await saveWithdrawalApproval({
        proposalId: event['proposal-id'].toString(),
        approver: event.approver,
        approvalCount: event['approval-count'].toString(),
        context,
      });
      // TODO: Check if threshold reached, notify proposer
      break;

    case 'withdrawal-executed':
      // TODO: Mark proposal as executed, notify all admins
      console.log(`💸 Withdrawal executed: ${event['proposal-id']}`);
      break;

    case 'add-admin-proposed':
    case 'remove-admin-proposed':
    case 'admin-proposal-approved':
    case 'admin-proposal-executed':
      // TODO: Handle admin management events
      console.log(`👥 Admin event: ${event.event}`);
      break;

    case 'admin-transfer-proposed':
    case 'admin-transfer-completed':
    case 'admin-transfer-cancelled':
      // TODO: Handle ownership transfer events
      console.log(`🔑 Admin transfer event: ${event.event}`);
      break;

    default:
      console.warn(`Unknown treasury event: ${(event as any).event}`);
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay Treasury Events webhook endpoint',
    status: 'active',
    events: [
      'cancellation-fee-collected',
      'marketplace-fee-collected',
      'withdrawal-proposed',
      'withdrawal-approved',
      'withdrawal-executed',
      'add-admin-proposed',
      'remove-admin-proposed',
      'admin-proposal-approved',
      'admin-proposal-executed',
      'admin-transfer-proposed',
      'admin-transfer-completed',
      'admin-transfer-cancelled',
    ],
  });
}
