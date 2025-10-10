# Chainhook Setup Guide for BitPay

This guide explains how to set up Chainhook to monitor BitPay smart contract events in real-time.

## What is Chainhook?

Chainhook is a reorg-aware transaction indexing engine for Stacks that allows you to trigger actions based on on-chain events. For BitPay, we use it to monitor stream creation, withdrawals, and cancellations.

## Prerequisites

- Docker installed on your system
- BitPay contracts deployed to testnet/mainnet
- A publicly accessible webhook endpoint

## Installation

### 1. Install Chainhook

```bash
# Using Docker (recommended)
docker pull hirosystems/chainhook:latest

# Or install from source
git clone https://github.com/hirosystems/chainhook.git
cd chainhook
cargo install --path .
```

### 2. Configure Chainhook

The `chainhook-config.json` file in the root directory contains the configuration. Update it with:

1. **Replace the webhook URL** with your actual domain:
   ```json
   "url": "https://your-domain.com/api/webhooks/chainhook"
   ```

2. **Set a secure authorization token**:
   ```json
   "authorization_header": "Bearer your-secret-token-here"
   ```

   Generate a secure token:
   ```bash
   openssl rand -hex 32
   ```

   Add this token to your `.env.local`:
   ```
   CHAINHOOK_SECRET_TOKEN=your-secret-token-here
   ```

3. **Update contract identifier** for mainnet when ready:
   ```json
   "contract_identifier": "YOUR_MAINNET_DEPLOYER.bitpay-core"
   ```

### 3. Register the Chainhook

```bash
# For testnet
chainhook predicates register chainhook-config.json --testnet

# For mainnet
chainhook predicates register chainhook-config.json --mainnet
```

### 4. Start Chainhook Service

```bash
# Using Docker
docker run -d \
  --name bitpay-chainhook \
  -p 20456:20456 \
  -v $(pwd)/chainhook-config.json:/config/chainhook-config.json \
  hirosystems/chainhook:latest \
  chainhook predicates scan /config/chainhook-config.json --testnet

# Or using installed binary
chainhook predicates scan chainhook-config.json --testnet --start-block=<your-deployment-block>
```

## Events Monitored

The Chainhook configuration monitors these BitPay events:

### 1. Stream Created
Triggered when: `create-stream` function is called

Event data:
```clarity
{
  event: "stream-created",
  stream-id: uint,
  sender: principal,
  recipient: principal,
  amount: uint,
  start-block: uint,
  end-block: uint
}
```

### 2. Stream Withdrawal
Triggered when: `withdraw-from-stream` function is called

Event data:
```clarity
{
  event: "stream-withdrawal",
  stream-id: uint,
  recipient: principal,
  amount: uint
}
```

### 3. Stream Cancelled
Triggered when: `cancel-stream` function is called

Event data:
```clarity
{
  event: "stream-cancelled",
  stream-id: uint,
  sender: principal,
  unvested-returned: uint,
  vested-paid: uint,
  cancelled-at-block: uint
}
```

## Webhook Handler

The webhook endpoint at `/api/webhooks/chainhook` will:
1. Verify the authorization token
2. Parse the event payload
3. Update your database
4. Trigger real-time notifications (via Pusher/WebSocket)
5. Update frontend state

## Testing

### Test with curl:

```bash
curl -X POST https://your-domain.com/api/webhooks/chainhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "apply": [{
      "block_identifier": {"index": 12345, "hash": "0xabc..."},
      "transactions": [{
        "transaction_identifier": {"hash": "0x123..."},
        "metadata": {
          "success": true,
          "result": "...",
          "events": [{
            "type": "print_event",
            "data": {
              "contract_identifier": "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core",
              "topic": "stream-created",
              "value": {"stream-id": 1, "sender": "SP...", "recipient": "SP...", "amount": 1000000}
            }
          }]
        }
      }]
    }],
    "rollback": []
  }'
```

## Production Deployment

### Using Render.com / Railway / Heroku

1. Deploy your Next.js app
2. Ensure webhook endpoint is publicly accessible
3. Update chainhook-config.json with production URL
4. Register chainhook with --mainnet flag
5. Run chainhook service in background:
   ```bash
   chainhook predicates scan chainhook-config.json --mainnet > /var/log/chainhook.log 2>&1 &
   ```

### Using Docker Compose

```yaml
version: '3.8'
services:
  chainhook:
    image: hirosystems/chainhook:latest
    command: chainhook predicates scan /config/chainhook-config.json --testnet
    volumes:
      - ./chainhook-config.json:/config/chainhook-config.json
    ports:
      - "20456:20456"
    restart: unless-stopped
```

## Monitoring

Check Chainhook logs:
```bash
# Docker
docker logs -f bitpay-chainhook

# Binary
tail -f /var/log/chainhook.log
```

## Troubleshooting

### Webhook not receiving events
1. Check chainhook logs for errors
2. Verify webhook URL is publicly accessible
3. Confirm authorization token matches
4. Test webhook endpoint manually with curl

### Events are delayed
1. Check network connectivity
2. Verify Chainhook is syncing properly
3. Check Stacks node responsiveness

### Reorg handling
Chainhook automatically handles blockchain reorganizations. Your webhook will receive:
- `apply` array: New confirmed blocks
- `rollback` array: Blocks that were removed due to reorg

Always check both arrays in your webhook handler.

## Resources

- [Chainhook Documentation](https://docs.hiro.so/chainhook)
- [Chainhook GitHub](https://github.com/hirosystems/chainhook)
- [Stacks Events](https://docs.stacks.co/docs/write-smart-contracts/principals#events)
