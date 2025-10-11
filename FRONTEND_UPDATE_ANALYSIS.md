# BitPay Frontend Dashboard - Update Requirements Analysis

## Executive Summary

After analyzing all smart contracts and the frontend dashboard, here are the critical updates needed to align the frontend with the implemented contract features.

---

## 🎯 Critical Missing Features

### 1. **Multi-Sig Treasury Management** ⚠️ HIGH PRIORITY

**Contract Implementation:**
- 3-of-5 multi-sig for withdrawals
- 24-hour timelock (144 blocks)
- 100 sBTC daily withdrawal limit
- Proposal/approval/execution workflow
- Admin management via multi-sig

**Frontend Status:** ❌ **NOT IMPLEMENTED**

**Current Issues:**
- Treasury page (treasury/page.tsx) only shows single admin withdrawal
- No UI for multi-sig proposals
- No proposal listing/approval interface
- No timelock visualization
- No daily limit tracking

**Required Updates:**

```typescript
// New components needed:
- MultiSigProposalCard.tsx
- ProposeWithdrawalModal.tsx
- ApproveProposalModal.tsx
- ExecuteProposalModal.tsx
- TimelockCountdown.tsx
- DailyLimitTracker.tsx
- MultiSigAdminManager.tsx

// New pages/sections:
/dashboard/treasury/proposals - List all proposals
/dashboard/treasury/proposals/[id] - Proposal details
/dashboard/treasury/multisig-settings - Admin management
```

**Treasury Page Updates Needed:**

1. **Proposal Management Section**
```typescript
// Add to treasury/page.tsx
<TabsContent value="proposals">
  <Card>
    <CardHeader>
      <CardTitle>Withdrawal Proposals</CardTitle>
      <CardDescription>
        3-of-5 multi-sig approval required • 24h timelock • 100 sBTC daily limit
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* List of proposals with status */}
      <ProposalList />

      {/* Create new proposal button (admins only) */}
      <Button onClick={() => setShowProposeModal(true)}>
        Propose Withdrawal
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

2. **Multi-Sig Admin Section**
```typescript
<TabsContent value="multisig-admins">
  <Card>
    <CardHeader>
      <CardTitle>Multi-Sig Administrators</CardTitle>
      <CardDescription>
        Current: {adminCount}/5 slots filled • 3 approvals required
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Admin list */}
      <AdminList admins={multisigAdmins} />

      {/* Add/remove admin proposals */}
      <Button onClick={() => setShowAddAdminModal(true)}>
        Propose Add Admin
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

---

### 2. **Marketplace Fee Collection** ⚠️ HIGH PRIORITY

**Contract Implementation:**
- Marketplace collects 1% fee (100 bps)
- Fees sent directly to treasury
- Treasury tracks marketplace fees separately via `collect-marketplace-fee`

**Frontend Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Current Issues:**
- marketplace/page.tsx shows mock listings only
- No real marketplace fee display
- Treasury doesn't show marketplace vs cancellation fee breakdown

**Required Updates:**

1. **Treasury Page - Fee Breakdown**
```typescript
// Update treasury/page.tsx stats cards
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Cancellation Fees</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-red-500">
        {cancellationFees} sBTC
      </div>
      <p className="text-xs">1% on cancelled streams</p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Marketplace Fees</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-brand-pink">
        {marketplaceFees} sBTC
      </div>
      <p className="text-xs">1% on NFT sales</p>
    </CardContent>
  </Card>
</div>
```

2. **Marketplace Page - Real Listings**
```typescript
// marketplace/page.tsx needs contract integration
const { data: listings } = useMarketplaceListings(); // Hook needed
const { data: marketplaceStats } = useMarketplaceStats(); // Hook needed

// Show real fee calculations
<div className="p-4 bg-brand-pink/5 rounded-lg">
  <p className="text-sm">Sale Price: {salePrice} sBTC</p>
  <p className="text-sm text-muted-foreground">
    Marketplace Fee (1%): {marketplaceFee} sBTC
  </p>
  <p className="text-sm text-brand-teal">
    Seller Receives: {sellerProceeds} sBTC
  </p>
</div>
```

---

### 3. **NFT Marketplace Integration** ⚠️ MEDIUM PRIORITY

**Contract Implementation:**
- Two purchase methods:
  1. Direct on-chain (`buy-nft`)
  2. Gateway-assisted (`initiate-purchase` → `complete-purchase`)
- Listing management (`list-nft`, `update-listing-price`, `cancel-listing`)
- NFT transfer updates stream sender

**Frontend Status:** ⚠️ **MOCK DATA ONLY**

**Required Updates:**

1. **List NFT Modal** (Already exists but needs testing)
```typescript
// ListObligationNFTModal.tsx - verify contract integration
const { write: listNFT } = useMarketplaceWrite('list-nft');

const handleList = async () => {
  const priceMicro = parseFloat(price) * 1_000_000;
  await listNFT(
    uintCV(streamId),
    uintCV(priceMicro)
  );
};
```

2. **Buy NFT Modal** (Already exists but needs contract connection)
```typescript
// BuyObligationNFTModal.tsx
const { write: buyNFT } = useMarketplaceWrite('buy-nft');

const handleBuy = async () => {
  await buyNFT(uintCV(streamId));
  // Auto-transfers seller proceeds + marketplace fee
  // Auto-updates stream sender
};
```

3. **Gateway Purchase Flow** (NEW FEATURE)
```typescript
// New: GatewayPurchaseModal.tsx
const { write: initiatePurchase } = useMarketplaceWrite('initiate-purchase');

const handleGatewayPurchase = async () => {
  // 1. Initiate purchase on-chain
  const paymentId = generatePaymentId();
  await initiatePurchase(
    uintCV(streamId),
    stringAsciiCV(paymentId)
  );

  // 2. Redirect to payment gateway (Stripe/etc)
  window.location.href = `/payment/${paymentId}`;

  // 3. Backend completes purchase after payment confirmed
  // (Backend calls complete-purchase)
};
```

---

### 4. **Stream Cancellation Fee Display** ✅ IMPLEMENTED (needs enhancement)

**Contract Implementation:**
- 1% cancellation fee charged on unvested amount
- Fee goes to treasury via `collect-cancellation-fee`

**Frontend Status:** ✅ **BASIC IMPLEMENTATION**

**Enhancement Needed:**

```typescript
// In CancelStreamModal.tsx - show fee breakdown
<Alert className="border-yellow-500/20 bg-yellow-500/5">
  <AlertCircle className="h-4 w-4 text-yellow-500" />
  <AlertDescription>
    <p className="font-medium mb-2">Cancellation Fee Breakdown:</p>
    <div className="text-sm space-y-1">
      <p>Unvested Amount: {unvested} sBTC</p>
      <p className="text-red-500">
        Cancellation Fee (1%): {cancellationFee} sBTC
      </p>
      <p className="text-green-600">
        You'll Receive: {unvestedAfterFee} sBTC
      </p>
      <p className="text-brand-teal">
        Recipient Gets: {vestedAmount} sBTC
      </p>
    </div>
  </AlertDescription>
</Alert>
```

---

### 5. **Obligation NFT Transfer** ✅ PARTIALLY IMPLEMENTED

**Contract Implementation:**
- Transferable obligation NFTs
- Transfer updates stream sender automatically
- Direct transfer or marketplace sale

**Frontend Status:** ⚠️ **MODAL EXISTS, NEEDS TESTING**

**Current Implementation:**
- `TransferObligationNFTModal.tsx` exists
- `update-stream-sender` functionality present

**Testing Needed:**
- Verify NFT transfer flow
- Ensure stream sender updates correctly
- Test with marketplace transfers

---

## 📊 Dashboard Pages Analysis

### ✅ Main Dashboard (dashboard/page.tsx)
**Status:** Good implementation
**Minor Updates:**
- Add marketplace stats card
- Add treasury balance card
- Show multi-sig pending proposals count

### ⚠️ Streams Page (dashboard/streams/page.tsx)
**Status:** Well implemented
**Updates Needed:**
- Show if stream has listed obligation NFT
- Add "List for Sale" quick action
- Display NFT transfer history

### ❌ Marketplace Page (dashboard/marketplace/page.tsx)
**Status:** Mock data only
**Critical Updates:**
1. Connect to real contract data
2. Implement listing creation
3. Implement direct purchase
4. Add gateway purchase option
5. Show user's active listings
6. Display sale history

### ❌ Treasury Page (dashboard/treasury/page.tsx)
**Status:** Single admin only
**Critical Updates:**
1. Add multi-sig proposal system
2. Show proposal list with statuses
3. Implement approval workflow
4. Add timelock countdown
5. Show daily limit usage
6. Add admin management section

### ✅ NFTs Page (dashboard/nfts/page.tsx)
**Status:** Good UI implementation
**Minor Updates:**
- Add marketplace listing status
- Show transfer history
- Add quick "List for Sale" button on obligation NFTs

---

## 🔧 Required New Components

### Multi-Sig Components
```
components/dashboard/treasury/
├── ProposalCard.tsx - Individual proposal display
├── ProposalList.tsx - List all proposals
├── ProposeWithdrawalModal.tsx - Create withdrawal proposal
├── ApproveProposalModal.tsx - Approve proposal
├── ExecuteProposalModal.tsx - Execute approved proposal
├── TimelockCountdown.tsx - Visual timelock display
├── DailyLimitTracker.tsx - Track daily withdrawal limit
├── MultiSigAdminList.tsx - List multi-sig admins
├── ProposeAddAdminModal.tsx - Add admin proposal
└── ProposeRemoveAdminModal.tsx - Remove admin proposal
```

### Marketplace Components
```
components/dashboard/marketplace/
├── ListingCard.tsx - Individual NFT listing
├── ListingFilters.tsx - Filter/sort listings
├── BuyDirectModal.tsx - Direct on-chain purchase
├── BuyGatewayModal.tsx - Gateway-assisted purchase
├── ListingHistory.tsx - User's listing history
└── SaleHistory.tsx - Sale transaction history
```

---

## 🎨 New Hooks Needed

### Multi-Sig Hooks
```typescript
// hooks/use-multisig-treasury.ts
export function useMultiSigProposals() {
  // Fetch all withdrawal proposals
  // Returns: proposals with status, approvals, timelock
}

export function useProposeWithdrawal() {
  // Create new withdrawal proposal
}

export function useApproveProposal() {
  // Approve existing proposal
}

export function useExecuteProposal() {
  // Execute approved proposal (after timelock)
}

export function useMultiSigAdmins() {
  // Fetch current multi-sig admins
  // Returns: list of 5 admins, active count
}

export function useProposeAddAdmin() {
  // Propose adding new admin
}

export function useProposeRemoveAdmin() {
  // Propose removing admin
}

export function useAdminProposals() {
  // Fetch admin management proposals
}
```

### Marketplace Hooks
```typescript
// hooks/use-marketplace.ts
export function useMarketplaceListings() {
  // Fetch all active listings
  // Returns: listings with stream data
}

export function useUserListings(address: string) {
  // Fetch user's active listings
}

export function useMarketplaceStats() {
  // Get marketplace stats (total listings, sales, volume)
}

export function useListNFT() {
  // List obligation NFT for sale
}

export function useCancelListing() {
  // Cancel active listing
}

export function useUpdateListingPrice() {
  // Update listing price
}

export function useBuyNFT() {
  // Direct on-chain purchase
}

export function useInitiatePurchase() {
  // Gateway-assisted purchase (step 1)
}

export function usePendingPurchase(streamId: string) {
  // Check if purchase is pending
}
```

### Treasury Fee Hooks
```typescript
// hooks/use-treasury-fees.ts
export function useCancellationFees() {
  // Get total cancellation fees collected
}

export function useMarketplaceFees() {
  // Get total marketplace fees collected
}

export function useFeeBreakdown() {
  // Get fee breakdown (cancellation vs marketplace)
}
```

---

## 📋 Implementation Priority

### Phase 1: Critical (Week 1) 🔴
1. ✅ **Multi-Sig Treasury UI**
   - Proposal creation modal
   - Proposal list page
   - Approval workflow
   - Timelock display

2. ✅ **Marketplace Real Data**
   - Connect to contract listings
   - Show real fee calculations
   - Implement listing creation

### Phase 2: Important (Week 2) 🟡
3. ✅ **Gateway Purchase Flow**
   - Payment initiation
   - Payment gateway integration
   - Backend completion webhook

4. ✅ **Treasury Fee Breakdown**
   - Separate cancellation vs marketplace fees
   - Fee collection charts
   - Historical fee data

### Phase 3: Enhancement (Week 3) 🟢
5. ✅ **Admin Management UI**
   - Add/remove admin proposals
   - Admin list display
   - Proposal approval for admin changes

6. ✅ **NFT Transfer History**
   - Track obligation NFT transfers
   - Show transfer events
   - Display ownership chain

---

## 🎯 Specific Page Updates

### treasury/page.tsx

```typescript
// BEFORE (current)
<Tabs defaultValue="overview">
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="manage">Manage</TabsTrigger>
  <TabsTrigger value="access-control">Access Control</TabsTrigger>
  <TabsTrigger value="admin">Admin</TabsTrigger>
</Tabs>

// AFTER (updated)
<Tabs defaultValue="overview">
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="proposals">
    Proposals ({pendingProposals})
  </TabsTrigger>
  <TabsTrigger value="multisig">
    Multi-Sig Admins ({adminCount}/5)
  </TabsTrigger>
  <TabsTrigger value="manage">Manage</TabsTrigger>
  <TabsTrigger value="access-control">Access Control</TabsTrigger>
</Tabs>

// New Proposals Tab
<TabsContent value="proposals">
  <Card>
    <CardHeader>
      <div className="flex justify-between">
        <div>
          <CardTitle>Withdrawal Proposals</CardTitle>
          <CardDescription>
            3-of-5 multi-sig • 24h timelock • 100 sBTC daily limit
          </CardDescription>
        </div>
        {isMultiSigAdmin && (
          <Button onClick={() => setProposeModal(true)}>
            New Proposal
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {proposals.map(proposal => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onApprove={() => handleApprove(proposal.id)}
          onExecute={() => handleExecute(proposal.id)}
        />
      ))}
    </CardContent>
  </Card>
</TabsContent>
```

### marketplace/page.tsx

```typescript
// BEFORE (current - mock data)
const mockListings: MarketplaceListing[] = [
  { streamId: "1", seller: "SP2J6...", price: 9.5, ... }
];

// AFTER (updated - real data)
const { data: listings, isLoading } = useMarketplaceListings();
const { data: userListings } = useUserListings(userAddress);
const { data: marketplaceStats } = useMarketplaceStats();

// Real listing cards
{listings.map(listing => (
  <ListingCard
    key={listing.streamId}
    listing={listing}
    onBuy={() => handleBuy(listing)}
    onBuyWithCard={() => handleGatewayBuy(listing)}
  />
))}

// Add payment method selector
<Alert>
  <Info className="h-4 w-4" />
  <AlertDescription>
    <p className="font-medium mb-2">Choose Payment Method:</p>
    <div className="flex gap-2">
      <Button onClick={() => buyDirect(listing)}>
        Pay with Crypto (sBTC)
      </Button>
      <Button variant="outline" onClick={() => buyWithCard(listing)}>
        Pay with Card (Gateway)
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

### dashboard/page.tsx

```typescript
// Add new stat cards
const stats = [
  {
    title: "Total Streamed",
    value: `${microToDisplay(totalStreamed)} sBTC`,
    icon: Bitcoin,
  },
  {
    title: "Active Streams",
    value: activeStreams.toString(),
    icon: Activity,
  },
  // NEW: Treasury Stats
  {
    title: "Treasury Balance",
    value: `${microToDisplay(treasuryBalance)} sBTC`,
    change: `${pendingProposals} pending proposals`,
    icon: Wallet,
  },
  // NEW: Marketplace Stats
  {
    title: "NFT Marketplace",
    value: `${activeListings} Active Listings`,
    change: `${totalSales} sales completed`,
    icon: ShoppingCart,
  },
];
```

---

## 🔍 Contract Function Mapping

### Functions Already Used ✅
- `create-stream` - ✅ streams/create/page.tsx
- `withdraw-from-stream` - ✅ streams/page.tsx
- `cancel-stream` - ✅ CancelStreamModal.tsx
- `get-stream` - ✅ Multiple places
- `get-sender-streams` - ✅ use-user-streams.ts
- `get-recipient-streams` - ✅ use-user-streams.ts

### Functions NOT Used Yet ❌
- `propose-multisig-withdrawal` - ❌ NOT USED
- `approve-multisig-withdrawal` - ❌ NOT USED
- `execute-multisig-withdrawal` - ❌ NOT USED
- `propose-add-admin` - ❌ NOT USED
- `propose-remove-admin` - ❌ NOT USED
- `approve-admin-proposal` - ❌ NOT USED
- `execute-admin-proposal` - ❌ NOT USED
- `list-nft` - ❌ Modal exists but not connected
- `buy-nft` - ❌ Modal exists but not connected
- `initiate-purchase` - ❌ NOT USED
- `complete-purchase` - ❌ NOT USED (backend only)
- `cancel-listing` - ❌ NOT USED
- `update-listing-price` - ❌ NOT USED

---

## 🎨 UI/UX Enhancements

### Visual Indicators Needed

1. **Multi-Sig Proposal Status**
```typescript
// Show proposal progress visually
<div className="flex items-center gap-2">
  <Badge variant={approvalCount >= 3 ? "default" : "secondary"}>
    {approvalCount}/3 Approvals
  </Badge>

  {timelockElapsed ? (
    <Badge className="bg-green-500">
      <CheckCircle className="h-3 w-3 mr-1" />
      Ready to Execute
    </Badge>
  ) : (
    <TimelockCountdown
      proposedAt={proposal.proposedAt}
      timelockBlocks={144}
    />
  )}
</div>
```

2. **Marketplace Listing Status**
```typescript
// Show listing status on stream cards
{isListed && (
  <Badge className="bg-brand-pink">
    <Tag className="h-3 w-3 mr-1" />
    Listed for {listingPrice} sBTC
  </Badge>
)}

{hasPendingPurchase && (
  <Badge variant="secondary">
    <Clock className="h-3 w-3 mr-1" />
    Purchase Pending
  </Badge>
)}
```

3. **Daily Limit Tracker**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Daily Withdrawal Limit</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Used Today</span>
        <span className="font-medium">
          {withdrawnToday} / {dailyLimit} sBTC
        </span>
      </div>
      <Progress
        value={(withdrawnToday / dailyLimit) * 100}
        className="h-2"
      />
      <p className="text-xs text-muted-foreground">
        Resets in {blocksUntilReset} blocks (~{hoursUntilReset}h)
      </p>
    </div>
  </CardContent>
</Card>
```

---

## 📝 Summary of Required Updates

### Immediate Actions (This Week)
1. ✅ Create multi-sig proposal components
2. ✅ Add proposal list page to treasury
3. ✅ Implement approval workflow UI
4. ✅ Connect marketplace to real contract data
5. ✅ Add fee breakdown to treasury page

### Next Week
6. ✅ Implement gateway purchase flow
7. ✅ Add admin management UI
8. ✅ Create timelock visualization
9. ✅ Add daily limit tracking
10. ✅ Test all NFT transfer flows

### Future Enhancements
11. ✅ Add comprehensive transaction history
12. ✅ Implement notification system for proposals
13. ✅ Add email alerts for multi-sig admins
14. ✅ Create mobile-responsive views
15. ✅ Add analytics dashboard for marketplace

---

## 🚀 Getting Started

### Step 1: Create Multi-Sig Hooks
```bash
# Create new file
touch bitpay-frontend/hooks/use-multisig-treasury.ts

# Implement all multi-sig read/write hooks
```

### Step 2: Create Proposal Components
```bash
mkdir bitpay-frontend/components/dashboard/treasury
cd bitpay-frontend/components/dashboard/treasury

# Create all proposal-related components
touch ProposalCard.tsx
touch ProposalList.tsx
touch ProposeWithdrawalModal.tsx
touch ApproveProposalModal.tsx
touch ExecuteProposalModal.tsx
```

### Step 3: Update Treasury Page
```bash
# Update existing page
code bitpay-frontend/app/dashboard/treasury/page.tsx

# Add multi-sig tabs and proposal system
```

### Step 4: Connect Marketplace
```bash
# Create marketplace hooks
touch bitpay-frontend/hooks/use-marketplace.ts

# Update marketplace page
code bitpay-frontend/app/dashboard/marketplace/page.tsx
```

---

## ✅ Checklist for Complete Implementation

- [ ] Multi-sig proposal creation
- [ ] Proposal approval workflow
- [ ] Proposal execution with timelock
- [ ] Admin management (add/remove)
- [ ] Daily limit tracking
- [ ] Marketplace listing creation
- [ ] Direct NFT purchase
- [ ] Gateway-assisted purchase
- [ ] Fee breakdown display
- [ ] NFT transfer tracking
- [ ] Notification system
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] Transaction confirmation UIs

---

**Priority**: Implement multi-sig treasury UI first, then marketplace real data integration.

**Estimated Time**: 2-3 weeks for full implementation with testing.
