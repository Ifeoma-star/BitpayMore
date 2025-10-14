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
import { notifyWithdrawalProposal } from '@/lib/notifications/notification-service';
import connectToDatabase from '@/lib/db';
import * as NotificationService from '@/lib/notifications/notification-service';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  uintCV,
} from '@stacks/transactions';
import { getStacksNetwork, BITPAY_DEPLOYER_ADDRESS, CONTRACT_NAMES } from '@/lib/contracts/config';

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
      
      // Fetch treasury admins and threshold from contract
      const adminList = await getTreasuryAdmins();
      const proposalThreshold = await getTreasuryThreshold();

      // Notify all treasury admins about the new proposal
      await notifyWithdrawalProposal({
        proposalId: event['proposal-id'].toString(),
        proposer: event.proposer,
        recipient: event.recipient,
        amount: event.amount.toString(),
        timelockExpires: event['timelock-expires'].toString(),
        requiredApprovals: proposalThreshold,
        currentApprovals: 0,
        adminList,
        txHash: context.txHash,
      }).catch((err) => {
        console.error('Failed to send withdrawal proposal notification:', err);
      });
      break;

    case 'withdrawal-approved':
      await saveWithdrawalApproval({
        proposalId: event['proposal-id'].toString(),
        approver: event.approver,
        approvalCount: event['approval-count'].toString(),
        context,
      });

      // Check if threshold reached
      const approvalThreshold = await getTreasuryThreshold();
      const approvalCount = parseInt(event['approval-count'].toString());

      if (approvalCount >= approvalThreshold) {
        // Threshold reached - notify proposer they can execute
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (db) {
          const proposal = await db.collection('treasury_proposals').findOne({
            proposalId: event['proposal-id'].toString(),
          });

          if (proposal) {
            await NotificationService.createNotification(
              proposal.proposer,
              'withdrawal_approved',
              '✅ Withdrawal Ready to Execute',
              `Proposal #${event['proposal-id']} has reached the approval threshold (${approvalCount}/${approvalThreshold}). You can now execute the withdrawal.`,
              {
                proposalId: event['proposal-id'].toString(),
                approvalCount,
                threshold: approvalThreshold,
                txHash: context.txHash,
              },
              {
                priority: 'high',
                actionUrl: `/dashboard/treasury/proposals/${event['proposal-id']}`,
                actionText: 'Execute Withdrawal',
              }
            );
          }
        }
      } else {
        // Still needs more approvals
        await NotificationService.createNotification(
          event.approver,
          'withdrawal_approved',
          '✅ Approval Recorded',
          `Your approval for proposal #${event['proposal-id']} has been recorded (${approvalCount}/${approvalThreshold}).`,
          {
            proposalId: event['proposal-id'].toString(),
            approvalCount,
            threshold: approvalThreshold,
            txHash: context.txHash,
          },
          {
            priority: 'normal',
            actionUrl: `/dashboard/treasury/proposals/${event['proposal-id']}`,
            actionText: 'View Proposal',
          }
        );
      }
      break;

    case 'withdrawal-executed':
      console.log(`💸 Withdrawal executed: ${event['proposal-id']}`);

      const mongoose = await connectToDatabase();
      const db = mongoose.connection.db;

      // Mark proposal as executed
      if (db) {
        await db.collection('treasury_proposals').updateOne(
          { proposalId: event['proposal-id'].toString() },
          {
            $set: {
              status: 'executed',
              executedAt: new Date(context.timestamp * 1000),
              executedTxHash: context.txHash,
            },
          }
        );

        // Notify all admins
        const admins = await getTreasuryAdmins();
        for (const admin of admins) {
          await NotificationService.createNotification(
            admin,
            'withdrawal_executed',
            '💸 Withdrawal Executed',
            `Treasury withdrawal proposal #${event['proposal-id']} has been executed.`,
            {
              proposalId: event['proposal-id'].toString(),
              txHash: context.txHash,
            },
            {
              priority: 'high',
              actionUrl: `/dashboard/treasury`,
              actionText: 'View Treasury',
            }
          );
        }
      }
      break;

    case 'add-admin-proposed':
    case 'remove-admin-proposed':
      console.log(`👥 Admin proposal: ${event.event}`);

      const adminsList = await getTreasuryAdmins();
      for (const admin of adminsList) {
        await NotificationService.createNotification(
          admin,
          'admin_action_required',
          '👥 Admin Management Proposal',
          `A new admin management proposal has been created. Action required.`,
          {
            event: event.event,
            txHash: context.txHash,
          },
          {
            priority: 'high',
            actionUrl: `/dashboard/treasury/admin-proposals`,
            actionText: 'Review Proposal',
          }
        );
      }
      break;

    case 'admin-proposal-approved':
      console.log(`👥 Admin proposal approved: ${event.event}`);
      break;

    case 'admin-proposal-executed':
      console.log(`👥 Admin proposal executed: ${event.event}`);

      const allAdmins = await getTreasuryAdmins();
      for (const admin of allAdmins) {
        await NotificationService.createNotification(
          admin,
          'admin_action_required',
          '✅ Admin Proposal Executed',
          `An admin management proposal has been executed.`,
          {
            event: event.event,
            txHash: context.txHash,
          },
          {
            priority: 'high',
            actionUrl: `/dashboard/treasury`,
            actionText: 'View Treasury',
          }
        );
      }
      break;

    case 'admin-transfer-proposed':
    case 'admin-transfer-completed':
    case 'admin-transfer-cancelled':
      console.log(`🔑 Admin transfer event: ${event.event}`);

      const treasuryAdmins = await getTreasuryAdmins();
      for (const admin of treasuryAdmins) {
        await NotificationService.createNotification(
          admin,
          'admin_transfer',
          `🔑 ${event.event.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
          `Treasury ownership transfer event: ${event.event}`,
          {
            event: event.event,
            txHash: context.txHash,
          },
          {
            priority: 'urgent',
            actionUrl: `/dashboard/treasury`,
            actionText: 'View Details',
          }
        );
      }
      break;

    default:
      console.warn(`Unknown treasury event: ${(event as any).event}`);
  }
}

/**
 * Get treasury admins from contract
 */
async function getTreasuryAdmins(): Promise<string[]> {
  try {
    const network = getStacksNetwork();
    const result = await fetchCallReadOnlyFunction({
      contractAddress: BITPAY_DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAMES.TREASURY,
      functionName: 'get-admins',
      functionArgs: [],
      network,
      senderAddress: BITPAY_DEPLOYER_ADDRESS,
    });

    const adminsValue = cvToValue(result);
    if (Array.isArray(adminsValue)) {
      return adminsValue.map((admin: any) => admin.value || admin);
    }

    // Fallback to deployer address
    return [BITPAY_DEPLOYER_ADDRESS];
  } catch (error) {
    console.error('Failed to fetch treasury admins:', error);
    return [BITPAY_DEPLOYER_ADDRESS];
  }
}

/**
 * Get treasury approval threshold from contract
 */
async function getTreasuryThreshold(): Promise<number> {
  try {
    const network = getStacksNetwork();
    const result = await fetchCallReadOnlyFunction({
      contractAddress: BITPAY_DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAMES.TREASURY,
      functionName: 'get-approval-threshold',
      functionArgs: [],
      network,
      senderAddress: BITPAY_DEPLOYER_ADDRESS,
    });

    const thresholdValue = cvToValue(result);
    if (typeof thresholdValue === 'number') {
      return thresholdValue;
    }
    if (typeof thresholdValue === 'bigint') {
      return Number(thresholdValue);
    }

    // Default to 3 for 3-of-5 multisig
    return 3;
  } catch (error) {
    console.error('Failed to fetch treasury threshold:', error);
    return 3;
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
