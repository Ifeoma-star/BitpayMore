# BitPay Deployment Guide

Complete production deployment guide for all BitPay components.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [WebSocket Server Deployment](#websocket-server-deployment)
6. [Database Setup](#database-setup)
7. [Chainhook Configuration](#chainhook-configuration)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

BitPay consists of **4 main components** that need to be deployed:

```mermaid
graph TB
    subgraph "Stacks Blockchain"
        A[Smart Contracts]
    end

    subgraph "Vercel"
        B[Next.js Frontend]
    end

    subgraph "Render"
        C[WebSocket Server]
    end

    subgraph "MongoDB Atlas"
        D[Database]
    end

    subgraph "Hiro Platform"
        E[Chainhook Service]
    end

    B --> A
    B --> C
    B --> D
    E --> B
    E --> A

    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#f7b731
    style E fill:#5f27cd
```

### Deployment Checklist

- [ ] Deploy smart contracts to Stacks testnet/mainnet
- [ ] Set up MongoDB Atlas database
- [ ] Deploy WebSocket server to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure Chainhook predicates
- [ ] Set up monitoring and alerts
- [ ] Test end-to-end flows

---

## Prerequisites

### Required Accounts

1. **Stacks Wallet** - For contract deployment
2. **Vercel Account** - For frontend hosting
3. **Render Account** - For WebSocket server
4. **MongoDB Atlas** - For database hosting
5. **Hiro Platform** - For Chainhook service

### Required Tools

```bash
# Install Clarinet (contract deployment)
brew install clarinet

# Install Vercel CLI
npm install -g vercel

# Install Node.js 18+
node --version  # v18.0.0 or higher
```

---

## Smart Contract Deployment

### 1. Prepare Contracts

```bash
cd contract

# Run tests
clarinet test

# Check syntax
clarinet check
```

### 2. Deploy to Testnet

```bash
# Deploy all contracts
clarinet deploy --testnet

# Output example:
# ✅ Deployed bitpay-access-control at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-access-control
# ✅ Deployed bitpay-sbtc-helper at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-sbtc-helper
# ✅ Deployed bitpay-core at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core
# ✅ Deployed bitpay-treasury at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-treasury
# ✅ Deployed bitpay-marketplace at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-marketplace
# ✅ Deployed bitpay-nft at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-nft
# ✅ Deployed bitpay-obligation-nft at ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-obligation-nft
```

### 3. Verify Deployment

```bash
# Check contract on explorer
open "https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=testnet"

# Verify contract code
clarinet console

# In console:
> (contract-call? .bitpay-core get-stream-count)
(ok u0)
```

### 4. Initialize Contracts

```bash
# Set up treasury admins (first admin)
clarinet console

> (contract-call? .bitpay-treasury add-admin 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7)

# Set approval threshold
> (contract-call? .bitpay-treasury set-approval-threshold u2)
```

### 5. Deploy to Mainnet

```bash
# IMPORTANT: Audit contracts first!
# Get professional security audit before mainnet

# Deploy to mainnet
clarinet deploy --mainnet

# Fund deployer wallet with sufficient STX for fees
```

### Deployment Flow

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Wallet
    participant Clarinet
    participant Stacks as Stacks Blockchain
    participant Explorer

    Dev->>Clarinet: clarinet deploy --testnet
    Clarinet->>Clarinet: Compile contracts
    Clarinet->>Wallet: Request deployment signature

    Wallet->>Dev: Confirm transactions
    Dev->>Wallet: Approve

    Wallet->>Stacks: Broadcast transactions
    Stacks->>Stacks: Process contracts (7 txs)
    Stacks-->>Clarinet: Deployment complete

    Clarinet-->>Dev: Contract addresses

    Dev->>Explorer: Verify deployment
    Explorer-->>Dev: Contracts live
```

---

## Frontend Deployment

### 1. Prepare for Deployment

```bash
cd bitpay-frontend

# Install dependencies
npm install

# Build locally to test
npm run build

# Check for errors
npm run lint
```

### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# ? Set up and deploy "~/bitpay-frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? bitpay-frontend
# ? In which directory is your code located? ./

# Production deployment
vercel --prod
```

### 3. Configure Environment Variables

```bash
# Set environment variables in Vercel dashboard
# Or via CLI:

vercel env add MONGODB_URI production
# Enter value: mongodb+srv://...

vercel env add NEXTAUTH_SECRET production
# Enter value: your-secret-key

vercel env add NEXT_PUBLIC_BITPAY_DEPLOYER_ADDRESS production
# Enter value: ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7

# Add all required variables from .env.example
```

### 4. Set Up Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add bitpay.app

# Configure DNS:
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com
```

### 5. Verify Deployment

```bash
# Visit deployed URL
open https://bitpay-frontend.vercel.app

# Check build logs
vercel logs
```

---

## WebSocket Server Deployment

### 1. Prepare Server

```bash
cd bitpay-websocket-server

# Test locally
npm install
npm start

# Server should start on port 4000
```

### 2. Deploy to Render

**Method 1: Via Render Dashboard**

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** bitpay-websocket
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/month)

**Method 2: Via render.yaml**

```yaml
# render.yaml (already in repo)
services:
  - type: web
    name: bitpay-websocket
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 4000
      - key: ALLOWED_ORIGINS
        value: https://bitpay-more.vercel.app
      - key: NODE_ENV
        value: production
```

```bash
# Deploy using render.yaml
render blueprint create
```

### 3. Set Environment Variables

In Render dashboard, add:

```
PORT=4000
ALLOWED_ORIGINS=https://bitpay-more.vercel.app,https://bitpay.app
NODE_ENV=production
```

### 4. Get WebSocket URL

```bash
# Render provides URL like:
# https://bitpay-websocket.onrender.com

# Test health endpoint
curl https://bitpay-websocket.onrender.com/health

# Response:
# {"status":"ok","timestamp":"2025-01-15T10:00:00.000Z"}
```

### 5. Update Frontend Environment

```bash
# In Vercel, update:
vercel env add NEXT_PUBLIC_SOCKET_URL production
# Value: https://bitpay-websocket.onrender.com
```

---

## Database Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create account (free tier available)
3. Create new cluster:
   - **Cloud Provider:** AWS
   - **Region:** us-east-1 (or closest to Vercel)
   - **Tier:** M0 (Free) or M10 (Production)
   - **Cluster Name:** bitpay-cluster

### 2. Configure Database Access

```bash
# 1. Database Access → Add New Database User
Username: bitpay-admin
Password: [auto-generate secure password]
Role: Read and write to any database

# 2. Network Access → Add IP Address
# For Vercel: Add 0.0.0.0/0 (allow from anywhere)
# For production: Use Vercel's static IPs
```

### 3. Get Connection String

```bash
# Click "Connect" → "Connect your application"
# Copy connection string:

mongodb+srv://bitpay-admin:<password>@bitpay-cluster.abc123.mongodb.net/bitpay?retryWrites=true&w=majority

# Replace <password> with your actual password
```

### 4. Create Database & Collections

```javascript
// Connect via MongoDB Compass or mongosh
use bitpay

// Create collections
db.createCollection("users")
db.createCollection("streams")
db.createCollection("listings")
db.createCollection("treasury_proposals")

// Create indexes for performance
db.streams.createIndex({ streamId: 1 }, { unique: true })
db.streams.createIndex({ sender: 1 })
db.streams.createIndex({ recipient: 1 })
db.streams.createIndex({ status: 1 })

db.listings.createIndex({ listingId: 1 }, { unique: true })
db.listings.createIndex({ streamId: 1 })
db.listings.createIndex({ status: 1 })

db.users.createIndex({ walletAddress: 1 }, { unique: true })
```

### 5. Set Up Backups

```bash
# In Atlas dashboard:
# Cluster → Backup → Enable Cloud Backup
# Snapshot frequency: Daily
# Retention: 7 days (free tier) or longer
```

---

## Chainhook Configuration

### 1. Get Hiro Platform API Key

1. Go to [platform.hiro.so](https://platform.hiro.so)
2. Sign up / Log in
3. Create new project: "BitPay"
4. Copy API key

### 2. Create Predicate Files

**streams-predicate.json:**

```json
{
  "chain": "stacks",
  "uuid": "bitpay-streams-v1",
  "name": "BitPay Stream Events",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "contract_call",
        "contract_identifier": "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core",
        "method": ["create-stream", "withdraw-from-stream", "cancel-stream"]
      },
      "then_that": {
        "http_post": {
          "url": "https://bitpay-more.vercel.app/api/webhooks/chainhook/streams",
          "authorization_header": "Bearer YOUR_CHAINHOOK_SECRET_TOKEN"
        }
      }
    }
  }
}
```

### 3. Deploy Predicates

```bash
# Deploy streams predicate
curl -X POST https://api.hiro.so/chainhooks \
  -H "Authorization: Bearer YOUR_HIRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @streams-predicate.json

# Deploy marketplace predicate
curl -X POST https://api.hiro.so/chainhooks \
  -H "Authorization: Bearer YOUR_HIRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @marketplace-predicate.json

# Deploy treasury predicate
curl -X POST https://api.hiro.so/chainhooks \
  -H "Authorization: Bearer YOUR_HIRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @treasury-predicate.json
```

### 4. Verify Predicates

```bash
# List active predicates
curl https://api.hiro.so/chainhooks \
  -H "Authorization: Bearer YOUR_HIRO_API_KEY"

# Should return all 3 predicates
```

### 5. Test Webhooks

```bash
# Create test stream on testnet
# Check logs in Vercel dashboard
vercel logs --follow

# Should see:
# [Webhook] Received stream-created event
```

---

## Environment Variables

### Complete Environment Configuration

**Frontend (.env.production):**

```bash
# Database
MONGODB_URI=mongodb+srv://bitpay-admin:PASSWORD@bitpay-cluster.abc123.mongodb.net/bitpay

# Authentication
NEXTAUTH_SECRET=min-32-char-secret-key-for-production
NEXTAUTH_URL=https://bitpay-more.vercel.app
JWT_SECRET=min-32-char-jwt-secret
ENCRYPTION_KEY=min-32-char-encryption-key

# Blockchain
NEXT_PUBLIC_STACKS_NETWORK=testnet
STACKS_API_URL=https://api.hiro.so/extended/v1
NEXT_PUBLIC_BITPAY_DEPLOYER_ADDRESS=ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7
NEXT_PUBLIC_SBTC_TOKEN_ADDRESS=ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT

# WebSocket
NEXT_PUBLIC_SOCKET_URL=https://bitpay-websocket.onrender.com
SOCKET_SERVER_URL=https://bitpay-websocket.onrender.com

# Chainhook
CHAINHOOK_SECRET_TOKEN=secure-random-token-min-32-chars
HIRO_PLATFORM_API_KEY=your-hiro-api-key

# Turnkey (optional)
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-turnkey-org-id
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_ID=your-auth-proxy-id

# App URLs
NEXT_PUBLIC_API_URL=https://bitpay-more.vercel.app
NEXT_PUBLIC_APP_URL=https://bitpay-more.vercel.app
```

**WebSocket Server (.env):**

```bash
PORT=4000
ALLOWED_ORIGINS=https://bitpay-more.vercel.app,https://bitpay.app
NODE_ENV=production
```

---

## Monitoring & Logging

### 1. Vercel Analytics

```bash
# Enable in Vercel dashboard:
# Project → Analytics → Enable

# Track custom events in code:
import { track } from '@vercel/analytics';

track('stream_created', { amount: 1000 });
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs

# next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // ... next config
}, {
  org: 'your-org',
  project: 'bitpay-frontend',
});
```

### 3. Database Monitoring

```bash
# MongoDB Atlas Dashboard:
# - Query performance
# - Slow queries
# - Connection pool stats
# - Disk usage alerts
```

### 4. WebSocket Monitoring

```bash
# In Render dashboard:
# - CPU usage
# - Memory usage
# - Request count
# - Response times

# Add custom metrics in server.js:
let connectedClients = 0;

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`📊 Connected clients: ${connectedClients}`);

  socket.on('disconnect', () => {
    connectedClients--;
  });
});
```

### 5. Health Checks

```bash
# Frontend health check
curl https://bitpay-more.vercel.app/api/health

# WebSocket health check
curl https://bitpay-websocket.onrender.com/health

# Database health check (in API route)
GET /api/health → checks MongoDB connection
```

---

## Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails

```bash
# Error: Insufficient funds
# Solution: Fund deployer wallet with STX

# Error: Contract already exists
# Solution: Use different deployer address or increment contract version

# Error: Syntax error in contract
# Solution: Run clarinet check to find errors
```

#### 2. Frontend Build Fails

```bash
# Error: Module not found
npm install  # Reinstall dependencies

# Error: Type errors
npm run type-check  # Check TypeScript errors

# Error: Environment variable undefined
# Check Vercel dashboard → Settings → Environment Variables
```

#### 3. WebSocket Connection Fails

```bash
# Error: CORS policy
# Add frontend URL to ALLOWED_ORIGINS in WebSocket server

# Error: Connection timeout
# Check Render service is running
# Check firewall/network settings

# Error: 502 Bad Gateway
# WebSocket server crashed, check Render logs
```

#### 4. Webhook Not Triggering

```bash
# Check predicate is active:
curl https://api.hiro.so/chainhooks \
  -H "Authorization: Bearer YOUR_HIRO_API_KEY"

# Check webhook URL is correct and accessible
curl https://bitpay-more.vercel.app/api/webhooks/chainhook/streams

# Check authorization header matches CHAINHOOK_SECRET_TOKEN

# Check Vercel function logs for errors
```

#### 5. Database Connection Issues

```bash
# Error: Authentication failed
# Check username/password in connection string

# Error: IP not whitelisted
# Add Vercel IPs to MongoDB Atlas Network Access

# Error: Too many connections
# Implement connection pooling
# Increase connection limit in Atlas
```

---

## Production Checklist

### Pre-Launch

- [ ] Smart contracts professionally audited
- [ ] All tests passing (90%+ coverage)
- [ ] Environment variables secured (not in code)
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Error tracking configured (Sentry)
- [ ] Rate limiting implemented
- [ ] HTTPS/SSL certificates valid
- [ ] Custom domain configured
- [ ] Legal documents prepared (Terms, Privacy)

### Launch Day

- [ ] Deploy contracts to mainnet
- [ ] Update frontend with mainnet addresses
- [ ] Deploy frontend to production
- [ ] Deploy WebSocket server
- [ ] Configure production Chainhooks
- [ ] Verify all integrations working
- [ ] Monitor error rates closely
- [ ] Have rollback plan ready

### Post-Launch

- [ ] Monitor performance metrics
- [ ] Track user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan feature iterations
- [ ] Scale infrastructure as needed

---

## Scaling Guide

### When to Scale

**Frontend (Vercel):**
- Vercel auto-scales, upgrade plan if needed
- Pro plan: $20/month per member
- Enterprise: Custom pricing

**WebSocket Server (Render):**
- Starter: $7/month (512MB RAM)
- Standard: $25/month (2GB RAM)
- Pro: $85/month (4GB RAM)

**Database (MongoDB Atlas):**
- M0: Free (shared, 512MB)
- M10: $57/month (2GB RAM, dedicated)
- M20: $140/month (4GB RAM)
- M30+: Production workloads

### Performance Optimization

```bash
# Enable CDN caching
# Add to next.config.js:
headers: async () => [{
  source: '/:all*(svg|jpg|png)',
  headers: [{
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  }],
}]

# Database indexing
db.streams.createIndex({ sender: 1, status: 1 })
db.streams.createIndex({ recipient: 1, status: 1 })

# Connection pooling
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

---

## Next Steps

- [System Architecture](ARCHITECTURE.md)
- [Smart Contracts](CONTRACTS.md)
- [Webhook Integration](WEBHOOKS.md)
- [WebSocket Communication](WEBSOCKET.md)

---

**Deployment complete! 🎉**

Your BitPay instance is now live and ready to stream Bitcoin payments.
