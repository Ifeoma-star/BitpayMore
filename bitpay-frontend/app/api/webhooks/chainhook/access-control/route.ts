/**
 * POST /api/webhooks/chainhook/access-control
 * Handles BitPay Access Control events from Chainhook
 * Events: contract-authorized, protocol-paused, admin-transfer
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  AccessControlEvent,
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

    console.log('📨 Access control events webhook received:', {
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
          const blockResult = await processAccessControlBlock(block);
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
      eventType: 'access-control-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Access control webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for access control events
 */
async function processAccessControlBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`🔐 Processing access control events from block ${block.block_identifier.index}`);

  for (const tx of block.transactions) {
    if (!tx.metadata.success) {
      continue;
    }

    const printEvents = extractPrintEvents(tx);

    for (const event of printEvents) {
      const eventData = parseEventData<AccessControlEvent>(event);
      if (!eventData) {
        continue;
      }

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      logWebhookEvent(eventData.event, eventData, context);

      // Handle critical security events
      await handleAccessControlEvent(eventData, context);
      processed++;
    }
  }

  return processed;
}

/**
 * Handle access control events
 */
async function handleAccessControlEvent(
  event: AccessControlEvent,
  context: any
): Promise<void> {
  switch (event.event) {
    case 'contract-authorized':
      console.log(`✅ Contract authorized: ${event.contract}`);
      // TODO: Update authorized contracts list
      // TODO: Send alert to admins
      break;

    case 'contract-revoked':
      console.log(`❌ Contract revoked: ${event.contract}`);
      // TODO: Update authorized contracts list
      // TODO: Send critical alert to admins
      break;

    case 'protocol-paused':
      console.warn(`⚠️ PROTOCOL PAUSED by ${event['paused-by']}`);
      // TODO: Update system status
      // TODO: Send emergency alerts
      // TODO: Display banner on UI
      break;

    case 'protocol-unpaused':
      console.log(`✅ Protocol unpaused by ${event['unpaused-by']}`);
      // TODO: Update system status
      // TODO: Send notifications
      // TODO: Remove pause banner
      break;

    case 'admin-transfer-initiated':
      console.log(`🔑 Admin transfer initiated: ${event['current-admin']} → ${event['new-admin']}`);
      // TODO: Send notification to both admins
      break;

    case 'admin-transfer-completed':
      console.log(`✅ Admin transfer completed: ${event['old-admin']} → ${event['new-admin']}`);
      // TODO: Update admin records
      // TODO: Send confirmation
      break;

    default:
      console.warn(`Unknown access control event: ${(event as any).event}`);
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay Access Control Events webhook endpoint',
    status: 'active',
    events: [
      'contract-authorized',
      'contract-revoked',
      'protocol-paused',
      'protocol-unpaused',
      'admin-transfer-initiated',
      'admin-transfer-completed',
    ],
  });
}
