/**
 * Type definitions for Chainhook webhook payloads
 * Based on Chainhook's event structure and BitPay contract events
 */

// ============================================================================
// Core Chainhook Types
// ============================================================================

export interface ChainhookEvent {
  type: string;
  data: {
    contract_identifier: string;
    topic: string;
    value: any;
  };
}

export interface ChainhookTransactionIdentifier {
  hash: string;
}

export interface ChainhookTransaction {
  transaction_identifier: ChainhookTransactionIdentifier;
  operations: any[];
  metadata: {
    success: boolean;
    raw_tx: string;
    result?: string;
    sender: string;
    fee: number;
    kind?: {
      type: string;
      data: any;
    };
    receipt?: {
      events?: ChainhookEvent[];
      mutated_contracts_radius?: string[];
      mutated_assets_radius?: string[];
    };
    events?: ChainhookEvent[];
  };
}

export interface ChainhookBlockIdentifier {
  index: number;
  hash: string;
}

export interface ChainhookBlock {
  block_identifier: ChainhookBlockIdentifier;
  parent_block_identifier: ChainhookBlockIdentifier;
  timestamp: number;
  transactions: ChainhookTransaction[];
  metadata: {
    bitcoin_anchor_block_identifier?: ChainhookBlockIdentifier;
    pox_cycle_index?: number;
    pox_cycle_position?: number;
    pox_cycle_length?: number;
    stacks_block_hash?: string;
  };
}

export interface ChainhookPayload {
  apply: ChainhookBlock[];
  rollback: ChainhookBlock[];
  chainhook: {
    uuid: string;
    predicate: any;
  };
}

// ============================================================================
// BitPay Core Stream Events
// ============================================================================

export interface StreamCreatedEvent {
  event: 'stream-created';
  'stream-id': bigint | number;
  sender: string;
  recipient: string;
  amount: bigint | number;
  'start-block': bigint | number;
  'end-block': bigint | number;
}

export interface StreamWithdrawalEvent {
  event: 'stream-withdrawal';
  'stream-id': bigint | number;
  recipient: string;
  amount: bigint | number;
}

export interface StreamCancelledEvent {
  event: 'stream-cancelled';
  'stream-id': bigint | number;
  sender: string;
  'unvested-returned': bigint | number;
  'vested-paid': bigint | number;
  'cancelled-at-block': bigint | number;
}

export interface StreamSenderUpdatedEvent {
  event: 'stream-sender-updated';
  'stream-id': bigint | number;
  'old-sender': string;
  'new-sender': string;
  recipient: string;
}

export type CoreStreamEvent =
  | StreamCreatedEvent
  | StreamWithdrawalEvent
  | StreamCancelledEvent
  | StreamSenderUpdatedEvent;

// ============================================================================
// BitPay Marketplace Events
// ============================================================================

export interface DirectPurchaseCompletedEvent {
  event: 'direct-purchase-completed';
  'stream-id': bigint | number;
  seller: string;
  buyer: string;
  price: bigint | number;
  'marketplace-fee': bigint | number;
  'sale-id': bigint | number;
}

export interface PurchaseInitiatedEvent {
  event: 'purchase-initiated';
  'stream-id': bigint | number;
  seller: string;
  buyer: string;
  'payment-id': string;
  'initiated-at': bigint | number;
  'expires-at': bigint | number;
}

export interface GatewayPurchaseCompletedEvent {
  event: 'gateway-purchase-completed';
  'stream-id': bigint | number;
  seller: string;
  buyer: string;
  price: bigint | number;
  'marketplace-fee': bigint | number;
  'payment-id': string;
  'sale-id': bigint | number;
}

export interface PurchaseExpiredEvent {
  event: 'purchase-expired';
  'stream-id': bigint | number;
  buyer: string;
  'payment-id': string;
}

export interface BackendAuthorizedEvent {
  event: 'backend-authorized';
  backend: string;
  'authorized-by': string;
}

export interface BackendDeauthorizedEvent {
  event: 'backend-deauthorized';
  backend: string;
  'deauthorized-by': string;
}

export interface MarketplaceFeeUpdatedEvent {
  event: 'marketplace-fee-updated';
  'old-fee': bigint | number;
  'new-fee': bigint | number;
  'updated-by': string;
}

export type MarketplaceEvent =
  | DirectPurchaseCompletedEvent
  | PurchaseInitiatedEvent
  | GatewayPurchaseCompletedEvent
  | PurchaseExpiredEvent
  | BackendAuthorizedEvent
  | BackendDeauthorizedEvent
  | MarketplaceFeeUpdatedEvent;

// ============================================================================
// BitPay Treasury Events
// ============================================================================

export interface CancellationFeeCollectedEvent {
  event: 'cancellation-fee-collected';
  'stream-id': bigint | number;
  amount: bigint | number;
  'collected-from': string;
}

export interface MarketplaceFeeCollectedEvent {
  event: 'marketplace-fee-collected';
  'stream-id': bigint | number;
  amount: bigint | number;
  'collected-from': string;
}

export interface AdminTransferProposedEvent {
  event: 'admin-transfer-proposed';
  'current-admin': string;
  'new-admin': string;
  'proposed-at': bigint | number;
}

export interface AdminTransferCompletedEvent {
  event: 'admin-transfer-completed';
  'old-admin': string;
  'new-admin': string;
  'completed-at': bigint | number;
}

export interface AdminTransferCancelledEvent {
  event: 'admin-transfer-cancelled';
  admin: string;
  'cancelled-at': bigint | number;
}

export interface WithdrawalProposedEvent {
  event: 'withdrawal-proposed';
  'proposal-id': bigint | number;
  proposer: string;
  recipient: string;
  amount: bigint | number;
  'proposed-at': bigint | number;
  'timelock-expires': bigint | number;
}

export interface WithdrawalApprovedEvent {
  event: 'withdrawal-approved';
  'proposal-id': bigint | number;
  approver: string;
  'approval-count': bigint | number;
}

export interface WithdrawalExecutedEvent {
  event: 'withdrawal-executed';
  'proposal-id': bigint | number;
  recipient: string;
  amount: bigint | number;
  'executed-at': bigint | number;
}

export interface AddAdminProposedEvent {
  event: 'add-admin-proposed';
  'proposal-id': bigint | number;
  proposer: string;
  'new-admin': string;
  'proposed-at': bigint | number;
}

export interface RemoveAdminProposedEvent {
  event: 'remove-admin-proposed';
  'proposal-id': bigint | number;
  proposer: string;
  'admin-to-remove': string;
  'proposed-at': bigint | number;
}

export interface AdminProposalApprovedEvent {
  event: 'admin-proposal-approved';
  'proposal-id': bigint | number;
  approver: string;
  'approval-count': bigint | number;
}

export interface AdminProposalExecutedEvent {
  event: 'admin-proposal-executed';
  'proposal-id': bigint | number;
  'proposal-type': string;
  'executed-at': bigint | number;
}

export type TreasuryEvent =
  | CancellationFeeCollectedEvent
  | MarketplaceFeeCollectedEvent
  | AdminTransferProposedEvent
  | AdminTransferCompletedEvent
  | AdminTransferCancelledEvent
  | WithdrawalProposedEvent
  | WithdrawalApprovedEvent
  | WithdrawalExecutedEvent
  | AddAdminProposedEvent
  | RemoveAdminProposedEvent
  | AdminProposalApprovedEvent
  | AdminProposalExecutedEvent;

// ============================================================================
// BitPay Access Control Events
// ============================================================================

export interface ContractAuthorizedEvent {
  event: 'contract-authorized';
  contract: string;
  'authorized-by': string;
}

export interface ContractRevokedEvent {
  event: 'contract-revoked';
  contract: string;
  'revoked-by': string;
}

export interface ProtocolPausedEvent {
  event: 'protocol-paused';
  'paused-by': string;
  'paused-at': bigint | number;
}

export interface ProtocolUnpausedEvent {
  event: 'protocol-unpaused';
  'unpaused-by': string;
  'unpaused-at': bigint | number;
}

export interface AccessControlAdminTransferInitiatedEvent {
  event: 'admin-transfer-initiated';
  'current-admin': string;
  'new-admin': string;
  'initiated-at': bigint | number;
}

export interface AccessControlAdminTransferCompletedEvent {
  event: 'admin-transfer-completed';
  'old-admin': string;
  'new-admin': string;
  'completed-at': bigint | number;
}

export type AccessControlEvent =
  | ContractAuthorizedEvent
  | ContractRevokedEvent
  | ProtocolPausedEvent
  | ProtocolUnpausedEvent
  | AccessControlAdminTransferInitiatedEvent
  | AccessControlAdminTransferCompletedEvent;

// ============================================================================
// NFT Events
// ============================================================================

export interface ObligationTransferredEvent {
  event: 'obligation-transferred';
  'token-id': bigint | number;
  from: string;
  to: string;
}

export interface ObligationMintedEvent {
  event: 'obligation-minted';
  'token-id': bigint | number;
  recipient: string;
}

export type NFTEvent = ObligationTransferredEvent | ObligationMintedEvent;

// ============================================================================
// Union Type for All Events
// ============================================================================

export type BitPayEvent =
  | CoreStreamEvent
  | MarketplaceEvent
  | TreasuryEvent
  | AccessControlEvent
  | NFTEvent;

// ============================================================================
// Webhook Processing Context
// ============================================================================

export interface WebhookContext {
  txHash: string;
  blockHeight: number;
  blockHash: string;
  timestamp: number;
  sender: string;
  contractIdentifier: string;
}

export interface ProcessedWebhookResult {
  success: boolean;
  eventType: string;
  processed: number;
  errors?: string[];
}
