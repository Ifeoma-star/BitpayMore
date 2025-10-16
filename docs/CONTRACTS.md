# BitPay Smart Contracts Documentation

Complete technical documentation for all 7 BitPay smart contracts with detailed flow diagrams and function references.

---

## Table of Contents

1. [Contract Overview](#contract-overview)
2. [Contract Architecture](#contract-architecture)
3. [Contract 1: bitpay-core](#contract-1-bitpay-core)
4. [Contract 2: bitpay-treasury](#contract-2-bitpay-treasury)
5. [Contract 3: bitpay-marketplace](#contract-3-bitpay-marketplace)
6. [Contract 4: bitpay-nft](#contract-4-bitpay-nft)
7. [Contract 5: bitpay-obligation-nft](#contract-5-bitpay-obligation-nft)
8. [Contract 6: bitpay-sbtc-helper](#contract-6-bitpay-sbtc-helper)
9. [Contract 7: bitpay-access-control](#contract-7-bitpay-access-control)
10. [Contract Interactions](#contract-interactions)
11. [Error Codes](#error-codes)
12. [Testing Strategy](#testing-strategy)

---

## Contract Overview

BitPay consists of **7 interconnected Clarity smart contracts** that work together to provide streaming payment functionality on Bitcoin via Stacks.

```mermaid
graph TB
    subgraph "Core Contracts"
        A[bitpay-core]
        B[bitpay-treasury]
        C[bitpay-marketplace]
    end

    subgraph "NFT Contracts"
        D[bitpay-nft]
        E[bitpay-obligation-nft]
    end

    subgraph "Helper Contracts"
        F[bitpay-sbtc-helper]
        G[bitpay-access-control]
    end

    subgraph "External"
        H[sBTC Token]
    end

    A --> F
    A --> D
    A --> E
    A --> G
    B --> G
    C --> E
    C --> G
    F --> H

    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#f7b731
    style E fill:#5f27cd
    style F fill:#00d2d3
    style G fill:#fd79a8
```

### Contract Responsibilities

| Contract | Primary Function | Key Data |
|----------|-----------------|----------|
| **bitpay-core** | Stream management, vesting calculations | Streams map, stream counter |
| **bitpay-treasury** | Multi-sig governance, fee management | Proposals, admins, treasury balance |
| **bitpay-marketplace** | NFT trading, price discovery | Listings, listing counter |
| **bitpay-nft** | Non-transferable claim receipts | Claim NFTs, metadata |
| **bitpay-obligation-nft** | Transferable stream rights | Stream NFTs, ownership |
| **bitpay-sbtc-helper** | sBTC integration utilities | Token transfers, balances |
| **bitpay-access-control** | Centralized role management | Admin roles, permissions |

---

## Contract Architecture

### Dependency Graph

```mermaid
graph LR
    A[User Transaction] --> B[bitpay-core]
    B --> C[bitpay-sbtc-helper]
    C --> D[sBTC Token Contract]

    B --> E[bitpay-nft]
    B --> F[bitpay-obligation-nft]
    B --> G[bitpay-access-control]

    H[Treasury Admin] --> I[bitpay-treasury]
    I --> G

    J[Marketplace User] --> K[bitpay-marketplace]
    K --> F
    K --> G

    B --> L[bitpay-treasury]
    L --> C

    style B fill:#ff6b6b
    style I fill:#4ecdc4
    style K fill:#45b7d1
```

---

## Contract 1: bitpay-core

The **heart of BitPay**. Manages all streaming payment logic including creation, withdrawals, and cancellations.

### Data Structures

```clarity
;; Stream data map
(define-map streams
  { stream-id: uint }
  {
    sender: principal,
    recipient: principal,
    amount: uint,
    start-block: uint,
    end-block: uint,
    withdrawn: uint,
    cancelled: bool,
    cancelled-at-block: (optional uint)
  }
)

;; Stream counter
(define-data-var stream-id-nonce uint u0)

;; Fee configuration
(define-data-var fee-basis-points uint u10) ;; 0.1% default
```

### Core Functions

#### 1. create-stream

Creates a new payment stream by locking sBTC in the contract.

```mermaid
sequenceDiagram
    actor Sender
    participant Core as bitpay-core
    participant Helper as sbtc-helper
    participant NFT as obligation-nft
    participant Treasury

    Sender->>Core: create-stream(recipient, amount, start, end)

    Core->>Core: Validate parameters
    Note over Core: Check amount > 0<br/>Check end > start<br/>Check recipient != sender

    Core->>Helper: transfer-sbtc(sender, contract, amount)
    Helper-->>Core: Success

    Core->>Core: Calculate & deduct fee
    Core->>Treasury: transfer-fee(fee-amount)

    Core->>Core: Increment stream-id-nonce
    Core->>Core: Store stream data

    Core->>NFT: mint(recipient, stream-id)
    NFT-->>Core: NFT minted

    Core-->>Sender: stream-id
```

**Parameters:**
- `recipient` (principal) - Stream recipient address
- `amount` (uint) - Total sBTC amount in satoshis
- `start-block` (uint) - Starting block height
- `end-block` (uint) - Ending block height

**Returns:** `(response uint uint)` - Stream ID or error code

**Errors:**
- `err-invalid-amount` (u100)
- `err-invalid-duration` (u101)
- `err-transfer-failed` (u102)
- `err-same-sender-recipient` (u103)

#### 2. withdraw-from-stream

Allows recipient to withdraw vested amount from a stream.

```mermaid
flowchart TD
    A[withdraw-from-stream] --> B{Stream exists?}
    B -->|No| C[err-stream-not-found]
    B -->|Yes| D{Caller is recipient?}

    D -->|No| E[err-not-recipient]
    D -->|Yes| F[Get current block]

    F --> G[Calculate vested amount]
    G --> H{Amount > 0?}

    H -->|No| I[err-nothing-to-withdraw]
    H -->|Yes| J[Update withdrawn amount]

    J --> K[Transfer sBTC to recipient]
    K --> L{Transfer success?}

    L -->|No| M[err-transfer-failed]
    L -->|Yes| N[Return withdrawn amount]

    style A fill:#e1f5ff
    style G fill:#ffe1e1
    style K fill:#e1ffe1
    style N fill:#d4f4dd
```

**Vesting Calculation:**

```clarity
(define-read-only (get-withdrawable-amount (stream-id uint))
  (let ((stream (unwrap! (map-get? streams {stream-id: stream-id}) err-stream-not-found))
        (current-block block-height)
        (elapsed (if (get cancelled stream)
                    (default-to u0 (get cancelled-at-block stream))
                    (if (> current-block (get end-block stream))
                        (get end-block stream)
                        current-block))))
    (let ((total-vested (/ (* (get amount stream)
                              (- elapsed (get start-block stream)))
                           (- (get end-block stream) (get start-block stream)))))
      (ok (- total-vested (get withdrawn stream))))))
```

**Formula:**
```
vested_amount = (total_amount × elapsed_blocks) / total_duration_blocks
withdrawable = vested_amount - already_withdrawn
```

#### 3. cancel-stream

Cancels an active stream, returning unvested funds to sender.

```mermaid
sequenceDiagram
    actor Sender
    participant Core as bitpay-core
    participant Helper as sbtc-helper
    participant NFT as bitpay-nft

    Sender->>Core: cancel-stream(stream-id)

    Core->>Core: Verify sender
    Note over Core: Check caller == stream.sender<br/>Check not already cancelled

    Core->>Core: Calculate vested & unvested
    Note over Core: vested = withdrawable by recipient<br/>unvested = returnable to sender

    Core->>Core: Mark stream as cancelled
    Core->>Core: Set cancelled-at-block

    alt Unvested > 0
        Core->>Helper: transfer(contract, sender, unvested)
        Helper-->>Core: Success
    end

    Core->>NFT: mint-cancellation-receipt(sender, stream-id)
    NFT-->>Core: NFT minted

    Core-->>Sender: {vested, unvested}
```

**Cancellation Logic:**
```clarity
;; Calculate amounts at cancellation
(let ((elapsed-blocks (- block-height (get start-block stream)))
      (total-duration (- (get end-block stream) (get start-block stream))))
  (let ((vested (/ (* (get amount stream) elapsed-blocks) total-duration))
        (already-withdrawn (get withdrawn stream)))
    (let ((remaining-vested (- vested already-withdrawn))
          (unvested (- (get amount stream) vested)))
      ;; Return unvested to sender
      ;; Keep vested for recipient to withdraw
    )))
```

### Read-Only Functions

```clarity
;; Get stream details
(define-read-only (get-stream (stream-id uint))
  (map-get? streams {stream-id: stream-id}))

;; Get withdrawable amount
(define-read-only (get-withdrawable-amount (stream-id uint))
  ;; Implementation shown above
)

;; Get stream count
(define-read-only (get-stream-count)
  (var-get stream-id-nonce))

;; Check if stream is active
(define-read-only (is-stream-active (stream-id uint))
  (let ((stream (unwrap! (get-stream stream-id) false)))
    (and (not (get cancelled stream))
         (>= block-height (get start-block stream))
         (< block-height (get end-block stream)))))
```

---

## Contract 2: bitpay-treasury

Multi-signature treasury for managing protocol fees collected from streams.

### Data Structures

```clarity
;; Treasury admins
(define-map admins principal bool)

;; Approval threshold
(define-data-var approval-threshold uint u2)

;; Withdrawal proposals
(define-map proposals
  { proposal-id: uint }
  {
    recipient: principal,
    amount: uint,
    description: (string-utf8 256),
    proposer: principal,
    approvals: (list 10 principal),
    executed: bool,
    created-at: uint
  }
)

(define-data-var proposal-nonce uint u0)
```

### Treasury Flow

```mermaid
flowchart TD
    A[Admin Creates Proposal] --> B[Store Proposal Data]
    B --> C[Proposal ID Generated]

    C --> D[Other Admins Review]
    D --> E{Approve?}

    E -->|Yes| F[Add to Approvals List]
    E -->|No| G[Wait for More Approvals]

    F --> H{Threshold Met?}
    H -->|No| G
    H -->|Yes| I[Execute Proposal]

    I --> J[Transfer Funds]
    J --> K[Mark as Executed]
    K --> L[Emit Event]

    G --> M{Timeout?}
    M -->|Yes| N[Proposal Expires]
    M -->|No| D

    style A fill:#e1f5ff
    style H fill:#ffe1e1
    style J fill:#e1ffe1
    style L fill:#d4f4dd
```

### Key Functions

#### create-withdrawal-proposal

```clarity
(define-public (create-withdrawal-proposal
                (recipient principal)
                (amount uint)
                (description (string-utf8 256)))
  (let ((proposer tx-sender)
        (proposal-id (+ (var-get proposal-nonce) u1)))

    ;; Verify caller is admin
    (asserts! (is-admin proposer) err-not-admin)

    ;; Verify treasury has sufficient balance
    (asserts! (>= (get-treasury-balance) amount) err-insufficient-balance)

    ;; Create proposal
    (map-set proposals
      {proposal-id: proposal-id}
      {
        recipient: recipient,
        amount: amount,
        description: description,
        proposer: proposer,
        approvals: (list proposer),
        executed: false,
        created-at: block-height
      })

    (var-set proposal-nonce proposal-id)
    (ok proposal-id)))
```

#### approve-proposal

```clarity
(define-public (approve-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals {proposal-id: proposal-id})
                           err-proposal-not-found))
        (approver tx-sender))

    ;; Verify caller is admin
    (asserts! (is-admin approver) err-not-admin)

    ;; Verify not already approved by this admin
    (asserts! (is-none (index-of (get approvals proposal) approver))
              err-already-approved)

    ;; Verify not already executed
    (asserts! (not (get executed proposal)) err-already-executed)

    ;; Add approval
    (map-set proposals
      {proposal-id: proposal-id}
      (merge proposal {
        approvals: (unwrap! (as-max-len?
                             (append (get approvals proposal) approver)
                             u10)
                            err-max-approvals)
      }))

    (ok true)))
```

#### execute-proposal

```clarity
(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals {proposal-id: proposal-id})
                           err-proposal-not-found)))

    ;; Verify threshold met
    (asserts! (>= (len (get approvals proposal)) (var-get approval-threshold))
              err-threshold-not-met)

    ;; Verify not already executed
    (asserts! (not (get executed proposal)) err-already-executed)

    ;; Execute withdrawal
    (try! (contract-call? .bitpay-sbtc-helper transfer-sbtc
           (as-contract tx-sender)
           (get recipient proposal)
           (get amount proposal)))

    ;; Mark as executed
    (map-set proposals
      {proposal-id: proposal-id}
      (merge proposal {executed: true}))

    (ok true)))
```

---

## Contract 3: bitpay-marketplace

NFT marketplace for trading stream obligation NFTs (future income streams).

### Marketplace Flow

```mermaid
sequenceDiagram
    actor Seller
    actor Buyer
    participant Market as bitpay-marketplace
    participant NFT as obligation-nft
    participant Helper as sbtc-helper

    Note over Seller,Market: Listing Phase
    Seller->>Market: list-stream(stream-id, price)
    Market->>NFT: verify-owner(seller, stream-id)
    NFT-->>Market: Confirmed
    Market->>Market: Create listing
    Market-->>Seller: listing-id

    Note over Buyer,Market: Purchase Phase
    Buyer->>Market: purchase-stream(listing-id)
    Market->>Market: Verify listing active
    Market->>Helper: transfer(buyer, seller, price)
    Helper-->>Market: Payment received

    Market->>NFT: transfer(seller, buyer, stream-id)
    NFT-->>Market: Transfer complete

    Market->>Market: Mark listing as sold
    Market-->>Buyer: stream-id
    Market-->>Seller: Payment received
```

### Data Structures

```clarity
(define-map listings
  { listing-id: uint }
  {
    stream-id: uint,
    seller: principal,
    price: uint,
    status: (string-ascii 10), ;; "active", "sold", "cancelled"
    created-at: uint,
    sold-to: (optional principal),
    sold-at: (optional uint)
  }
)

(define-data-var listing-nonce uint u0)
(define-data-var marketplace-fee-bps uint u25) ;; 0.25% fee
```

### Key Functions

#### list-stream

```clarity
(define-public (list-stream (stream-id uint) (price uint))
  (let ((seller tx-sender)
        (listing-id (+ (var-get listing-nonce) u1)))

    ;; Verify seller owns the stream NFT
    (asserts! (is-eq (try! (contract-call? .bitpay-obligation-nft get-owner stream-id))
                     seller)
              err-not-owner)

    ;; Verify price > 0
    (asserts! (> price u0) err-invalid-price)

    ;; Create listing
    (map-set listings
      {listing-id: listing-id}
      {
        stream-id: stream-id,
        seller: seller,
        price: price,
        status: "active",
        created-at: block-height,
        sold-to: none,
        sold-at: none
      })

    (var-set listing-nonce listing-id)
    (ok listing-id)))
```

#### purchase-stream

```clarity
(define-public (purchase-stream (listing-id uint))
  (let ((listing (unwrap! (map-get? listings {listing-id: listing-id})
                          err-listing-not-found))
        (buyer tx-sender))

    ;; Verify listing is active
    (asserts! (is-eq (get status listing) "active") err-listing-not-active)

    ;; Verify buyer != seller
    (asserts! (not (is-eq buyer (get seller listing))) err-cannot-buy-own)

    ;; Calculate marketplace fee
    (let ((marketplace-fee (/ (* (get price listing) (var-get marketplace-fee-bps)) u10000))
          (seller-amount (- (get price listing) marketplace-fee)))

      ;; Transfer payment from buyer to seller
      (try! (contract-call? .bitpay-sbtc-helper transfer-sbtc
             buyer
             (get seller listing)
             seller-amount))

      ;; Transfer fee to treasury
      (try! (contract-call? .bitpay-sbtc-helper transfer-sbtc
             buyer
             .bitpay-treasury
             marketplace-fee))

      ;; Transfer NFT ownership
      (try! (contract-call? .bitpay-obligation-nft transfer
             (get stream-id listing)
             (get seller listing)
             buyer))

      ;; Update listing status
      (map-set listings
        {listing-id: listing-id}
        (merge listing {
          status: "sold",
          sold-to: (some buyer),
          sold-at: (some block-height)
        }))

      (ok (get stream-id listing)))))
```

---

## Contract 4: bitpay-nft

Non-transferable Claim NFTs minted as receipts when streams complete or are cancelled.

### NFT Structure

```clarity
;; SIP-009 Trait Implementation
(impl-trait .sip-009-trait.nft-trait)

(define-non-fungible-token claim-nft uint)

(define-map token-metadata
  uint
  {
    stream-id: uint,
    recipient: principal,
    event-type: (string-ascii 20), ;; "completed" or "cancelled"
    amount-claimed: uint,
    minted-at: uint
  }
)
```

### Minting Flow

```mermaid
flowchart LR
    A[Stream Event] --> B{Event Type?}
    B -->|Withdrawal| C[Check if final]
    B -->|Cancellation| D[Mint Cancellation NFT]

    C --> E{Stream Completed?}
    E -->|Yes| F[Mint Completion NFT]
    E -->|No| G[No NFT]

    F --> H[Store Metadata]
    D --> H
    H --> I[Emit Event]

    style A fill:#e1f5ff
    style F fill:#d4f4dd
    style D fill:#ffe1e1
```

**Key Characteristic:** These NFTs are **non-transferable** - they serve as permanent receipts.

---

## Contract 5: bitpay-obligation-nft

Transferable Stream Obligation NFTs representing the recipient's right to withdraw from a stream.

### NFT Structure

```clarity
(impl-trait .sip-009-trait.nft-trait)

(define-non-fungible-token stream-obligation uint)

(define-map token-owners uint principal)
(define-map token-uri uint (string-ascii 256))
```

### Transfer Mechanism

```mermaid
sequenceDiagram
    actor Seller
    actor Buyer
    participant NFT as obligation-nft
    participant Core as bitpay-core

    Seller->>NFT: transfer(token-id, seller, buyer)
    NFT->>NFT: Verify owner
    NFT->>Core: Verify stream exists & active
    Core-->>NFT: Confirmed

    NFT->>NFT: Update owner mapping
    NFT->>NFT: Emit transfer event
    NFT-->>Buyer: Ownership transferred

    Note over Buyer,Core: Buyer can now withdraw
    Buyer->>Core: withdraw-from-stream(stream-id)
    Core->>NFT: Verify buyer owns NFT
    NFT-->>Core: Confirmed
    Core->>Buyer: Transfer vested amount
```

**Key Characteristic:** These NFTs **can be transferred**, enabling a marketplace for future income streams.

---

## Contract 6: bitpay-sbtc-helper

Helper contract providing sBTC token interaction utilities.

### Functions

```clarity
;; Transfer sBTC between addresses
(define-public (transfer-sbtc (sender principal) (recipient principal) (amount uint))
  (contract-call? .sbtc-token transfer amount sender recipient none))

;; Get sBTC balance
(define-read-only (get-balance (account principal))
  (contract-call? .sbtc-token get-balance account))

;; Check if contract has approval
(define-read-only (has-approval (owner principal) (spender principal))
  (contract-call? .sbtc-token get-allowance owner spender))
```

---

## Contract 7: bitpay-access-control

Centralized role-based access control for admin operations.

### Role Structure

```clarity
(define-map admins principal bool)
(define-map operators principal bool)

(define-data-var contract-owner principal tx-sender)
```

### Permission Hierarchy

```mermaid
graph TD
    A[Contract Owner] -->|Full Control| B[Add/Remove Admins]
    A -->|Full Control| C[Add/Remove Operators]
    A -->|Full Control| D[Emergency Pause]

    E[Admin] -->|Limited| F[Treasury Proposals]
    E -->|Limited| G[Fee Configuration]

    H[Operator] -->|Minimal| I[Read-Only Access]

    style A fill:#ff6b6b
    style E fill:#4ecdc4
    style H fill:#45b7d1
```

---

## Contract Interactions

### Complete Stream Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant Core as bitpay-core
    participant Access as access-control
    participant Helper as sbtc-helper
    participant sBTC as sBTC Token
    participant Treasury
    participant ObligationNFT as obligation-nft

    User->>Core: create-stream(recipient, 1000, start, end)
    Core->>Access: verify-not-paused()
    Access-->>Core: OK

    Core->>Core: Validate parameters

    Core->>Helper: transfer-sbtc(user, core, 1000)
    Helper->>sBTC: transfer(1000, user, core, none)
    sBTC-->>Helper: Success
    Helper-->>Core: Success

    Core->>Core: Calculate fee (1 sBTC = 0.1%)
    Core->>Helper: transfer-sbtc(core, treasury, 1)
    Helper->>sBTC: transfer(1, core, treasury, none)
    sBTC-->>Helper: Success

    Core->>Core: Store stream data
    Core->>Core: stream-id = increment(nonce)

    Core->>ObligationNFT: mint(recipient, stream-id)
    ObligationNFT->>ObligationNFT: Store token owner
    ObligationNFT-->>Core: NFT minted

    Core-->>User: stream-id
```

---

## Error Codes

### bitpay-core Errors

| Code | Constant | Description |
|------|----------|-------------|
| u100 | err-invalid-amount | Amount must be greater than 0 |
| u101 | err-invalid-duration | End block must be after start block |
| u102 | err-transfer-failed | sBTC transfer failed |
| u103 | err-same-sender-recipient | Sender and recipient cannot be the same |
| u104 | err-stream-not-found | Stream ID does not exist |
| u105 | err-not-recipient | Caller is not the stream recipient |
| u106 | err-not-sender | Caller is not the stream sender |
| u107 | err-already-cancelled | Stream already cancelled |
| u108 | err-nothing-to-withdraw | No vested amount available |
| u109 | err-not-started | Stream has not started yet |

### bitpay-treasury Errors

| Code | Constant | Description |
|------|----------|-------------|
| u200 | err-not-admin | Caller is not an admin |
| u201 | err-insufficient-balance | Treasury balance too low |
| u202 | err-proposal-not-found | Proposal ID does not exist |
| u203 | err-already-approved | Admin already approved this proposal |
| u204 | err-already-executed | Proposal already executed |
| u205 | err-threshold-not-met | Not enough approvals |
| u206 | err-max-approvals | Maximum approvals reached |

### bitpay-marketplace Errors

| Code | Constant | Description |
|------|----------|-------------|
| u300 | err-not-owner | Caller does not own the NFT |
| u301 | err-invalid-price | Price must be greater than 0 |
| u302 | err-listing-not-found | Listing ID does not exist |
| u303 | err-listing-not-active | Listing is not active |
| u304 | err-cannot-buy-own | Cannot purchase your own listing |
| u305 | err-insufficient-funds | Buyer has insufficient sBTC |

---

## Testing Strategy

### Unit Tests

Each contract has comprehensive unit tests covering:

```clarity
;; Test: Stream creation
(define-test create-stream-success
  ;; Verify stream created with correct parameters
  ;; Verify sBTC transferred
  ;; Verify NFT minted
  ;; Verify fee collected
)

(define-test create-stream-invalid-amount
  ;; Verify error when amount = 0
)

;; Test: Withdrawal
(define-test withdraw-partial
  ;; Advance to 50% duration
  ;; Verify 50% withdrawable
)

(define-test withdraw-full
  ;; Advance past end block
  ;; Verify 100% withdrawable
)

;; Test: Cancellation
(define-test cancel-stream-midway
  ;; Cancel at 30% duration
  ;; Verify 30% to recipient
  ;; Verify 70% to sender
)
```

### Integration Tests

```clarity
;; Test: Complete stream lifecycle
(define-test full-stream-lifecycle
  ;; 1. Create stream
  ;; 2. Partial withdrawal
  ;; 3. List on marketplace
  ;; 4. Purchase by new user
  ;; 5. Final withdrawal by new owner
  ;; 6. Verify all state transitions
)

;; Test: Treasury governance
(define-test treasury-proposal-flow
  ;; 1. Admin creates proposal
  ;; 2. Multiple admins approve
  ;; 3. Execute withdrawal
  ;; 4. Verify balance updated
)
```

### Test Coverage Goals

- **Line Coverage:** >90%
- **Branch Coverage:** >85%
- **Function Coverage:** 100%

---

## Next Steps

- [Frontend Architecture](FRONTEND.md)
- [Webhook Integration](WEBHOOKS.md)
- [WebSocket Communication](WEBSOCKET.md)
- [Deployment Guide](DEPLOYMENT.md)
- [System Architecture](ARCHITECTURE.md)
