# BitPay Frontend Modification Plan
## Complete Analysis & Implementation Roadmap

**Date:** January 10, 2025
**Project:** BitPay - Bitcoin Streaming & Vesting Vaults

---

## Executive Summary

This document provides a comprehensive analysis of the current BitPay frontend implementation versus the project proposal requirements, identifies gaps, and outlines the complete modification plan including API architecture, Chainhook integration, and UI/UX improvements.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Gap Analysis](#2-gap-analysis)
3. [Required Modifications](#3-required-modifications)
4. [API Architecture](#4-api-architecture)
5. [Chainhook & Webhook Integration](#5-chainhook--webhook-integration)
6. [Smart Contract Integration](#6-smart-contract-integration)
7. [UI/UX Modifications](#7-uiux-modifications)
8. [Implementation Priority](#8-implementation-priority)

---

## 1. Current State Analysis

### 1.1 Existing Frontend Structure

**Landing Page Components:**
- ✅ `HeroSection.tsx` - Main hero with CTA
- ✅ `FeaturesSection.tsx` - Feature showcase
- ✅ `HowItWorksSection.tsx` - User flow explanation
- ✅ `CTASection.tsx` - Final call-to-action
- ✅ `HeroVisual.tsx` - 3D visualization

**Dashboard Pages:**
- ✅ `/dashboard/page.tsx` - Main dashboard with stats
- ✅ `/dashboard/streams/page.tsx` - Stream management
- ✅ `/dashboard/streams/create/page.tsx` - Stream creation form
- ✅ `/dashboard/analytics/page.tsx` - Analytics
- ✅ `/dashboard/wallets/page.tsx` - Wallet management

**Current Features:**
- Dashboard with mock data (stats, charts)
- Stream list with filtering (all, active, completed, paused, cancelled)
- Stream creation form
- Withdraw/Pause/Resume/Cancel modals
- Real-time progress visualization
- Transaction history display

### 1.2 Deployed Smart Contracts

**Contract Architecture (5 Contracts):**

1. **bitpay-core.clar** - Main streaming logic
   - create-stream, withdraw-from-stream, cancel-stream
   - Vesting calculation (linear, block-based)
   - Stream tracking (sender/recipient maps)

2. **bitpay-access-control.clar** - Role management
   - Admin/operator roles
   - Emergency pause mechanism
   - Two-step admin transfer

3. **bitpay-sbtc-helper.clar** - sBTC integration
   - transfer-to-vault, transfer-from-vault
   - Balance queries

4. **bitpay-nft.clar** - SIP-009 NFT tokenization
   - mint, burn, transfer
   - Stream-to-token mapping

5. **bitpay-treasury.clar** - Fee collection
   - collect-fee (0.5% default)
   - Treasury management
   - Fee distribution

---

## 2. Gap Analysis

### 2.1 Missing Core Features

| **Proposal Requirement** | **Current State** | **Status** | **Priority** |
|---|---|---|---|
| **sBTC Integration** | Mock data only | ❌ Missing | **Critical** |
| **Stacks.js Integration** | Not implemented | ❌ Missing | **Critical** |
| **Wallet Connect (Hiro/Leather)** | Turnkey only | ⚠️ Partial | **Critical** |
| **Real-time vesting calculation** | Mock data | ❌ Missing | **High** |
| **Stream NFT minting** | Not implemented | ❌ Missing | **Medium** |
| **Fee collection** | Not implemented | ❌ Missing | **Medium** |
| **Chainhook event listening** | Not implemented | ❌ Missing | **High** |
| **Block height tracking** | Not implemented | ❌ Missing | **Critical** |
| **Transaction broadcasting** | Not implemented | ❌ Missing | **Critical** |
| **Stream templates** | Not implemented | ❌ Missing | **Low** |
| **Delta streams (variable rate)** | Not implemented | ❌ Missing | **Future** |

### 2.2 Required New Components

**Not Yet Built:**
- Stream detail visualization page
- NFT gallery for stream NFTs
- Treasury admin panel
- Real-time block height display
- Transaction status tracker
- Stream templates UI
- Bulk stream creation interface
- Analytics with real blockchain data

---

## 3. Required Modifications

### 3.1 Remove/Replace

**Remove:**
- ❌ All mock data in dashboard pages
- ❌ Turnkey as primary wallet (make optional)
- ❌ AuthModal traditional email/password auth
- ❌ MongoDB user authentication

**Replace with:**
- ✅ Stacks wallet connect (Hiro Wallet, Leather Wallet)
- ✅ Real contract calls via stacks.js
- ✅ Blockchain-based authentication (wallet signature)
- ✅ Real-time data from Stacks blockchain

### 3.2 Add New Features

**Critical Additions:**
1. **Stacks Wallet Integration**
   - @stacks/connect for wallet connection
   - @stacks/transactions for tx building
   - @stacks/network for network config
   - Wallet state management (connected wallet, address, balances)

2. **Contract Interaction Layer**
   - Custom hooks for each contract function
   - Transaction building utilities
   - Post-condition builders
   - Error handling framework

3. **Real-time Block Data**
   - Stacks API integration for block heights
   - WebSocket connection for live updates
   - Vesting calculation based on current block

4. **Event Monitoring**
   - Chainhook setup for contract events
   - Webhook endpoints for event processing
   - Real-time dashboard updates

---

## 4. API Architecture

### 4.1 Required API Routes

**Backend API Structure:**

```
/api/
├── stacks/
│   ├── block-height/          # GET current block height
│   ├── transaction/[txId]/    # GET transaction status
│   └── account/[address]/     # GET account info
├── streams/
│   ├── GET /                  # List user's streams
│   ├── GET /[id]/             # Get stream details
│   ├── GET /[id]/vested/      # Calculate current vested amount
│   └── GET /[id]/history/     # Get stream transaction history
├── webhooks/
│   ├── POST /chainhook/       # Receive Chainhook events
│   └── POST /stream-event/    # Process stream events
└── nft/
    ├── GET /[tokenId]/        # Get NFT metadata
    └── GET /[tokenId]/image/  # Generate NFT image
```

### 4.2 API Implementation Details

#### 4.2.1 Stacks API Integration

**File:** `app/api/stacks/block-height/route.ts`
```typescript
export async function GET() {
  const response = await fetch(
    `${STACKS_API_URL}/extended/v1/block/latest`
  );
  const data = await response.json();
  return Response.json({
    blockHeight: data.height,
    burnBlockHeight: data.burn_block_height
  });
}
```

**File:** `app/api/stacks/transaction/[txId]/route.ts`
```typescript
export async function GET(
  request: Request,
  { params }: { params: { txId: string } }
) {
  const response = await fetch(
    `${STACKS_API_URL}/extended/v1/tx/${params.txId}`
  );
  const tx = await response.json();
  return Response.json({
    status: tx.tx_status,
    result: tx.tx_result,
    blockHeight: tx.block_height
  });
}
```

#### 4.2.2 Stream Queries

**File:** `app/api/streams/route.ts`
```typescript
import { callReadOnlyFunction } from '@stacks/transactions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const type = searchParams.get('type'); // 'sent' or 'received'

  // Call contract read-only function
  const functionName = type === 'sent'
    ? 'get-sender-streams'
    : 'get-recipient-streams';

  const result = await callReadOnlyFunction({
    contractAddress: BITPAY_CORE_ADDRESS,
    contractName: 'bitpay-core',
    functionName,
    functionArgs: [principalCV(address)],
    senderAddress: address,
    network: NETWORK,
  });

  // Parse stream IDs and fetch details
  const streamIds = result.value;
  const streams = await Promise.all(
    streamIds.map(id => getStreamDetails(id))
  );

  return Response.json({ streams });
}
```

**File:** `app/api/streams/[id]/vested/route.ts`
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const blockHeight = await getCurrentBlockHeight();

  const result = await callReadOnlyFunction({
    contractAddress: BITPAY_CORE_ADDRESS,
    contractName: 'bitpay-core',
    functionName: 'get-vested-amount-at-block',
    functionArgs: [
      uintCV(params.id),
      uintCV(blockHeight)
    ],
    senderAddress: BITPAY_CORE_ADDRESS,
    network: NETWORK,
  });

  return Response.json({
    streamId: params.id,
    vestedAmount: result.value,
    blockHeight,
    timestamp: Date.now()
  });
}
```

#### 4.2.3 WebSocket for Real-time Updates

**File:** `lib/websocket/stream-updates.ts`
```typescript
import { createContext, useContext, useEffect } from 'react';

export function useStreamUpdates(streamId: string) {
  const [vested, setVested] = useState(0);

  useEffect(() => {
    // Poll block height every 10 seconds
    const interval = setInterval(async () => {
      const response = await fetch(`/api/streams/${streamId}/vested`);
      const data = await response.json();
      setVested(data.vestedAmount);
    }, 10000);

    return () => clearInterval(interval);
  }, [streamId]);

  return { vested };
}
```

---

## 5. Chainhook & Webhook Integration

### 5.1 Chainhook Configuration

**Purpose:** Monitor BitPay contract events in real-time

**File:** `chainhooks/bitpay-streams.json`
```json
{
  "uuid": "bitpay-stream-events",
  "name": "BitPay Stream Events",
  "version": 1,
  "chain": "stacks",
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "contract_call",
        "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-core"
      },
      "then_that": {
        "http_post": {
          "url": "https://your-domain.com/api/webhooks/chainhook",
          "authorization_header": "Bearer YOUR_SECRET_TOKEN"
        }
      },
      "start_block": 1
    }
  }
}
```

**Events to Monitor:**
1. `stream-created` - New stream created
2. `stream-withdrawal` - Funds withdrawn
3. `stream-cancelled` - Stream cancelled

### 5.2 Webhook Handler

**File:** `app/api/webhooks/chainhook/route.ts`
```typescript
export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CHAINHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await request.json();

  // Process different event types
  for (const event of payload.apply) {
    const txResult = event.transactions[0];
    const printEvent = txResult.metadata?.print_event;

    if (!printEvent) continue;

    switch (printEvent.event) {
      case 'stream-created':
        await handleStreamCreated(printEvent);
        break;
      case 'stream-withdrawal':
        await handleStreamWithdrawal(printEvent);
        break;
      case 'stream-cancelled':
        await handleStreamCancelled(printEvent);
        break;
    }
  }

  return Response.json({ success: true });
}

async function handleStreamCreated(event: any) {
  // Store in database for fast queries
  await db.streams.create({
    streamId: event['stream-id'],
    sender: event.sender,
    recipient: event.recipient,
    amount: event.amount,
    startBlock: event['start-block'],
    endBlock: event['end-block'],
    status: 'active',
    createdAt: new Date()
  });

  // Trigger real-time update to frontend
  await notifyFrontend('stream-created', event);
}
```

### 5.3 Real-time Notifications

**File:** `lib/notifications/stream-events.ts`
```typescript
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export async function notifyFrontend(
  eventType: string,
  data: any
) {
  await pusher.trigger(
    `user-${data.sender}`,
    eventType,
    data
  );
  await pusher.trigger(
    `user-${data.recipient}`,
    eventType,
    data
  );
}
```

**Frontend Listener:**
```typescript
import Pusher from 'pusher-js';

export function useStreamEvents(userAddress: string) {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    });

    const channel = pusher.subscribe(`user-${userAddress}`);

    channel.bind('stream-created', (data) => {
      toast.success('New stream created!');
      refreshStreams();
    });

    channel.bind('stream-withdrawal', (data) => {
      toast.info('Withdrawal confirmed');
      refreshStreams();
    });

    return () => {
      pusher.unsubscribe(`user-${userAddress}`);
    };
  }, [userAddress]);
}
```

---

## 6. Smart Contract Integration

### 6.1 Custom Hooks

**File:** `hooks/use-bitpay-contract.ts`
```typescript
import { useConnect } from '@stacks/connect-react';
import {
  openContractCall,
  uintCV,
  principalCV,
  PostConditionMode
} from '@stacks/connect';

export function useBitPayContract() {
  const { doContractCall } = useConnect();

  const createStream = async (
    recipient: string,
    amount: number,
    startBlock: number,
    endBlock: number
  ) => {
    const options = {
      contractAddress: BITPAY_CORE_ADDRESS,
      contractName: 'bitpay-core',
      functionName: 'create-stream',
      functionArgs: [
        principalCV(recipient),
        uintCV(amount),
        uintCV(startBlock),
        uintCV(endBlock)
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        // User must transfer amount to contract
        makeStandardSTXPostCondition(
          userAddress,
          FungibleConditionCode.Equal,
          amount
        )
      ],
      onFinish: (data) => {
        console.log('Transaction ID:', data.txId);
        toast.success('Stream created! Tx: ' + data.txId);
      },
      onCancel: () => {
        toast.error('Transaction cancelled');
      }
    };

    await openContractCall(options);
  };

  const withdrawFromStream = async (streamId: number) => {
    // Similar implementation
  };

  const cancelStream = async (streamId: number) => {
    // Similar implementation
  };

  return {
    createStream,
    withdrawFromStream,
    cancelStream
  };
}
```

### 6.2 Read-Only Queries

**File:** `hooks/use-stream-data.ts`
```typescript
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';

export function useStreamData(streamId: number) {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStream() {
      const result = await callReadOnlyFunction({
        contractAddress: BITPAY_CORE_ADDRESS,
        contractName: 'bitpay-core',
        functionName: 'get-stream',
        functionArgs: [uintCV(streamId)],
        senderAddress: BITPAY_CORE_ADDRESS,
        network: NETWORK,
      });

      const streamData = cvToJSON(result);
      setStream(streamData.value);
      setLoading(false);
    }

    fetchStream();
  }, [streamId]);

  return { stream, loading };
}
```

### 6.3 Vesting Calculation

**File:** `lib/vesting/calculator.ts`
```typescript
export function calculateVestedAmount(
  totalAmount: number,
  startBlock: number,
  endBlock: number,
  currentBlock: number,
  withdrawn: number
): {
  vested: number;
  available: number;
  percentage: number;
} {
  if (currentBlock < startBlock) {
    return { vested: 0, available: 0, percentage: 0 };
  }

  if (currentBlock >= endBlock) {
    return {
      vested: totalAmount,
      available: totalAmount - withdrawn,
      percentage: 100
    };
  }

  const elapsed = currentBlock - startBlock;
  const duration = endBlock - startBlock;
  const vested = Math.floor((totalAmount * elapsed) / duration);
  const available = vested - withdrawn;
  const percentage = Math.floor((elapsed * 100) / duration);

  return { vested, available, percentage };
}
```

---

## 7. UI/UX Modifications

### 7.1 Landing Page Updates

**HeroSection.tsx:**
- ✅ Keep existing design (looks good)
- ✅ Update CTA to connect wallet instead of email signup
- ✅ Add live stats (total streams, total volume from blockchain)

**New Component:** `LiveStats.tsx`
```typescript
export function LiveStats() {
  const { totalStreams, totalVolume } = useBitPayStats();

  return (
    <div className="stats-grid">
      <div className="stat">
        <h3>{totalStreams}</h3>
        <p>Active Streams</p>
      </div>
      <div className="stat">
        <h3>{totalVolume} sBTC</h3>
        <p>Total Streamed</p>
      </div>
    </div>
  );
}
```

### 7.2 Dashboard Modifications

**Current Dashboard (dashboard/page.tsx):**
- ❌ Remove mock data
- ✅ Add real blockchain data
- ✅ Keep existing stats cards layout
- ✅ Add wallet connection prompt if not connected
- ✅ Add "Getting Started" for new users

**New Dashboard Features:**
```typescript
// Replace mock data fetch with real contract calls
useEffect(() => {
  async function loadUserStreams() {
    const senderStreams = await getSenderStreams(userAddress);
    const recipientStreams = await getRecipientStreams(userAddress);

    const allStreams = [...senderStreams, ...recipientStreams];
    const activeStreams = allStreams.filter(s => s.status === 'active');

    setStreams(allStreams);
    setActiveCount(activeStreams.length);

    // Calculate real stats
    const totalStreamed = allStreams.reduce(
      (sum, s) => sum + s.withdrawn, 0
    );
    setTotalStreamed(totalStreamed);
  }

  if (userAddress) {
    loadUserStreams();
  }
}, [userAddress]);
```

### 7.3 Stream Creation Form

**dashboard/streams/create/page.tsx:**
- ✅ Keep existing form layout
- ✅ Add stream templates dropdown
- ✅ Add block height calculator (convert days to blocks)
- ✅ Add preview of vesting schedule
- ✅ Add sBTC balance check
- ✅ Add post-condition builder UI

**New Features:**
```typescript
const templates = [
  { name: '30-Day Salary', days: 30 },
  { name: '90-Day Contract', days: 90 },
  { name: '1-Year Vesting', days: 365 },
  { name: '4-Year Vesting (Startup)', days: 1460 },
];

function blocksFromDays(days: number): number {
  // Bitcoin: ~10 min blocks = 144 blocks/day
  return days * 144;
}

<Select onValueChange={(value) => {
  const template = templates.find(t => t.name === value);
  const blocks = blocksFromDays(template.days);
  setEndBlock(currentBlock + blocks);
}}>
  <SelectTrigger>
    <SelectValue placeholder="Choose a template" />
  </SelectTrigger>
  <SelectContent>
    {templates.map(t => (
      <SelectItem key={t.name} value={t.name}>
        {t.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 7.4 Stream Detail Page

**New File:** `dashboard/streams/[id]/page.tsx`

**Features:**
- Large progress visualization (animated)
- Real-time vesting counter (updates every 10 seconds)
- Transaction history from blockchain
- Stream NFT display (if minted)
- QR code for sharing stream link
- Withdraw/Cancel buttons with confirmations

```typescript
export default function StreamDetailPage({ params }) {
  const { stream, loading } = useStreamData(params.id);
  const { vested } = useStreamUpdates(params.id);
  const { currentBlock } = useBlockHeight();

  const { percentage, available } = useMemo(() =>
    calculateVestedAmount(
      stream.amount,
      stream.startBlock,
      stream.endBlock,
      currentBlock,
      stream.withdrawn
    ),
    [stream, currentBlock]
  );

  return (
    <div>
      <h1>{stream.description || `Stream #${params.id}`}</h1>

      {/* Large Progress Circle */}
      <CircularProgress value={percentage} />

      {/* Stats Grid */}
      <div className="grid grid-cols-3">
        <StatCard
          title="Total Amount"
          value={`${stream.amount / 1e8} sBTC`}
        />
        <StatCard
          title="Vested"
          value={`${vested / 1e8} sBTC`}
          highlight
        />
        <StatCard
          title="Available"
          value={`${available / 1e8} sBTC`}
        />
      </div>

      {/* Timeline */}
      <StreamTimeline
        startBlock={stream.startBlock}
        endBlock={stream.endBlock}
        currentBlock={currentBlock}
      />

      {/* Actions */}
      {available > 0 && (
        <Button onClick={() => withdrawFromStream(params.id)}>
          Withdraw {available / 1e8} sBTC
        </Button>
      )}
    </div>
  );
}
```

### 7.5 NFT Gallery

**New File:** `dashboard/nfts/page.tsx`

**Purpose:** Display all stream NFTs owned by user

```typescript
export default function NFTGalleryPage() {
  const { address } = useWallet();
  const { nfts, loading } = useUserNFTs(address);

  return (
    <div className="nft-gallery">
      <h1>Stream NFTs</h1>
      <p>Your tokenized payment streams</p>

      <div className="grid grid-cols-3 gap-6">
        {nfts.map(nft => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onClick={() => router.push(`/dashboard/streams/${nft.streamId}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Implementation Priority

### Phase 1: Critical Foundation (Week 1)
**Priority: CRITICAL**

1. **Stacks Wallet Integration**
   - Install @stacks/connect, @stacks/transactions
   - Create wallet connection component
   - Replace Turnkey as primary auth
   - File: `components/wallet/WalletConnect.tsx`

2. **Contract Read Functions**
   - Implement read-only hooks for all queries
   - Files: `hooks/use-bitpay-read.ts`

3. **Block Height Tracking**
   - Stacks API integration
   - Real-time block updates
   - File: `hooks/use-block-height.ts`

4. **Basic Contract Writes**
   - create-stream
   - withdraw-from-stream
   - cancel-stream
   - File: `hooks/use-bitpay-contract.ts`

**Deliverables:**
- Users can connect Hiro/Leather wallet
- Users can create real streams on testnet
- Users can view their streams from blockchain
- Users can withdraw/cancel streams

### Phase 2: Real-time Features (Week 2)
**Priority: HIGH**

1. **Chainhook Setup**
   - Deploy Chainhook observer
   - Create webhook endpoints
   - Test event capture

2. **Dashboard Data Migration**
   - Remove all mock data
   - Replace with real contract calls
   - Update stats calculations

3. **Stream Detail Page**
   - Build full detail view
   - Real-time vesting updates
   - Transaction history

4. **Vesting Visualization**
   - Progress bars with real data
   - Countdown timers
   - Block-based calculations

**Deliverables:**
- Real-time dashboard updates
- Accurate vesting calculations
- Live event notifications

### Phase 3: Advanced Features (Week 3)
**Priority: MEDIUM**

1. **NFT Integration**
   - Mint NFT on stream creation
   - NFT gallery page
   - NFT metadata generation
   - NFT image generation

2. **Fee Collection**
   - Integrate treasury contract
   - Display fees in UI
   - Admin treasury panel

3. **Stream Templates**
   - Pre-configured durations
   - Quick create flow
   - Custom template builder

4. **Analytics Enhancement**
   - Real blockchain metrics
   - Cash flow projections
   - Vesting schedules visualization

**Deliverables:**
- Stream NFTs working
- Fee collection active
- Templates for quick stream creation

### Phase 4: Polish & Optimization (Week 4)
**Priority: LOW**

1. **Performance**
   - Query result caching
   - Optimistic UI updates
   - Lazy loading for large lists

2. **UX Enhancements**
   - Loading states
   - Error boundaries
   - Toast notifications
   - Empty states

3. **Documentation**
   - User guide
   - API documentation
   - Integration examples

4. **Testing**
   - E2E tests
   - Contract interaction tests
   - Error scenario testing

**Deliverables:**
- Production-ready application
- Complete documentation
- Tested user flows

---

## 9. Key Files to Modify

### 9.1 High Priority Modifications

```
bitpay-frontend/
├── app/
│   ├── layout.tsx                    # ✅ MODIFY: Add Stacks providers
│   ├── api/
│   │   ├── stacks/                   # ❌ CREATE: New folder
│   │   │   ├── block-height/route.ts
│   │   │   ├── transaction/[id]/route.ts
│   │   │   └── account/[address]/route.ts
│   │   ├── streams/                  # ❌ CREATE: New folder
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/vested/route.ts
│   │   └── webhooks/                 # ❌ CREATE: New folder
│   │       └── chainhook/route.ts
│   ├── dashboard/
│   │   ├── page.tsx                  # ✅ MODIFY: Replace mock data
│   │   ├── streams/
│   │   │   ├── page.tsx              # ✅ MODIFY: Real contract calls
│   │   │   ├── create/page.tsx       # ✅ MODIFY: Add contract write
│   │   │   └── [id]/page.tsx         # ❌ CREATE: New detail page
│   │   └── nfts/
│   │       └── page.tsx              # ❌ CREATE: NFT gallery
├── components/
│   ├── wallet/
│   │   ├── WalletConnect.tsx         # ❌ CREATE: Stacks wallet
│   │   └── WalletButton.tsx          # ❌ CREATE: Connect button
│   ├── stream/
│   │   ├── StreamProgress.tsx        # ❌ CREATE: Progress viz
│   │   ├── StreamTimeline.tsx        # ❌ CREATE: Timeline
│   │   └── VestingChart.tsx          # ❌ CREATE: Vesting chart
│   └── nft/
│       └── NFTCard.tsx               # ❌ CREATE: NFT display
├── hooks/
│   ├── use-bitpay-contract.ts        # ❌ CREATE: Contract writes
│   ├── use-bitpay-read.ts            # ❌ CREATE: Contract reads
│   ├── use-stream-data.ts            # ❌ CREATE: Stream queries
│   ├── use-block-height.ts           # ❌ CREATE: Block tracking
│   ├── use-stream-events.ts          # ❌ CREATE: Event listening
│   └── use-wallet.ts                 # ❌ CREATE: Wallet state
├── lib/
│   ├── stacks/
│   │   ├── network.ts                # ❌ CREATE: Network config
│   │   ├── contracts.ts              # ❌ CREATE: Contract addresses
│   │   └── post-conditions.ts        # ❌ CREATE: PC builders
│   ├── vesting/
│   │   └── calculator.ts             # ❌ CREATE: Vesting math
│   └── notifications/
│       └── stream-events.ts          # ❌ CREATE: Pusher/WS
└── chainhooks/
    └── bitpay-streams.json           # ❌ CREATE: Chainhook config
```

### 9.2 Configuration Files

**package.json - Add Dependencies:**
```json
{
  "dependencies": {
    "@stacks/connect": "^7.9.0",
    "@stacks/connect-react": "^23.0.0",
    "@stacks/transactions": "^6.16.0",
    "@stacks/network": "^6.16.0",
    "@stacks/encryption": "^6.16.0",
    "@stacks/stacking": "^6.16.0",
    "pusher": "^5.2.0",
    "pusher-js": "^8.4.0-rc2",
    "swr": "^2.2.4"
  }
}
```

**.env.local:**
```bash
# Stacks Network
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Contract Addresses
NEXT_PUBLIC_BITPAY_CORE_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_BITPAY_CORE_NAME=bitpay-core

# Chainhook
CHAINHOOK_SECRET=your-secret-token-here
CHAINHOOK_URL=http://localhost:20456

# Real-time Updates
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

---

## 10. Summary Checklist

### Critical Path (Must Have)
- [ ] Stacks wallet connection (Hiro/Leather)
- [ ] Contract read functions working
- [ ] Contract write functions working (create, withdraw, cancel)
- [ ] Real-time block height tracking
- [ ] Vesting calculation with real data
- [ ] Dashboard showing real streams
- [ ] Stream creation form calling contract
- [ ] Withdraw/cancel functionality

### High Priority (Should Have)
- [ ] Chainhook event monitoring
- [ ] Webhook endpoints for events
- [ ] Real-time notifications
- [ ] Stream detail page
- [ ] Transaction history
- [ ] Stream templates
- [ ] sBTC balance display

### Medium Priority (Nice to Have)
- [ ] NFT minting integration
- [ ] NFT gallery
- [ ] Fee collection integration
- [ ] Treasury admin panel
- [ ] Analytics with real data
- [ ] Bulk stream creation

### Future Enhancements
- [ ] Delta streams (variable rate)
- [ ] Oracle integration
- [ ] Stream2Earn SDK
- [ ] Developer API
- [ ] Mobile app

---

## Conclusion

This modification plan transforms the BitPay frontend from a mock-data prototype to a fully functional Bitcoin streaming payment platform. The phased approach ensures critical functionality is delivered first while allowing for iterative improvements.

**Estimated Timeline:** 4 weeks for core functionality + polish
**Team Size:** 1-2 developers
**Technologies:** Next.js 15, Stacks.js, Chainhook, sBTC

**Next Steps:**
1. Review and approve this plan
2. Set up development environment (testnet wallets, Chainhook)
3. Begin Phase 1 implementation
4. Deploy to testnet for testing
5. Iterate based on user feedback
6. Prepare for mainnet launch (post-audit)
