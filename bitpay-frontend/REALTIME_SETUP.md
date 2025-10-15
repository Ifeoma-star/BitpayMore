# 🚀 Real-Time WebSocket Setup Guide

## Overview

BitPay now uses **Socket.io** for real-time blockchain event updates. No more polling - events arrive instantly via WebSocket!

## 🏗️ Architecture

```
Blockchain Event → Chainhook → Webhook Handler → Socket.io → Client UI
     ↓                ↓              ↓               ↓          ↓
  Stream created   Monitors    Saves to DB     Broadcasts   Updates
  on-chain         blocks      + sends to      to users     instantly
                              Socket.io
```

## 📦 What's Included

### Server Side

1. **`/lib/socket/server.ts`** - Socket.io server setup
   - Room-based broadcasting (user rooms, stream rooms, marketplace)
   - Helper functions: `broadcastToUser()`, `broadcastToStream()`, etc.

2. **`/server.ts`** - Custom Next.js server with Socket.io
   - Runs on port 3000
   - Handles both HTTP and WebSocket connections

3. **Webhook handlers** - Updated to broadcast events
   - `/api/webhooks/chainhook/streams/route.ts` - Example with WebSocket broadcasting

### Client Side

1. **`/hooks/use-realtime.ts`** - React hooks for real-time data
   - `useRealtime()` - Core WebSocket connection
   - `useStreamEvents(streamId)` - Listen to specific stream
   - `useUserEvents()` - Listen to user-specific events
   - `useMarketplaceEvents()` - Listen to marketplace updates

2. **`/components/realtime/RealtimeIndicator.tsx`** - Connection status indicator

3. **`/components/realtime/LiveStreamUpdates.tsx`** - Example real-time notification component

## 🚀 Getting Started

### 1. Start the Server

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════╗
║   🚀 BitPay Server Running                ║
║   > Local:    http://localhost:3000       ║
║   ⚡ Socket.io: Enabled                    ║
║   📡 Real-time: Active                     ║
╚════════════════════════════════════════════╝
```

### 2. Add Real-Time Indicator to Layout

```typescript
// app/dashboard/layout.tsx
import { RealtimeIndicator } from '@/components/realtime/RealtimeIndicator';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header>
        <RealtimeIndicator /> {/* Shows "Live" when connected */}
      </header>
      {children}
    </div>
  );
}
```

### 3. Use in Components

#### Example 1: Stream Detail Page with Live Updates

```typescript
'use client';

import { useStreamEvents } from '@/hooks/use-realtime';
import { LiveStreamUpdates } from '@/components/realtime/LiveStreamUpdates';

export default function StreamDetailPage({ params }: { params: { id: string } }) {
  const { streamData, lastEvent, isConnected } = useStreamEvents(params.id);

  return (
    <div>
      <h1>Stream #{params.id}</h1>

      {/* Show live updates banner */}
      <LiveStreamUpdates streamId={params.id} />

      {/* Stream data updates automatically */}
      {lastEvent && (
        <div className="bg-green-50 p-2 rounded">
          🎉 Updated {lastEvent.type} - {new Date().toLocaleTimeString()}
        </div>
      )}

      {/* Your stream UI here */}
    </div>
  );
}
```

#### Example 2: Dashboard with User Events

```typescript
'use client';

import { useUserEvents } from '@/hooks/use-realtime';

export default function Dashboard() {
  const { events, isConnected } = useUserEvents();

  return (
    <div>
      <h1>My Streams</h1>

      {/* Live event feed */}
      <div className="space-y-2">
        {events.slice(0, 5).map((event, i) => (
          <div key={i} className="p-3 bg-orange-50 rounded-lg">
            <span className="font-semibold">{event.type}</span>
            <span className="text-sm text-gray-600 ml-2">
              {event.role === 'sender' ? 'You sent' : 'You received'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Example 3: Marketplace with Live Listings

```typescript
'use client';

import { useMarketplaceEvents } from '@/hooks/use-realtime';

export default function Marketplace() {
  const { listings, sales, isConnected } = useMarketplaceEvents();

  return (
    <div>
      <h1>Marketplace</h1>

      {/* New listings appear automatically */}
      {listings.map((listing) => (
        <div key={listing.streamId} className="animate-in fade-in">
          🆕 New: Stream #{listing.streamId} - {listing.price} sats
        </div>
      ))}

      {/* Your marketplace grid here */}
    </div>
  );
}
```

## 📡 WebSocket Events Reference

### Stream Events

```typescript
socket.on('stream:created', (data) => {
  // New stream created
  // data.role: 'sender' | 'recipient'
  // data.data: { streamId, sender, recipient, amount, ... }
});

socket.on('stream:updated', (data) => {
  // Stream updated (withdrawal, cancellation)
  // data.type: 'created' | 'withdrawal' | 'cancelled'
});
```

### Marketplace Events

```typescript
socket.on('marketplace:new-listing', (data) => {
  // New NFT listed
});

socket.on('marketplace:listing-updated', (data) => {
  // Listing price updated
});

socket.on('marketplace:listing-cancelled', (data) => {
  // Listing cancelled
});

socket.on('marketplace:sale', (data) => {
  // Sale completed
});
```

### User Events

Users automatically join their own room based on wallet address. All events related to that user are sent to their room.

## 🔧 How to Add WebSocket Broadcasting to New Webhook Handlers

```typescript
// In any webhook handler (e.g., marketplace/route.ts)
import { broadcastToUser, broadcastToMarketplace } from '@/lib/socket/server';

async function handleNFTListed(event, context) {
  // 1. Save to database
  await db.collection('listings').insertOne({ ... });

  // 2. Broadcast to seller's room
  broadcastToUser(event.seller, 'marketplace:new-listing', {
    streamId: event['stream-id'],
    price: event.price,
    timestamp: Date.now(),
  });

  // 3. Broadcast to all marketplace viewers
  broadcastToMarketplace('marketplace:new-listing', {
    streamId: event['stream-id'],
    price: event.price,
  });
}
```

## 🎯 Benefits

✅ **Instant Updates** - No 30-second polling delay
✅ **Lower Server Load** - WebSocket vs constant HTTP requests
✅ **Better UX** - Users see changes as they happen
✅ **Scalable** - Socket.io handles millions of connections
✅ **Room-Based** - Only send events to interested users

## 🐛 Debugging

### Check WebSocket Connection

Open browser console:
```javascript
// Should log when connected
✅ WebSocket connected: socket-id-123
```

### Test Broadcasting

```typescript
// In your webhook handler
console.log('Broadcasting to user:', walletAddress);
broadcastToUser(walletAddress, 'test', { message: 'Hello!' });
```

### Monitor Socket Rooms

```typescript
// In server.ts, add logging
io.on('connection', (socket) => {
  console.log('Rooms:', socket.rooms);
});
```

## 📝 Next Steps

1. ✅ Server and client setup complete
2. ✅ Example hooks and components created
3. ⏳ Add to remaining webhook handlers (marketplace, treasury, access-control)
4. ⏳ Integrate into dashboard pages
5. ⏳ Add toast notifications for events
6. ⏳ Add sound/desktop notifications (optional)

## 🔗 Resources

- [Socket.io Docs](https://socket.io/docs/v4/)
- [Next.js Custom Server](https://nextjs.org/docs/advanced-features/custom-server)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Real-time updates are now live! 🚀**
