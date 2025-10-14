/**
 * BitPay Smart Contract Configuration
 * Deployed contract addresses and network settings
 */

import { StacksNetwork, STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

export const getStacksNetwork = (): StacksNetwork => {
  return NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

// API URLs
export const STACKS_API_URL = NETWORK === 'mainnet'
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

// Contract deployer address (from testnet deployment)
export const BITPAY_DEPLOYER_ADDRESS = process.env.NEXT_PUBLIC_BITPAY_DEPLOYER_ADDRESS || 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7';

// sBTC Token contract (from testnet deployment)
export const SBTC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SBTC_TOKEN_ADDRESS || 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
export const SBTC_TOKEN_CONTRACT = 'sbtc-token';

// BitPay Contract Names (V2 - Deployed on Testnet)
export const CONTRACT_NAMES = {
  CORE: 'bitpay-core-v2',
  ACCESS_CONTROL: 'bitpay-access-control-v2',
  SBTC_HELPER: 'bitpay-sbtc-helper-v2',
  NFT: 'bitpay-nft-v2',
  OBLIGATION_NFT: 'bitpay-obligation-nft-v2',
  TREASURY: 'bitpay-treasury-v2',
  MARKETPLACE: 'bitpay-marketplace-v2',
} as const;

// Full contract identifiers
export const CONTRACTS = {
  CORE: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.CORE}`,
  ACCESS_CONTROL: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.ACCESS_CONTROL}`,
  SBTC_HELPER: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.SBTC_HELPER}`,
  NFT: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.NFT}`,
  OBLIGATION_NFT: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.OBLIGATION_NFT}`,
  TREASURY: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.TREASURY}`,
  MARKETPLACE: `${BITPAY_DEPLOYER_ADDRESS}.${CONTRACT_NAMES.MARKETPLACE}`,
  SBTC_TOKEN: `${SBTC_TOKEN_ADDRESS}.${SBTC_TOKEN_CONTRACT}`,
} as const;

// Contract function names
export const CORE_FUNCTIONS = {
  // Write functions
  CREATE_STREAM: 'create-stream',
  WITHDRAW_FROM_STREAM: 'withdraw-from-stream',
  CANCEL_STREAM: 'cancel-stream',

  // Read functions
  GET_STREAM: 'get-stream',
  GET_SENDER_STREAMS: 'get-sender-streams',
  GET_RECIPIENT_STREAMS: 'get-recipient-streams',
  GET_VESTED_AMOUNT: 'get-vested-amount',
  GET_VESTED_AMOUNT_AT_BLOCK: 'get-vested-amount-at-block',
  GET_WITHDRAWABLE_AMOUNT: 'get-withdrawable-amount',
  GET_NEXT_STREAM_ID: 'get-next-stream-id',
  IS_STREAM_ACTIVE: 'is-stream-active',
} as const;

export const NFT_FUNCTIONS = {
  // Write functions
  MINT: 'mint',
  TRANSFER: 'transfer',
  BURN: 'burn',

  // Read functions
  GET_OWNER: 'get-owner',
  GET_LAST_TOKEN_ID: 'get-last-token-id',
  GET_TOKEN_URI: 'get-token-uri',
} as const;

export const TREASURY_FUNCTIONS = {
  // Write functions
  COLLECT_FEE: 'collect-fee',
  WITHDRAW: 'withdraw',
  SET_FEE_BPS: 'set-fee-bps',

  // Read functions
  GET_TREASURY_BALANCE: 'get-treasury-balance',
  GET_FEE_BPS: 'get-fee-bps',
  GET_TOTAL_FEES_COLLECTED: 'get-total-fees-collected',
} as const;

export const ACCESS_CONTROL_FUNCTIONS = {
  // Write functions
  ADD_ADMIN: 'add-admin',
  REMOVE_ADMIN: 'remove-admin',
  PAUSE_PROTOCOL: 'pause-protocol',
  UNPAUSE_PROTOCOL: 'unpause-protocol',

  // Read functions
  IS_ADMIN: 'is-admin',
  IS_PAUSED: 'is-paused',
} as const;

export const SBTC_HELPER_FUNCTIONS = {
  // Write functions
  TRANSFER_TO_VAULT: 'transfer-to-vault',
  TRANSFER_FROM_VAULT: 'transfer-from-vault',

  // Read functions
  GET_VAULT_BALANCE: 'get-vault-balance',
  GET_USER_BALANCE: 'get-user-balance',
} as const;

// Stream status enum
export enum StreamStatus {
  PENDING = 'pending',      // start-block > current-block
  ACTIVE = 'active',        // start-block <= current-block < end-block && !cancelled
  COMPLETED = 'completed',  // current-block >= end-block && !cancelled
  CANCELLED = 'cancelled',  // cancelled = true
}

// Type definitions for contract responses
export interface StreamData {
  sender: string;
  recipient: string;
  amount: bigint;
  'start-block': bigint;
  'end-block': bigint;
  withdrawn: bigint;
  cancelled: boolean;
  'cancelled-at-block': bigint | null;
}

export interface StreamWithId extends StreamData {
  id: bigint;
  status: StreamStatus;
  vestedAmount: bigint;
  withdrawableAmount: bigint;
}

// Utility: Convert micro-STX/sats to display format
export const microToDisplay = (micro: bigint | string): string => {
  const value = typeof micro === 'string' ? BigInt(micro) : micro;
  const btc = Number(value) / 1_000_000;
  return btc.toFixed(6);
};

// Utility: Convert display format to micro-STX/sats
export const displayToMicro = (display: number | string): bigint => {
  const value = typeof display === 'string' ? parseFloat(display) : display;
  return BigInt(Math.floor(value * 1_000_000));
};

// Block time constants (Stacks blocks are ~10 minutes on Bitcoin)
export const BLOCKS_PER_HOUR = 6;
export const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24; // ~144 blocks
export const BLOCKS_PER_WEEK = BLOCKS_PER_DAY * 7;
export const BLOCKS_PER_MONTH = BLOCKS_PER_DAY * 30;

// Calculate stream status from block heights
export const getStreamStatus = (
  startBlock: bigint,
  endBlock: bigint,
  currentBlock: bigint,
  cancelled: boolean
): StreamStatus => {
  if (cancelled) return StreamStatus.CANCELLED;
  if (currentBlock < startBlock) return StreamStatus.PENDING;
  if (currentBlock >= endBlock) return StreamStatus.COMPLETED;
  return StreamStatus.ACTIVE;
};

// Calculate vested amount (same logic as contract)
export const calculateVestedAmount = (
  stream: StreamData,
  currentBlock: bigint
): bigint => {
  const { amount, 'start-block': startBlock, 'end-block': endBlock, cancelled } = stream;

  // Before start: nothing vested
  if (currentBlock < startBlock) return BigInt(0);

  // After end or cancelled: everything vested
  if (currentBlock >= endBlock || cancelled) return amount;

  // During stream: linear vesting
  const elapsed = currentBlock - startBlock;
  const duration = endBlock - startBlock;
  return (amount * elapsed) / duration;
};

// Calculate withdrawable amount
export const calculateWithdrawableAmount = (
  stream: StreamData,
  currentBlock: bigint
): bigint => {
  const vested = calculateVestedAmount(stream, currentBlock);
  return vested - stream.withdrawn;
};

// Calculate stream progress percentage
export const calculateProgress = (
  startBlock: bigint,
  endBlock: bigint,
  currentBlock: bigint
): number => {
  if (currentBlock < startBlock) return 0;
  if (currentBlock >= endBlock) return 100;

  const elapsed = Number(currentBlock - startBlock);
  const duration = Number(endBlock - startBlock);
  return (elapsed / duration) * 100;
};
