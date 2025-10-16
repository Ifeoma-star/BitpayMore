# BitPay System Architecture

This document provides a comprehensive overview of BitPay's system architecture, component interactions, and data flows with detailed diagrams.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Database Schema](#database-schema)
6. [Integration Points](#integration-points)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)

---

## System Overview

BitPay is a **distributed system** consisting of multiple interconnected components that work together to provide continuous Bitcoin streaming payments. The system follows a **microservices-inspired architecture** with clear separation of concerns.

### Core Components

1. **Smart Contracts (Clarity)** - On-chain logic and state
2. **Frontend Application (Next.js)** - User interface and client logic
3. **WebSocket Server (Socket.io)** - Real-time event broadcasting
4. **Database (MongoDB)** - Off-chain data storage and indexing
5. **Chainhook Service** - Blockchain event monitoring
6. **External Services** - Turnkey, Hiro API, Email

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
    end

    subgraph "Application Layer"
        C[Next.js Frontend]
        D[API Routes]
        E[Authentication]
    end

    subgraph "Real-Time Layer"
        F[WebSocket Server]
        G[Socket.io Rooms]
    end

    subgraph "Blockchain Layer"
        H[Stacks Blockchain]
        I[Smart Contracts]
        J[sBTC Token]
    end

    subgraph "Event Layer"
        K[Chainhook Service]
        L[Webhook Endpoints]
    end

    subgraph "Data Layer"
        M[MongoDB]
        N[Redis Cache]
    end

    subgraph "External Services"
        O[Turnkey Wallet]
        P[Hiro API]
        Q[Email Service]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    C --> H
    D --> M
    D --> F
    H --> I
    I --> J
    I --> K
    K --> L
    L --> M
    L --> F
    L --> Q
    F --> G
    E --> O
    C --> P

    style A fill:#e1f5ff
    style C fill:#ffe1e1
    style F fill:#e1ffe1
    style I fill:#fff5e1
    style M fill:#f5e1ff
```

---

## Component Architecture

### 1. Frontend Architecture

```mermaid
graph LR
    subgraph "Next.js Application"
        A[App Router]
        B[Pages]
        C[API Routes]

        subgraph "UI Components"
            D[Dashboard]
            E[Stream Creator]
            F[Marketplace]
            G[Treasury]
        end

        subgraph "Hooks Layer"
            H[use-bitpay]
            I[use-realtime]
            J[use-auth]
        end

        subgraph "State Management"
            K[React Query]
            L[WebSocket State]
            M[Auth Context]
        end

        subgraph "Services"
            N[Stacks Connect]
            O[Contract Calls]
            P[API Client]
        end
    end

    A --> B
    A --> C
    B --> D
    B --> E
    B --> F
    B --> G
    D --> H
    E --> H
    F --> H
    G --> H
    H --> O
    H --> K
    I --> L
    J --> M
    O --> N
    O --> P

    style D fill:#e1f5ff
    style H fill:#ffe1e1
    style K fill:#e1ffe1
    style N fill:#fff5e1
```

### 2. Smart Contract Architecture

```mermaid
graph TB
    subgraph "Contract Layer"
        A[bitpay-core]
        B[bitpay-treasury]
        C[bitpay-marketplace]
        D[bitpay-nft]
        E[bitpay-obligation-nft]
        F[bitpay-sbtc-helper]
        G[bitpay-access-control]
    end

    subgraph "Token Layer"
        H[sBTC Token]
        I[SIP-009 NFT Trait]
    end

    subgraph "External Contracts"
        J[Stacks Native]
        K[Block Info]
    end

    A --> F
    A --> D
    A --> E
    A --> G
    B --> G
    C --> E
    C --> G
    F --> H
    D --> I
    E --> I
    A --> J
    A --> K

    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style F fill:#f7b731
```

---

## Data Flow Diagrams

### 1. Stream Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Wallet
    participant SmartContract as Smart Contract
    participant Chainhook
    participant WebSocket
    participant Database

    User->>Frontend: Create Stream
    Frontend->>Frontend: Validate Input
    Frontend->>Wallet: Request Signature
    Wallet->>User: Confirm Transaction
    User->>Wallet: Approve
    Wallet->>SmartContract: create-stream(recipient, amount, duration)

    SmartContract->>SmartContract: Validate Parameters
    SmartContract->>SmartContract: Transfer sBTC to Contract
    SmartContract->>SmartContract: Store Stream Data
    SmartContract->>SmartContract: Mint Obligation NFT
    SmartContract-->>Wallet: Transaction Success

    Wallet-->>Frontend: Transaction ID
    Frontend-->>User: Success Message

    Note over SmartContract,Chainhook: Blockchain Event
    SmartContract->>Chainhook: StreamCreated Event
    Chainhook->>Chainhook: Process Event
    Chainhook->>Database: Store Stream Record
    Chainhook->>WebSocket: Broadcast Event
    WebSocket->>Frontend: Update UI
    Frontend-->>User: Real-time Update
```

### 2. Withdrawal Flow

```mermaid
sequenceDiagram
    actor Recipient
    participant Frontend
    participant SmartContract as Smart Contract
    participant Chainhook
    participant WebSocket
    participant Database

    Recipient->>Frontend: Click Withdraw
    Frontend->>SmartContract: get-withdrawable-amount(stream-id)
    SmartContract-->>Frontend: Vested Amount

    Frontend->>Recipient: Show Amount + Confirm
    Recipient->>Frontend: Confirm Withdrawal

    Frontend->>SmartContract: withdraw-from-stream(stream-id)
    SmartContract->>SmartContract: Calculate Vested Amount
    SmartContract->>SmartContract: Update Withdrawn Amount
    SmartContract->>SmartContract: Transfer sBTC to Recipient
    SmartContract-->>Frontend: Success

    SmartContract->>Chainhook: WithdrawalMade Event
    Chainhook->>Database: Update Stream Record
    Chainhook->>WebSocket: Broadcast Update
    WebSocket->>Frontend: Push Notification
    Frontend-->>Recipient: Balance Updated
```

### 3. Chainhook Event Processing Flow

```mermaid
flowchart TD
    A[Blockchain Event Occurs] --> B{Event Type?}

    B -->|Stream Created| C[Parse Stream Data]
    B -->|Withdrawal| D[Parse Withdrawal Data]
    B -->|Cancellation| E[Parse Cancellation Data]
    B -->|Marketplace| F[Parse Listing Data]
    B -->|Treasury| G[Parse Treasury Data]

    C --> H[Validate Event]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I{Valid?}
    I -->|No| J[Log Error]
    I -->|Yes| K[Update Database]

    K --> L[Trigger WebSocket Broadcast]
    K --> M[Send Email Notification]
    K --> N[Update Analytics]

    L --> O[Notify Connected Clients]
    M --> P[Queue Email Job]
    N --> Q[Increment Counters]

    J --> R[Alert Admin]

    style A fill:#e1f5ff
    style H fill:#ffe1e1
    style K fill:#e1ffe1
    style L fill:#fff5e1
```

### 4. Real-Time Update Flow

```mermaid
sequenceDiagram
    participant Blockchain
    participant Chainhook
    participant API as API Webhook
    participant WebSocket as WebSocket Server
    participant DB as MongoDB
    participant Frontend

    Blockchain->>Chainhook: New Block with Transaction
    Chainhook->>Chainhook: Match Predicate
    Chainhook->>API: POST /api/webhooks/chainhook/streams

    API->>API: Verify Signature
    API->>DB: Update Stream Record
    DB-->>API: Success

    API->>WebSocket: POST /broadcast
    Note over API,WebSocket: HTTP Request with Event Data

    WebSocket->>WebSocket: Determine Target Room
    WebSocket->>Frontend: Emit Event to Room

    Frontend->>Frontend: Update UI State
    Frontend->>Frontend: Show Notification

    API-->>Chainhook: 200 OK
```

---

## Database Schema

### MongoDB Collections

#### 1. **users**
```javascript
{
  _id: ObjectId,
  walletAddress: String,          // Stacks address (primary key)
  email: String,                   // Optional email
  username: String,                // Optional username
  createdAt: Date,
  updatedAt: Date,
  preferences: {
    notifications: Boolean,
    theme: String
  }
}
```

#### 2. **streams**
```javascript
{
  _id: ObjectId,
  streamId: Number,                // On-chain stream ID
  sender: String,                  // Sender address
  recipient: String,               // Recipient address
  amount: Number,                  // Total sBTC amount (in satoshis)
  startBlock: Number,              // Start block height
  endBlock: Number,                // End block height
  withdrawnAmount: Number,         // Amount withdrawn so far
  status: String,                  // 'active', 'completed', 'cancelled'
  cancelledAtBlock: Number,        // Block when cancelled (if applicable)
  createdAt: Date,
  updatedAt: Date,

  // Denormalized for queries
  duration: Number,                // endBlock - startBlock
  withdrawableAmount: Number,      // Calculated vested amount
  percentComplete: Number          // Progress percentage
}
```

#### 3. **listings**
```javascript
{
  _id: ObjectId,
  listingId: Number,               // On-chain listing ID
  streamId: Number,                // Associated stream
  seller: String,                  // Seller address
  price: Number,                   // Sale price in sBTC
  status: String,                  // 'active', 'sold', 'cancelled'
  createdAt: Date,
  updatedAt: Date,
  soldTo: String,                  // Buyer address (if sold)
  soldAt: Date                     // Sale timestamp (if sold)
}
```

#### 4. **treasury_proposals**
```javascript
{
  _id: ObjectId,
  proposalId: Number,              // On-chain proposal ID
  recipient: String,               // Withdrawal recipient
  amount: Number,                  // Proposed withdrawal amount
  description: String,             // Proposal description
  proposer: String,                // Proposer address
  approvals: [String],             // Array of approver addresses
  status: String,                  // 'pending', 'approved', 'executed', 'cancelled'
  executedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Relationships

```mermaid
erDiagram
    USERS ||--o{ STREAMS : creates
    USERS ||--o{ STREAMS : receives
    USERS ||--o{ LISTINGS : sells
    USERS ||--o{ LISTINGS : buys
    USERS ||--o{ TREASURY_PROPOSALS : proposes
    USERS ||--o{ TREASURY_PROPOSALS : approves

    STREAMS ||--o| LISTINGS : "listed as"
    STREAMS ||--o{ NFTS : "mints"

    USERS {
        string walletAddress PK
        string email
        string username
        date createdAt
    }

    STREAMS {
        number streamId PK
        string sender FK
        string recipient FK
        number amount
        number startBlock
        number endBlock
        string status
    }

    LISTINGS {
        number listingId PK
        number streamId FK
        string seller FK
        number price
        string status
    }

    TREASURY_PROPOSALS {
        number proposalId PK
        string proposer FK
        string recipient
        number amount
        string status
    }
```

---

## Integration Points

### 1. Stacks Blockchain Integration

```mermaid
graph LR
    subgraph "BitPay Frontend"
        A[User Action]
        B[Contract Call Builder]
        C[Stacks Connect]
    end

    subgraph "Stacks Network"
        D[Hiro API]
        E[Stacks Node]
        F[Smart Contract]
    end

    subgraph "Wallet"
        G[Hiro Wallet]
        H[Turnkey Wallet]
    end

    A --> B
    B --> C
    C --> G
    C --> H
    G --> E
    H --> E
    E --> F

    B --> D
    D --> E

    F --> E
    E --> D
    D --> A

    style A fill:#e1f5ff
    style F fill:#ffe1e1
    style G fill:#e1ffe1
```

### 2. Turnkey Wallet Integration

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Turnkey as Turnkey API
    participant Blockchain

    User->>Frontend: Sign Up / Login
    Frontend->>Turnkey: Create Sub-Organization
    Turnkey->>Turnkey: Generate Wallet
    Turnkey-->>Frontend: Wallet Address

    Frontend->>Frontend: Store Wallet Info
    Frontend-->>User: Account Created

    Note over User,Blockchain: Transaction Flow

    User->>Frontend: Create Stream
    Frontend->>Turnkey: Request Signature
    Turnkey->>User: Passkey Challenge
    User->>Turnkey: Authenticate with Passkey
    Turnkey->>Turnkey: Sign Transaction
    Turnkey-->>Frontend: Signed Transaction
    Frontend->>Blockchain: Broadcast Transaction
    Blockchain-->>Frontend: Transaction ID
```

### 3. Chainhook Integration

```mermaid
graph TB
    subgraph "Hiro Platform"
        A[Chainhook Service]
        B[Predicate Config]
        C[Event Stream]
    end

    subgraph "BitPay Backend"
        D[Webhook Endpoints]
        E[Event Handlers]
        F[Database Updates]
    end

    subgraph "Real-Time Layer"
        G[WebSocket Server]
        H[Connected Clients]
    end

    B --> A
    A --> C
    C --> D
    D --> E
    E --> F
    E --> G
    G --> H

    style A fill:#4ecdc4
    style D fill:#ff6b6b
    style G fill:#45b7d1
```

---

## Security Architecture

### Authentication & Authorization Flow

```mermaid
flowchart TD
    A[User Request] --> B{Authenticated?}

    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Session Valid?}

    D -->|No| C
    D -->|Yes| E{Authorized?}

    E -->|No| F[403 Forbidden]
    E -->|Yes| G{Rate Limit OK?}

    G -->|No| H[429 Too Many Requests]
    G -->|Yes| I[Process Request]

    I --> J{Smart Contract Call?}

    J -->|Yes| K[Validate Parameters]
    J -->|No| M[Execute API Logic]

    K --> L{Valid?}
    L -->|No| N[400 Bad Request]
    L -->|Yes| O[Execute Contract Call]

    O --> P[Return Response]
    M --> P

    style A fill:#e1f5ff
    style E fill:#ffe1e1
    style I fill:#e1ffe1
    style O fill:#fff5e1
```

### Security Layers

1. **Network Security**
   - HTTPS/TLS encryption for all communications
   - CORS policies for API endpoints
   - Rate limiting per IP and user

2. **Application Security**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Input validation and sanitization
   - CSRF token protection

3. **Smart Contract Security**
   - Access control modifiers
   - Safe math operations
   - Reentrancy guards
   - Emergency pause functionality

4. **Data Security**
   - Encrypted storage for sensitive data
   - Environment variable isolation
   - Secrets management (Vercel/Render)
   - Database access controls

---

## Scalability Considerations

### Horizontal Scaling Architecture

```mermaid
graph TB
    subgraph "Load Balancer"
        A[Vercel Edge Network]
    end

    subgraph "Frontend Instances"
        B[Next.js Instance 1]
        C[Next.js Instance 2]
        D[Next.js Instance N]
    end

    subgraph "WebSocket Layer"
        E[Socket.io Instance 1]
        F[Socket.io Instance 2]
        G[Redis Adapter]
    end

    subgraph "Database Layer"
        H[MongoDB Primary]
        I[MongoDB Secondary 1]
        J[MongoDB Secondary 2]
        K[Read Replicas]
    end

    subgraph "Caching Layer"
        L[Redis Cache]
        M[CDN]
    end

    A --> B
    A --> C
    A --> D

    B --> E
    C --> F
    D --> E

    E --> G
    F --> G

    B --> H
    C --> H
    D --> H

    H --> I
    H --> J

    K --> I
    K --> J

    B --> L
    B --> M

    style A fill:#4ecdc4
    style H fill:#ff6b6b
    style L fill:#45b7d1
```

### Performance Optimizations

1. **Frontend Optimizations**
   - Static page generation where possible
   - Incremental static regeneration (ISR)
   - Image optimization with Next.js Image
   - Code splitting and lazy loading
   - React Query for intelligent caching

2. **API Optimizations**
   - Database indexing on frequent queries
   - Connection pooling
   - Response caching with Redis
   - Pagination for large datasets
   - Batch operations where applicable

3. **Blockchain Optimizations**
   - Off-chain calculation of vested amounts
   - Batch read operations
   - Local caching of contract data
   - Optimistic UI updates

4. **Real-Time Optimizations**
   - Room-based event broadcasting
   - Connection state management
   - Automatic reconnection logic
   - Message queuing for offline clients

---

## System Monitoring

### Monitoring Stack

```mermaid
graph LR
    subgraph "Application"
        A[Frontend]
        B[API Routes]
        C[WebSocket Server]
    end

    subgraph "Monitoring Services"
        D[Vercel Analytics]
        E[Error Tracking]
        F[Performance Monitoring]
        G[Log Aggregation]
    end

    subgraph "Alerts"
        H[Email Alerts]
        I[Slack Notifications]
        J[PagerDuty]
    end

    A --> D
    A --> E
    B --> E
    B --> F
    C --> F

    B --> G
    C --> G

    E --> H
    E --> I
    F --> J
    G --> H

    style D fill:#4ecdc4
    style E fill:#ff6b6b
    style H fill:#45b7d1
```

### Key Metrics

1. **Application Metrics**
   - Request latency (p50, p95, p99)
   - Error rates by endpoint
   - Active users and sessions
   - WebSocket connection count

2. **Business Metrics**
   - Streams created per day
   - Total value locked (TVL)
   - Marketplace volume
   - Active users (DAU/MAU)

3. **Infrastructure Metrics**
   - Database query performance
   - API response times
   - WebSocket message latency
   - Server resource utilization

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[GitHub Repository]
        B[Vercel Deployment]
        C[Render Deployment]
        D[MongoDB Atlas]
    end

    subgraph "CI/CD Pipeline"
        E[GitHub Actions]
        F[Build Process]
        G[Tests]
        H[Deploy]
    end

    subgraph "Monitoring"
        I[Health Checks]
        J[Error Tracking]
        K[Performance Monitoring]
    end

    A --> E
    E --> F
    F --> G
    G --> H
    H --> B
    H --> C

    B --> I
    C --> I
    D --> I

    B --> J
    C --> J

    B --> K
    C --> K

    style B fill:#4ecdc4
    style C fill:#ff6b6b
    style D fill:#45b7d1
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## Next Steps

- [Smart Contracts Documentation](CONTRACTS.md)
- [Frontend Architecture Guide](FRONTEND.md)
- [Webhook Integration Guide](WEBHOOKS.md)
- [WebSocket Communication Guide](WEBSOCKET.md)
- [Deployment Guide](DEPLOYMENT.md)
