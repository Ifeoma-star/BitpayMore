# BitPay React Hooks Documentation

Complete reference for all React hooks used to interact with BitPay smart contracts.

---

## 📚 Table of Contents

1. [Core Stream Hooks](#core-stream-hooks) - `use-bitpay-read.ts` & `use-bitpay-write.ts`
2. [Multi-Sig Treasury Hooks](#multi-sig-treasury-hooks) - `use-multisig-treasury.ts`
3. [Treasury Hooks](#treasury-hooks) - `use-treasury.ts`
4. [Marketplace Hooks](#marketplace-hooks) - `use-marketplace.ts`
5. [NFT Hooks](#nft-hooks) - `use-nft.ts`
6. [Access Control Hooks](#access-control-hooks) - `use-access-control.ts`
7. [Utility Hooks](#utility-hooks)

---

## Core Stream Hooks

### Read Hooks (`use-bitpay-read.ts`)

#### `useBitPayRead<T>(contractName, functionName, args, enabled)`
Generic hook for reading from any BitPay contract.

```typescript
const { data, isLoading, error, refetch } = useBitPayRead<number>(
  CONTRACT_NAMES.CORE,
  'get-next-stream-id',
  [],
  true
);
```

#### `useStream(streamId)`
Get detailed information about a specific stream.

```typescript
const { data: stream, isLoading, error, refetch } = useStream(streamId);

// Returns StreamWithId:
// - id, sender, recipient, amount
// - start-block, end-block, withdrawn
// - cancelled, cancelled-at-block
// - status (pending/active/completed/cancelled)
// - vestedAmount, withdrawableAmount
```

#### `useUserStreams(userAddress)`
Get all streams for a user (both sent and received).

```typescript
const { data: streams, isLoading, error, refetch } = useUserStreams(userAddress);

// Returns StreamWithId[] with calculated values
```

#### `useNextStreamId()`
Get the next available stream ID.

```typescript
const { data: nextId, isLoading } = useNextStreamId();
```

#### `useIsProtocolPaused()`
Check if the protocol is paused.

```typescript
const { data: isPaused, isLoading } = useIsProtocolPaused();
```

#### `useTreasuryFeeBps()`
Get current treasury fee in basis points.

```typescript
const { data: feeBps, isLoading } = useTreasuryFeeBps();
```

#### `useTotalFeesCollected()`
Get total fees collected by treasury.

```typescript
const { data: totalFees, isLoading } = useTotalFeesCollected();
```

### Write Hooks (`use-bitpay-write.ts`)

#### `useCreateStream()`
Create a new payment stream.

```typescript
const { write, txId, isLoading, error, reset } = useCreateStream();

await write(
  recipient,        // string (Stacks address)
  amount,          // number | string (in BTC, will convert to sats)
  startBlock,      // number
  endBlock         // number
);
```

#### `useWithdrawFromStream()`
Withdraw vested amount from a stream.

```typescript
const { write, txId, isLoading, error, reset } = useWithdrawFromStream();

await write(streamId); // number | bigint
```

#### `useCancelStream()`
Cancel an active stream.

```typescript
const { write, txId, isLoading, error, reset } = useCancelStream();

await write(streamId); // number | bigint
```

#### `useMintStreamNFT()`
Mint NFT for a stream.

```typescript
const { write, txId, isLoading, error, reset } = useMintStreamNFT();

await write(
  streamId,        // number | bigint
  recipient        // string (Stacks address)
);
```

---

## Multi-Sig Treasury Hooks

Location: `hooks/use-multisig-treasury.ts`

### Read Hooks

#### `useMultiSigConfig()`
Get multi-sig configuration.

```typescript
const { data: config, isLoading } = useMultiSigConfig();

// Returns MultiSigConfig:
// - requiredSignatures: number
// - totalSlots: number
// - timelockBlocks: number (24h = 144 blocks)
// - proposalExpiryBlocks: number
// - dailyLimit: bigint
// - withdrawnToday: bigint
// - lastWithdrawalBlock: number
```

#### `useWithdrawalProposal(proposalId)`
Get withdrawal proposal details.

```typescript
const { data: proposal, isLoading } = useWithdrawalProposal(proposalId);

// Returns WithdrawalProposal:
// - id, proposer, amount, recipient
// - approvals: string[]
// - executed: boolean
// - proposedAt, expiresAt
// - description: string
```

#### `useAdminProposal(proposalId)`
Get admin management proposal.

```typescript
const { data: proposal, isLoading } = useAdminProposal(proposalId);

// Returns AdminProposal:
// - id, proposer, action ('add' | 'remove')
// - targetAdmin, approvals, executed
// - proposedAt, expiresAt
```

#### `useIsMultiSigAdmin(address)`
Check if address is a multi-sig admin.

```typescript
const { data: isAdmin, isLoading } = useIsMultiSigAdmin(userAddress);
```

#### `useAdminCount()`
Get count of active multi-sig admins.

```typescript
const { data: count, isLoading } = useAdminCount();
```

#### `useNextProposalId()`
Get next proposal ID.

```typescript
const { data: nextId, isLoading } = useNextProposalId();
```

### Write Hooks

#### `useProposeWithdrawal()`
Propose a multi-sig withdrawal.

```typescript
const { propose, isLoading, error } = useProposeWithdrawal();

await propose(
  amount,          // bigint (in micro-units)
  recipient,       // string
  description      // string (max 256 chars)
);
```

#### `useApproveWithdrawal()`
Approve a withdrawal proposal.

```typescript
const { approve, isLoading, error } = useApproveWithdrawal();

await approve(proposalId); // number
```

#### `useExecuteWithdrawal()`
Execute an approved withdrawal (after timelock).

```typescript
const { execute, isLoading, error } = useExecuteWithdrawal();

await execute(proposalId); // number
```

#### `useProposeAddAdmin()`
Propose adding a new admin.

```typescript
const { proposeAdd, isLoading, error } = useProposeAddAdmin();

await proposeAdd(newAdminAddress); // string
```

#### `useProposeRemoveAdmin()`
Propose removing an admin.

```typescript
const { proposeRemove, isLoading, error } = useProposeRemoveAdmin();

await proposeRemove(adminAddress); // string
```

#### `useApproveAdminProposal()`
Approve an admin management proposal.

```typescript
const { approve, isLoading, error } = useApproveAdminProposal();

await approve(proposalId); // number
```

#### `useExecuteAdminProposal()`
Execute an admin management proposal.

```typescript
const { execute, isLoading, error } = useExecuteAdminProposal();

await execute(proposalId); // number
```

### Utility Hooks

#### `useHasTimelockElapsed(proposedAt, currentBlock)`
Check if timelock has elapsed.

```typescript
const hasElapsed = useHasTimelockElapsed(proposal.proposedAt, currentBlock);
```

#### `useHasProposalExpired(expiresAt, currentBlock)`
Check if proposal has expired.

```typescript
const hasExpired = useHasProposalExpired(proposal.expiresAt, currentBlock);
```

#### `useBlocksUntilTimelock(proposedAt, currentBlock)`
Calculate blocks until timelock elapses.

```typescript
const blocksRemaining = useBlocksUntilTimelock(proposal.proposedAt, currentBlock);
```

#### `useHasUserApproved(approvals, userAddress)`
Check if user has already approved.

```typescript
const hasApproved = useHasUserApproved(proposal.approvals, userAddress);
```

---

## Treasury Hooks

Location: `hooks/use-treasury.ts`

### Read Hooks

#### `useTreasuryBalance()`
Get current treasury balance.

```typescript
const { data: balance, isLoading } = useTreasuryBalance();
// Returns bigint (in micro-units)
```

#### `useTreasuryFeeBps()`
Get fee in basis points.

```typescript
const { data: feeBps, isLoading } = useTreasuryFeeBps();
// Returns number (100 bps = 1%)
```

#### `useTotalFeesCollected()`
Get total fees collected.

```typescript
const { data: totalFees, isLoading } = useTotalFeesCollected();
```

#### `useCancellationFeeBps()`
Get cancellation fee in basis points.

```typescript
const { data: cancelFeeBps, isLoading } = useCancellationFeeBps();
```

### Write Hooks

#### `useCollectFee()`
Collect fee (internal use by contracts).

```typescript
const { collectFee, isLoading, error } = useCollectFee();

await collectFee(amount, feeType); // bigint, string
```

#### `useWithdrawFromTreasury()`
Withdraw from treasury (admin only).

```typescript
const { withdraw, isLoading, error } = useWithdrawFromTreasury();

await withdraw(amount, recipient); // bigint, string
```

#### `useSetFeeBps()`
Set fee basis points (admin only).

```typescript
const { setFeeBps, isLoading, error } = useSetFeeBps();

await setFeeBps(newFeeBps); // number (0-10000)
```

#### `useSetCancellationFeeBps()`
Set cancellation fee (admin only).

```typescript
const { setCancellationFeeBps, isLoading, error } = useSetCancellationFeeBps();

await setCancellationFeeBps(newFeeBps); // number
```

### Utility Functions

```typescript
// Calculate fee from basis points
const fee = calculateFee(amount, feeBps);

// Calculate net amount after fee
const netAmount = calculateNetAmount(amount, feeBps);

// Convert basis points to percentage
const percentage = bpsToPercentage(100); // 1%

// Convert percentage to basis points
const bps = percentageToBps(1.5); // 150 bps

// Format fee for display
const formatted = formatFee(150); // "1.50%"

// Validate fee basis points
const isValid = isValidFeeBps(250); // true if 0-10000
```

---

## Marketplace Hooks

Location: `hooks/use-marketplace.ts`

### Read Hooks

#### `useListing(streamId)`
Get NFT listing details.

```typescript
const { data: listing, isLoading } = useListing(streamId);

// Returns Listing:
// - seller: string
// - price: bigint
// - listedAt: number
// - active: boolean
```

#### `usePendingPurchase(streamId)`
Get pending purchase details.

```typescript
const { data: purchase, isLoading } = usePendingPurchase(streamId);

// Returns PendingPurchase:
// - buyer, streamId, price
// - initiatedAt, expiresAt
```

#### `useMarketplaceFee()`
Get marketplace fee in basis points.

```typescript
const { data: feeBps, isLoading } = useMarketplaceFee();
```

#### `useIsBackendAuthorized(backend)`
Check if backend is authorized.

```typescript
const { data: isAuthorized, isLoading } = useIsBackendAuthorized(backendAddress);
```

### Write Hooks

#### `useListNFT()`
List an obligation NFT for sale.

```typescript
const { listNFT, isLoading, error } = useListNFT();

await listNFT(streamId, price); // number, bigint
```

#### `useUpdateListingPrice()`
Update listing price.

```typescript
const { updatePrice, isLoading, error } = useUpdateListingPrice();

await updatePrice(streamId, newPrice); // number, bigint
```

#### `useCancelListing()`
Cancel a listing.

```typescript
const { cancelListing, isLoading, error } = useCancelListing();

await cancelListing(streamId); // number
```

#### `useBuyNFT()`
Buy NFT directly (instant purchase).

```typescript
const { buyNFT, isLoading, error } = useBuyNFT();

await buyNFT(streamId); // number
```

#### `useInitiatePurchase()`
Initiate purchase (for payment gateway).

```typescript
const { initiatePurchase, isLoading, error } = useInitiatePurchase();

await initiatePurchase(streamId); // number
```

#### `useCompletePurchase()`
Complete purchase (backend authorized).

```typescript
const { completePurchase, isLoading, error } = useCompletePurchase();

await completePurchase(streamId, buyer); // number, string
```

#### `useCancelExpiredPurchase()`
Cancel expired purchase.

```typescript
const { cancelExpired, isLoading, error } = useCancelExpiredPurchase();

await cancelExpired(streamId); // number
```

#### `useAddAuthorizedBackend()`
Add authorized backend (admin only).

```typescript
const { addBackend, isLoading, error } = useAddAuthorizedBackend();

await addBackend(backendAddress); // string
```

#### `useRemoveAuthorizedBackend()`
Remove authorized backend (admin only).

```typescript
const { removeBackend, isLoading, error } = useRemoveAuthorizedBackend();

await removeBackend(backendAddress); // string
```

#### `useSetMarketplaceFee()`
Set marketplace fee (admin only).

```typescript
const { setFee, isLoading, error } = useSetMarketplaceFee();

await setFee(feeBps); // number
```

### Utility Functions

```typescript
// Calculate marketplace fee
const fee = calculateMarketplaceFee(price, feeBps);

// Calculate net amount (seller receives)
const netAmount = calculateNetAmount(price, feeBps);

// Check if purchase expired
const hasExpired = hasPurchaseExpired(expiresAt, currentBlock);
```

---

## NFT Hooks

Location: `hooks/use-nft.ts`

### Recipient NFT Hooks (Soul-Bound)

#### `useRecipientNFTOwner(tokenId)`
Get owner of recipient NFT.

```typescript
const { data: owner, isLoading } = useRecipientNFTOwner(tokenId);
```

#### `useLastRecipientNFTId()`
Get last minted recipient NFT ID.

```typescript
const { data: lastId, isLoading } = useLastRecipientNFTId();
```

#### `useRecipientNFTTokenURI(tokenId)`
Get recipient NFT token URI.

```typescript
const { data: uri, isLoading } = useRecipientNFTTokenURI(tokenId);
```

#### `useMintRecipientNFT()`
Mint recipient NFT (soul-bound).

```typescript
const { mintRecipientNFT, isLoading, error } = useMintRecipientNFT();

await mintRecipientNFT(streamId, recipient); // number, string
```

#### `useBurnRecipientNFT()`
Burn recipient NFT.

```typescript
const { burnRecipientNFT, isLoading, error } = useBurnRecipientNFT();

await burnRecipientNFT(tokenId); // number
```

#### `useSetRecipientNFTBaseURI()`
Set base token URI (admin only).

```typescript
const { setBaseURI, isLoading, error } = useSetRecipientNFTBaseURI();

await setBaseURI(uri); // string
```

### Obligation NFT Hooks (Transferable)

#### `useObligationNFTOwner(tokenId)`
Get owner of obligation NFT.

```typescript
const { data: owner, isLoading } = useObligationNFTOwner(tokenId);
```

#### `useLastObligationNFTId()`
Get last minted obligation NFT ID.

```typescript
const { data: lastId, isLoading } = useLastObligationNFTId();
```

#### `useObligationNFTTokenURI(tokenId)`
Get obligation NFT token URI.

```typescript
const { data: uri, isLoading } = useObligationNFTTokenURI(tokenId);
```

#### `useTransferObligationNFT()`
Transfer obligation NFT.

```typescript
const { transferObligationNFT, isLoading, error } = useTransferObligationNFT();

await transferObligationNFT(tokenId, sender, recipient); // number, string, string
```

#### `useMintObligationNFT()`
Mint obligation NFT (for stream sender).

```typescript
const { mintObligationNFT, isLoading, error } = useMintObligationNFT();

await mintObligationNFT(streamId, sender); // number, string
```

#### `useBurnObligationNFT()`
Burn obligation NFT.

```typescript
const { burnObligationNFT, isLoading, error } = useBurnObligationNFT();

await burnObligationNFT(tokenId); // number
```

#### `useSetObligationNFTBaseURI()`
Set base token URI (admin only).

```typescript
const { setBaseURI, isLoading, error } = useSetObligationNFTBaseURI();

await setBaseURI(uri); // string
```

### Utility Functions

```typescript
// Check if user owns NFT
const ownsNFT = doesUserOwnNFT(ownerAddress, userAddress);

// Generate token URI
const uri = generateTokenURI(baseURI, tokenId, metadata);
```

---

## Access Control Hooks

Location: `hooks/use-access-control.ts`

### Read Hooks

#### `useIsAdmin(address)`
Check if address is an admin.

```typescript
const { data: isAdmin, isLoading } = useIsAdmin(userAddress);
```

#### `useIsProtocolPaused()`
Check if protocol is paused.

```typescript
const { data: isPaused, isLoading } = useIsProtocolPaused();
```

#### `useIsOperator(address)`
Check if address is an operator.

```typescript
const { data: isOperator, isLoading } = useIsOperator(userAddress);
```

#### `useIsContractAuthorized(contractAddress)`
Check if contract is authorized.

```typescript
const { data: isAuthorized, isLoading } = useIsContractAuthorized(contractAddress);
```

#### `usePendingAdminTransfer()`
Get pending admin transfer.

```typescript
const { data: pendingAdmin, isLoading } = usePendingAdminTransfer();
```

### Write Hooks - Admin Management

#### `useAddAdmin()`
Add a new admin.

```typescript
const { addAdmin, isLoading, error } = useAddAdmin();

await addAdmin(newAdminAddress); // string
```

#### `useRemoveAdmin()`
Remove an admin.

```typescript
const { removeAdmin, isLoading, error } = useRemoveAdmin();

await removeAdmin(adminAddress); // string
```

#### `useAddOperator()`
Add an operator.

```typescript
const { addOperator, isLoading, error } = useAddOperator();

await addOperator(operatorAddress); // string
```

#### `useRemoveOperator()`
Remove an operator.

```typescript
const { removeOperator, isLoading, error } = useRemoveOperator();

await removeOperator(operatorAddress); // string
```

### Write Hooks - Contract Authorization

#### `useAuthorizeContract()`
Authorize a contract to access vault.

```typescript
const { authorizeContract, isLoading, error } = useAuthorizeContract();

await authorizeContract(contractAddress); // string
```

#### `useRevokeContract()`
Revoke contract authorization.

```typescript
const { revokeContract, isLoading, error } = useRevokeContract();

await revokeContract(contractAddress); // string
```

### Write Hooks - Protocol Pause/Unpause

#### `usePauseProtocol()`
Pause the protocol (emergency).

```typescript
const { pauseProtocol, isLoading, error } = usePauseProtocol();

await pauseProtocol();
```

#### `useUnpauseProtocol()`
Unpause the protocol.

```typescript
const { unpauseProtocol, isLoading, error } = useUnpauseProtocol();

await unpauseProtocol();
```

### Write Hooks - Admin Transfer

#### `useInitiateAdminTransfer()`
Initiate admin transfer (2-step process).

```typescript
const { initiateTransfer, isLoading, error } = useInitiateAdminTransfer();

await initiateTransfer(newAdminAddress); // string
```

#### `useAcceptAdminTransfer()`
Accept admin transfer (called by pending admin).

```typescript
const { acceptTransfer, isLoading, error } = useAcceptAdminTransfer();

await acceptTransfer();
```

---

## Utility Hooks

### `useBlockHeight()`
Get current block height.

```typescript
const { blockHeight, isLoading } = useBlockHeight();
```

### `useAuth()`
Get authenticated user information.

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### `useStacksSigner()`
Stacks wallet signer functionality.

```typescript
const { address, signMessage, signTransaction } = useStacksSigner();
```

---

## Complete Hooks Summary

| Hook File | Purpose | Hook Count |
|-----------|---------|------------|
| `use-bitpay-read.ts` | Read stream data | 7 read hooks |
| `use-bitpay-write.ts` | Write stream operations | 5 write hooks |
| `use-multisig-treasury.ts` | Multi-sig treasury | 6 read + 6 write + 4 utility |
| `use-treasury.ts` | Treasury operations | 4 read + 4 write + utility functions |
| `use-marketplace.ts` | Marketplace operations | 4 read + 10 write + utility functions |
| `use-nft.ts` | NFT operations | 12 read + 12 write + utility functions |
| `use-access-control.ts` | Access control | 5 read + 11 write |
| `use-block-height.ts` | Block height tracking | 1 utility hook |
| `use-auth.tsx` | Authentication | Auth utilities |
| `use-stacks-signer.tsx` | Wallet signing | Signer utilities |

**Total: 90+ hooks covering all contract interactions**

---

## 🎯 Coverage Status

✅ **All contract functions are covered by hooks:**

- ✅ Core Streaming (create, withdraw, cancel)
- ✅ Multi-Sig Treasury (proposals, approvals, execution)
- ✅ Treasury Operations (fees, withdrawals)
- ✅ Marketplace (listing, buying, payment gateway)
- ✅ Recipient NFTs (soul-bound, mint/burn)
- ✅ Obligation NFTs (transferable, marketplace integration)
- ✅ Access Control (admins, operators, contract auth, pause/unpause)
- ✅ sBTC Helper (vault operations - covered in write hooks)

---

## 📖 Usage Examples

### Complete Stream Creation Flow

```typescript
import { useCreateStream } from '@/hooks/use-bitpay-write';
import { useBlockHeight } from '@/hooks/use-block-height';

function CreateStreamComponent() {
  const { write: createStream, isLoading, error } = useCreateStream();
  const { blockHeight } = useBlockHeight();

  const handleCreate = async () => {
    const recipient = 'ST1234...';
    const amount = 1.5; // 1.5 BTC
    const startBlock = blockHeight + 10;
    const endBlock = startBlock + 1000;

    await createStream(recipient, amount, startBlock, endBlock);
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Stream'}
    </button>
  );
}
```

### Multi-Sig Withdrawal Flow

```typescript
import {
  useProposeWithdrawal,
  useApproveWithdrawal,
  useExecuteWithdrawal,
  useWithdrawalProposal,
  useHasTimelockElapsed
} from '@/hooks/use-multisig-treasury';

function MultiSigWithdrawal({ proposalId }: { proposalId: number }) {
  const { propose, isLoading: isProposeLoading } = useProposeWithdrawal();
  const { approve, isLoading: isApproveLoading } = useApproveWithdrawal();
  const { execute, isLoading: isExecuteLoading } = useExecuteWithdrawal();
  const { data: proposal } = useWithdrawalProposal(proposalId);
  const { blockHeight } = useBlockHeight();

  const canExecute = proposal &&
    proposal.approvals.length >= 3 &&
    useHasTimelockElapsed(proposal.proposedAt, blockHeight) &&
    !proposal.executed;

  return (
    <div>
      {canExecute && (
        <button onClick={() => execute(proposalId)}>
          Execute Withdrawal
        </button>
      )}
    </div>
  );
}
```

---

**Last Updated**: October 14, 2025
**Status**: ✅ Complete - All contract functions have corresponding hooks
