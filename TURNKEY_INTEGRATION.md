# Turnkey Integration Guide for BitPay

## 🎉 Overview

BitPay now uses **Turnkey** for wallet authentication and Stacks transaction signing. This provides:

- ✅ **Multiple auth methods**: Email, Google OAuth, Passkeys, Wallet Connect
- ✅ **Non-custodial wallets**: Users own their private keys via Turnkey's secure infrastructure
- ✅ **Stacks native**: Full transaction signing support for sBTC contracts
- ✅ **Beautiful UI**: Customizable modal with dark mode and pink/magenta accents
- ✅ **Automation ready**: Server-side SDK for automated stream withdrawals

---

## 🚀 Setup Instructions

### 1. Get Turnkey Credentials

1. Go to [https://app.turnkey.com/](https://app.turnkey.com/)
2. Create an account and organization
3. Create an **Auth Proxy Config** in the dashboard
4. Generate API keys for server-side operations

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

**Required variables:**
```env
# Public (client-side)
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_ID=your_auth_proxy_config_id_here
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your_organization_id_here

# Optional OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/oauth-callback

# Private (server-side only - NEVER expose these!)
TURNKEY_API_PRIVATE_KEY=your_api_private_key_here
TURNKEY_API_PUBLIC_KEY=your_api_public_key_here
```

### 3. Update User Model

Add Turnkey fields to your User model:

```typescript
// models/User.ts
{
  // ... existing fields
  turnkeySubOrgId: String,
  walletAddress: String,
}
```

### 4. Run the Application

```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Usage

### Client-Side Authentication

Use the `TurnkeyLoginButton` component anywhere in your app:

```tsx
import { TurnkeyLoginButton } from "@/components/auth/TurnkeyLoginButton";

export function Navbar() {
  return (
    <nav>
      <TurnkeyLoginButton />
    </nav>
  );
}
```

### Signing Transactions

Use the `useStacksSigner` hook to sign Stacks transactions:

```tsx
import { useStacksSigner } from "@/hooks/use-stacks-signer";
import { toast } from "sonner";

export function SendSTXButton() {
  const { signSTXTransfer, broadcastStacksTransaction, isLoading } = useStacksSigner();

  const handleSend = async () => {
    try {
      // 1. Sign the transaction
      const signedTx = await signSTXTransfer({
        recipient: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        amount: 1000000n, // 1 STX in micro-STX
        memo: "Payment from BitPay",
      });

      // 2. Broadcast to network
      const txId = await broadcastStacksTransaction(signedTx);

      toast.success(`Transaction sent! ID: ${txId}`);
    } catch (error) {
      toast.error("Failed to send transaction");
      console.error(error);
    }
  };

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? "Sending..." : "Send STX"}
    </button>
  );
}
```

### Contract Calls

Sign and broadcast contract calls:

```tsx
import { useStacksSigner } from "@/hooks/use-stacks-signer";
import { uintCV, principalCV } from "@stacks/transactions";

export function CreateStreamButton() {
  const { signContractCall, broadcastStacksTransaction } = useStacksSigner();

  const createStream = async () => {
    try {
      // Sign contract call
      const signedTx = await signContractCall({
        contractAddress: "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7",
        contractName: "bitpay-core",
        functionName: "create-stream",
        functionArgs: [
          principalCV("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"), // recipient
          uintCV(100000000), // 1 sBTC (8 decimals)
          uintCV(1000), // start-block
          uintCV(2000), // end-block
        ],
      });

      // Broadcast
      const txId = await broadcastStacksTransaction(signedTx);
      console.log("Stream created! TX:", txId);
    } catch (error) {
      console.error("Error creating stream:", error);
    }
  };

  return <button onClick={createStream}>Create Stream</button>;
}
```

### Access Auth State

Use the integrated `useAuth` hook:

```tsx
import { useAuth } from "@/hooks/use-auth";

export function UserProfile() {
  const {
    user,
    isAuthenticated,
    turnkeyAuthenticated,
    walletAddress,
    logout,
  } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Wallet: {walletAddress}</p>
      <p>Turnkey Auth: {turnkeyAuthenticated ? "Yes" : "No"}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🔐 Server-Side Operations

### Automated Stream Withdrawals

Use the server-side Turnkey client for automated operations:

```typescript
// app/api/streams/withdraw/route.ts
import { turnkeyServer, signTransactionForUser } from "@/lib/turnkey-server";
import { makeUnsignedContractCall, TransactionSigner, sigHashPreSign } from "@stacks/transactions";

export async function POST(req: Request) {
  const { userId, streamId } = await req.json();

  // Get user from database
  const user = await User.findById(userId);

  // Build unsigned transaction
  const transaction = await makeUnsignedContractCall({
    contractAddress: "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7",
    contractName: "bitpay-core",
    functionName: "withdraw",
    functionArgs: [uintCV(streamId)],
    publicKey: user.walletPublicKey,
    // ... other params
  });

  // Sign on behalf of user
  const signer = new TransactionSigner(transaction);
  const preSignSigHash = sigHashPreSign(/* ... */);

  const signature = await signTransactionForUser({
    subOrgId: user.turnkeySubOrgId,
    publicKey: user.walletPublicKey,
    payload: `0x${preSignSigHash}`,
  });

  // Attach signature and broadcast
  // ...
}
```

---

## 🎨 UI Customization

The modal UI is already configured to match BitPay's design (dark mode with pink accents).

To customize further, edit `app/providers/TurnkeyProvider.tsx`:

```typescript
ui: {
  darkMode: true,
  colors: {
    dark: {
      primary: "#your-color-here", // Change accent color
      modalBackground: "#0b0b0b",
    },
  },
  borderRadius: 20, // Adjust border radius
  backgroundBlur: 10, // Adjust blur
}
```

---

## 🔧 Troubleshooting

### "Missing authProxyConfigId" Error

Make sure `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_ID` is set in `.env.local`.

### Authentication Modal Not Appearing

1. Check that `TurnkeyProvider` is wrapping your app in `app/layout.tsx`
2. Import Turnkey styles: `import "@turnkey/react-wallet-kit/styles.css"`
3. Verify environment variables are properly prefixed with `NEXT_PUBLIC_`

### "No Stacks account found" Error

The wallet needs a secp256k1 account. Verify the `createSuborgParams` in `TurnkeyProvider.tsx` has:

```typescript
{
  curve: "CURVE_SECP256K1",
  addressFormat: "ADDRESS_FORMAT_UNCOMPRESSED",
  path: "m/44'/5757'/0'/0/0", // Stacks derivation path
}
```

### Transaction Signing Fails

1. Make sure the user is authenticated (`turnkeyAuthenticated === true`)
2. Check that the wallet has a secp256k1 account
3. Verify the network configuration matches (testnet vs mainnet)

---

## 📚 API Reference

### `useStacksSigner()`

Returns:
- `stacksAddress: string | null` - Current wallet address
- `signSTXTransfer(params)` - Sign STX transfer
- `signContractCall(params)` - Sign contract call
- `broadcastStacksTransaction(tx)` - Broadcast transaction
- `getNonce()` - Get current nonce
- `isLoading: boolean` - Loading state

### `useAuth()`

Returns:
- `user: User | null` - Current user
- `isAuthenticated: boolean` - Auth status
- `turnkeyAuthenticated: boolean` - Turnkey auth status
- `walletAddress: string | null` - Wallet address
- `logout()` - Logout function

---

## 🔗 Resources

- [Turnkey Documentation](https://docs.turnkey.com/)
- [Turnkey React Wallet Kit](https://docs.turnkey.com/sdks/react)
- [Stacks.js Documentation](https://docs.hiro.so/stacks/stacks.js)
- [BitPay Smart Contracts](../contract/)

---

## ✅ Next Steps

1. **Set up OAuth** (optional): Configure Google OAuth for smoother onboarding
2. **Test on Testnet**: Create test streams and verify transactions
3. **Add Automation**: Implement automated stream withdrawals using server-side SDK
4. **Deploy**: Deploy to production with proper environment variables

---

**Questions?** Check the Turnkey docs or reach out to the team!
