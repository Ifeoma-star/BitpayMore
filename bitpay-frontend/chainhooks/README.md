# BitPay Chainhook Predicates

Individual chainhook predicate configurations for deployment to Hiro Platform.

## Predicates

### 1. bitpay-core-streams.json (PRIORITY 1) ✅
**Contract**: `bitpay-core-v3`
**Events**: stream-created, stream-withdrawal, stream-cancelled, stream-sender-updated
**Pattern**: `contains: "stream-"`
**Webhook**: `/api/webhooks/chainhook/streams`
**Status**: Ready for deployment

### 2. bitpay-recipient-nft.json ✅
**Contract**: `bitpay-nft-v3`
**Asset**: `bitpay-recipient-nft` (soul-bound NFTs)
**Events**: mint, burn (native NFT events)
**Webhook**: `/api/webhooks/chainhook/nft`
**Status**: Ready for deployment

### 3. bitpay-obligation-nft.json ✅
**Contract**: `bitpay-obligation-nft-v3`
**Events**: obligation-minted, obligation-transferred
**Pattern**: `contains: "obligation-"`
**Webhook**: `/api/webhooks/chainhook/nft`
**Status**: Ready for deployment

### 4. bitpay-marketplace.json ✅
**Contract**: `bitpay-marketplace-v3`
**Events**: direct-purchase-completed, purchase-initiated, gateway-purchase-completed, purchase-expired, backend-authorized, backend-deauthorized
**Pattern**: `contains: "purchase"`
**Webhook**: `/api/webhooks/chainhook/marketplace`
**Status**: Ready for deployment

### 5. bitpay-treasury.json ✅
**Contract**: `bitpay-treasury-v3`
**Events**: cancellation-fee-collected, marketplace-fee-collected, withdrawal-proposed, withdrawal-approved, withdrawal-executed
**Pattern**: `contains: "fee-collected"`
**Webhook**: `/api/webhooks/chainhook/treasury`
**Status**: Ready for deployment

### 6. bitpay-access-control.json ✅
**Contract**: `bitpay-access-control-v3`
**Events**: contract-authorized, contract-revoked, protocol-paused, protocol-unpaused
**Pattern**: `contains: "contract-"`
**Webhook**: `/api/webhooks/chainhook/access-control`
**Status**: Ready for deployment

## Deployment

### Via Hiro Platform Dashboard
1. Go to https://platform.hiro.so
2. Navigate to Chainhooks section
3. Click "Create Chainhook"
4. Upload the predicate JSON file
5. Verify configuration
6. Click "Deploy"

### Via API
```bash
curl -X POST https://api.hiro.so/chainhook/v1/predicates \
  -H "Authorization: Bearer ${HIRO_PLATFORM_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @chainhooks/1-bitpay-core-streams.json
```

## Configuration

**Chainhook Secret Token**: `72f5bcf6ed4419513b1120b07be57703d25bea704cab935b161838b883bb4a8a`

**Important**: Update webhook URLs from `http://localhost:3000` to your production URL before deploying for production use.

## Testing Order

1. **bitpay-core-v3** - Test stream creation, withdrawal, cancellation
2. **bitpay-nft-v3** - Test NFT minting when streams created
3. **bitpay-obligation-nft-v3** - Test obligation NFT transfer
4. **bitpay-marketplace-v3** - Test marketplace operations
5. **bitpay-treasury-v3** - Test treasury fee collection
6. **bitpay-access-control-v3** - Test access control events
