# BitPay Notification System

Complete notification infrastructure for the BitPay platform with in-app and email notifications.

## Architecture Overview

```
Blockchain Event → Chainhook → Webhook → Database + Notifications → User (In-App + Email)
```

The notification system provides dual-channel delivery:

- **In-App Notifications**: Stored in MongoDB, displayed in dashboard
- **Email Notifications**: Sent via Nodemailer with EJS templates

## Features

✅ **19 Notification Types** covering all platform events
✅ **User Preferences** for granular control over notifications
✅ **Priority Levels** (low, medium, high, urgent, critical)
✅ **Email Templates** with professional HTML/CSS design
✅ **Real-time Unread Count** with badge in navigation
✅ **Mark as Read** functionality
✅ **Notification Center** full-page view with filtering
✅ **Email Verification** for secure email delivery

## Components

### Backend Services

#### 1. Notification Service (`lib/notifications/notification-service.ts`)

Core service handling notification creation and delivery.

**Key Functions:**

- `createNotification()` - Creates in-app notification
- `notifyStreamCreated()` - Stream creation notifications
- `notifyStreamWithdrawal()` - Withdrawal notifications
- `notifyStreamCancelled()` - Cancellation notifications
- `notifyPurchaseCompleted()` - Marketplace purchase notifications
- `notifyWithdrawalProposal()` - Treasury proposal notifications
- `getUserPreferences()` - Fetch user notification preferences
- `updateUserPreferences()` - Update notification preferences
- `markAsRead()` - Mark notification as read
- `getUnreadCount()` - Get unread count for badge
- `getUserNotifications()` - Fetch user's notifications with pagination

#### 2. Email Service (`lib/email/email-service.ts`)

Email delivery with EJS template rendering.

**Email Templates:**

- `stream-created.ejs` - Stream creation confirmation
- `stream-withdrawal.ejs` - Withdrawal confirmation
- `stream-cancelled.ejs` - Cancellation notification
- `purchase-completed.ejs` - Purchase confirmation (buyer)
- `sale-completed.ejs` - Sale confirmation (seller)
- `withdrawal-proposal.ejs` - Treasury withdrawal proposal
- `security-alert.ejs` - Security warnings

**Configuration (Environment Variables):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=notifications@bitpay.app
FROM_NAME=BitPay
```

### API Routes

#### GET `/api/notifications`

Fetch user's notifications with pagination and filtering.

**Query Parameters:**

- `limit` (default: 20) - Number of notifications to return
- `skip` (default: 0) - Number of notifications to skip
- `status` - Filter by status (unread, read, archived)

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "hasMore": true
  }
}
```

#### GET `/api/notifications/unread-count`

Get user's unread notification count for badge.

**Response:**

```json
{
  "success": true,
  "count": 5
}
```

#### POST `/api/notifications/:id/mark-read`

Mark a specific notification as read.

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### POST `/api/notifications/mark-all-read`

Mark all user's notifications as read.

**Response:**

```json
{
  "success": true,
  "message": "Marked 12 notifications as read",
  "count": 12
}
```

#### GET `/api/notifications/preferences`

Get user's notification preferences.

**Response:**

```json
{
  "success": true,
  "preferences": {
    "userId": "SP2...",
    "emailAddress": "user@example.com",
    "emailVerified": true,
    "inApp": {
      "streams": true,
      "marketplace": true,
      "treasury": true,
      "security": true,
      "system": true
    },
    "emailNotifications": {
      "streams": true,
      "marketplace": true,
      "treasury": true,
      "security": true,
      "system": true,
      "digest": false
    },
    "updatedAt": "2025-10-14T..."
  }
}
```

#### POST `/api/notifications/preferences`

Update user's notification preferences.

**Request Body:**

```json
{
  "emailAddress": "newemail@example.com",
  "inApp": {
    "streams": false
  },
  "emailNotifications": {
    "marketplace": false
  }
}
```

### Frontend Components

#### 1. Notification Bell (`components/dashboard/notification-bell.tsx`)

Navigation bar component with unread badge.

**Features:**

- Real-time unread count badge
- Polling every 30 seconds
- Dropdown preview on click
- Auto-updates when notifications are read

**Usage:**

```tsx
import { NotificationBell } from "@/components/dashboard/notification-bell";

<NotificationBell />;
```

#### 2. Notification Dropdown (`components/dashboard/notification-dropdown.tsx`)

Dropdown showing recent notifications.

**Features:**

- Shows 10 most recent notifications
- Click to mark as read
- Quick access to notification center
- Link to preferences

#### 3. Notification Center (`app/dashboard/notifications/page.tsx`)

Full-page notification management.

**Features:**

- Tabs for All/Unread/Read
- Filtering by status
- Mark all as read
- Detailed notification cards
- Priority badges
- Relative timestamps

#### 4. Preferences Page (`app/dashboard/notifications/preferences/page.tsx`)

User notification settings management.

**Features:**

- Email address configuration
- Email verification status
- In-app notification toggles by category
- Email notification toggles by category
- Daily digest option
- Real-time save

## Notification Types

| Type                    | Description                    | Priority | Channels       |
| ----------------------- | ------------------------------ | -------- | -------------- |
| `stream_created`        | New payment stream created     | medium   | In-App + Email |
| `stream_withdrawal`     | Funds withdrawn from stream    | medium   | In-App + Email |
| `stream_cancelled`      | Stream cancelled by sender     | medium   | In-App + Email |
| `stream_sender_updated` | Stream sender changed          | low      | In-App         |
| `purchase_completed`    | Marketplace purchase completed | high     | In-App + Email |
| `sale_completed`        | Stream sold on marketplace     | high     | In-App + Email |
| `listing_created`       | New marketplace listing        | low      | In-App         |
| `withdrawal_proposal`   | Treasury withdrawal proposed   | urgent   | In-App + Email |
| `withdrawal_approved`   | Withdrawal proposal approved   | high     | In-App         |
| `withdrawal_executed`   | Withdrawal executed            | high     | In-App + Email |
| `security_alert`        | Security warning               | critical | In-App + Email |
| `admin_action_required` | Admin approval needed          | urgent   | In-App + Email |
| `protocol_paused`       | Emergency protocol pause       | critical | In-App + Email |
| `protocol_resumed`      | Protocol resumed               | high     | In-App         |
| `unauthorized_access`   | Unauthorized access attempt    | critical | In-App + Email |
| `role_granted`          | New role assigned              | medium   | In-App         |
| `role_revoked`          | Role removed                   | high     | In-App         |
| `payment_received`      | Payment received               | medium   | In-App         |
| `system_update`         | Platform update                | low      | In-App         |

## Database Schema

### Notifications Collection

```typescript
{
  _id: ObjectId,
  userId: string,              // Principal address
  type: NotificationType,
  priority: NotificationPriority,
  status: 'unread' | 'read' | 'archived',
  title: string,
  message: string,
  data: {
    // Event-specific data
    streamId?: string,
    txHash?: string,
    amount?: string,
    ...
  },
  actionUrl?: string,          // Where to navigate
  actionText?: string,         // CTA button text
  emailSent: boolean,
  emailSentAt?: Date,
  readAt?: Date,
  archivedAt?: Date,
  createdAt: Date,
  expiresAt?: Date            // Optional expiration
}
```

### User Preferences

Stored in `users` collection:

```typescript
{
  address: string,
  notificationPreferences: {
    userId: string,
    emailAddress?: string,
    emailVerified: boolean,
    inApp: {
      streams: boolean,
      marketplace: boolean,
      treasury: boolean,
      security: boolean,
      system: boolean
    },
    emailNotifications: {
      streams: boolean,
      marketplace: boolean,
      treasury: boolean,
      security: boolean,
      system: boolean,
      digest: boolean,
      digestFrequency?: 'daily' | 'weekly'
    },
    updatedAt: Date
  }
}
```

## Webhook Integration

Notifications are automatically triggered from webhook handlers:

### Streams Webhook (`app/api/webhooks/chainhook/streams/route.ts`)

```typescript
await notifyStreamCreated({
  streamId,
  sender,
  recipient,
  amount,
  startBlock,
  endBlock,
  txHash,
});
```

### Marketplace Webhook (`app/api/webhooks/chainhook/marketplace/route.ts`)

```typescript
await notifyPurchaseCompleted({
  streamId,
  buyer,
  seller,
  price,
  marketplaceFee,
  saleId,
  txHash,
});
```

### Treasury Webhook (`app/api/webhooks/chainhook/treasury/route.ts`)

```typescript
await notifyWithdrawalProposal({
  proposalId,
  proposer,
  recipient,
  amount,
  timelockExpires,
  requiredApprovals,
  currentApprovals,
  adminList,
  txHash,
});
```

## Deployment Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/bitpay

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=notifications@bitpay.app
FROM_NAME=BitPay

# App URL for email links
NEXT_PUBLIC_APP_URL=https://bitpay.app
```

### 2. Gmail SMTP Setup

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App-Specific Password
4. Use that password in `SMTP_PASSWORD`

### 3. Database Indexes

Create indexes for optimal performance:

```javascript
// MongoDB shell
db.notifications.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 4. Test Email Configuration

```bash
curl http://localhost:3000/api/notifications/test-email
```

## Usage Examples

### Sending a Custom Notification

```typescript
import { createNotification } from "@/lib/notifications/notification-service";

await createNotification(
  "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JCW",
  "system_update",
  "New Feature Available",
  "Check out our new streaming analytics dashboard!",
  {
    featureId: "analytics-v2",
  },
  {
    priority: "low",
    actionUrl: "/dashboard/analytics",
    actionText: "View Analytics",
  }
);
```

### Fetching Notifications in a Custom Component

```typescript
const [notifications, setNotifications] = useState([]);

async function fetchNotifications() {
  const res = await fetch("/api/notifications?limit=10");
  const data = await res.json();
  setNotifications(data.data.notifications);
}
```

### Updating Preferences Programmatically

```typescript
await fetch("/api/notifications/preferences", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    emailNotifications: {
      streams: false,
      marketplace: true,
    },
  }),
});
```

## Future Enhancements

### Planned Features

- [ ] WebSocket/SSE for real-time notifications (no polling)
- [ ] Push notifications for mobile
- [ ] Notification sound preferences
- [ ] Rich notification templates with images
- [ ] Notification grouping (e.g., "3 new withdrawals")
- [ ] Scheduled digest emails
- [ ] Notification search and filtering
- [ ] Notification templates for admins
- [ ] Multi-language support
- [ ] SMS notifications (via Twilio)

### Performance Optimizations

- [ ] Redis caching for unread counts
- [ ] Batch notification creation for bulk events
- [ ] Email queue with retry logic (Bull/BullMQ)
- [ ] CDN for email template assets
- [ ] Database sharding for high-volume users

## Troubleshooting

### Notifications Not Appearing

1. Check user is authenticated
2. Verify MongoDB connection
3. Check notification preferences
4. Inspect browser console for API errors

### Emails Not Sending

1. Verify SMTP credentials: `npm run test-email`
2. Check SMTP\_\* environment variables
3. Verify email address is set and verified
4. Check spam folder
5. Review server logs for errors

### High Email Delivery Latency

1. Switch to email queue (Bull/BullMQ)
2. Use dedicated email service (SendGrid/AWS SES)
3. Batch emails for digest sending

## Testing

### Unit Tests

```bash
npm run test
```

### Manual Testing

1. Create a stream: Should trigger `stream_created` notification
2. Withdraw from stream: Should trigger `stream_withdrawal`
3. Purchase on marketplace: Should trigger `purchase_completed` and `sale_completed`
4. Check email inbox for corresponding emails

## Support

For issues or questions:

- Open GitHub issue
- Contact: dev@bitpay.app
- Docs: https://docs.bitpay.app/notifications

---

**Last Updated:** October 14, 2025
**Version:** 1.0.0
