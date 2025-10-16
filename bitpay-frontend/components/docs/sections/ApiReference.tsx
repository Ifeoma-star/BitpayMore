"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { FileCode, Zap, Database, Radio } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function ApiReference() {
  return (
    <DocsSection
      title="API Reference"
      description="REST API and WebSocket integration guide"
      badge="Developers"
    >
      <SubSection title="Base URL">
        <InfoCard title="API Endpoints" variant="info">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Production:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                https://api.bitpay.finance
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Testnet:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                https://testnet-api.bitpay.finance
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">WebSocket:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                wss://ws.bitpay.finance
              </code>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="REST API Endpoints">
        <div className="space-y-4">
          <InfoCard title="GET /api/streams/:streamId" variant="teal">
            <p className="text-sm text-muted-foreground mb-3">
              Retrieve detailed information about a specific stream.
            </p>
            <CodeBlock
              language="typescript"
              title="Request Example"
              code={`const response = await fetch(
  'https://api.bitpay.finance/api/streams/123'
);
const stream = await response.json();

console.log(stream);`}
            />
            <CodeBlock
              language="json"
              title="Response"
              code={`{
  "streamId": 123,
  "sender": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "recipient": "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
  "amount": "1000000",
  "startBlock": 100,
  "endBlock": 200,
  "withdrawn": "250000",
  "cancelled": false,
  "currentBlock": 150,
  "vestedAmount": "500000",
  "withdrawableAmount": "250000",
  "status": "active"
}`}
            />
          </InfoCard>

          <InfoCard title="GET /api/users/:address/streams" variant="pink">
            <p className="text-sm text-muted-foreground mb-3">
              Get all streams for a specific user (as sender or recipient).
            </p>
            <CodeBlock
              language="typescript"
              title="Request with Query Parameters"
              code={`// Get all streams where user is sender
const senderStreams = await fetch(
  'https://api.bitpay.finance/api/users/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7/streams?role=sender'
).then(r => r.json());

// Get all streams where user is recipient
const recipientStreams = await fetch(
  'https://api.bitpay.finance/api/users/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7/streams?role=recipient'
).then(r => r.json());

// Get all streams (both roles)
const allStreams = await fetch(
  'https://api.bitpay.finance/api/users/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7/streams'
).then(r => r.json());`}
            />
          </InfoCard>

          <InfoCard title="GET /api/marketplace/listings" variant="info">
            <p className="text-sm text-muted-foreground mb-3">
              Retrieve all active NFT listings on the marketplace.
            </p>
            <CodeBlock
              language="typescript"
              title="Request Example"
              code={`const listings = await fetch(
  'https://api.bitpay.finance/api/marketplace/listings'
).then(r => r.json());

console.log(listings);`}
            />
            <CodeBlock
              language="json"
              title="Response"
              code={`{
  "listings": [
    {
      "streamId": 45,
      "seller": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      "price": "800000",
      "listedAt": 12345,
      "stream": {
        "amount": "1000000",
        "startBlock": 100,
        "endBlock": 500,
        "remainingValue": "900000"
      }
    }
  ]
}`}
            />
          </InfoCard>

          <InfoCard title="GET /api/treasury/balance" variant="success">
            <p className="text-sm text-muted-foreground mb-3">
              Get current treasury balance and statistics.
            </p>
            <CodeBlock
              language="typescript"
              title="Request Example"
              code={`const treasury = await fetch(
  'https://api.bitpay.finance/api/treasury/balance'
).then(r => r.json());

console.log(\`Treasury Balance: \${treasury.balance} sats\`);`}
            />
          </InfoCard>

          <InfoCard title="GET /api/stats" variant="warning">
            <p className="text-sm text-muted-foreground mb-3">
              Get global protocol statistics.
            </p>
            <CodeBlock
              language="json"
              title="Response"
              code={`{
  "totalStreams": 1523,
  "activeStreams": 847,
  "totalValueLocked": "125000000000",
  "totalVolumeAllTime": "3500000000000",
  "uniqueUsers": 4213,
  "averageStreamDuration": 15840
}`}
            />
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="WebSocket Events">
        <InfoCard title="Real-Time Updates" variant="teal">
          <p className="text-sm text-muted-foreground mb-3">
            Subscribe to real-time events via WebSocket connection:
          </p>
          <CodeBlock
            language="typescript"
            title="WebSocket Connection"
            code={`import { io } from 'socket.io-client';

const socket = io('wss://ws.bitpay.finance');

// Subscribe to stream events for a specific user
socket.emit('subscribe', {
  channel: 'user-streams',
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'
});

// Listen for stream created events
socket.on('stream-created', (data) => {
  console.log('New stream created:', data);
  // {
  //   streamId: 124,
  //   sender: '...',
  //   recipient: '...',
  //   amount: '1000000',
  //   startBlock: 150,
  //   endBlock: 250
  // }
});

// Listen for withdrawal events
socket.on('stream-withdrawal', (data) => {
  console.log('Withdrawal:', data);
  // {
  //   streamId: 124,
  //   recipient: '...',
  //   amount: '250000'
  // }
});

// Listen for cancellation events
socket.on('stream-cancelled', (data) => {
  console.log('Stream cancelled:', data);
  // {
  //   streamId: 124,
  //   sender: '...',
  //   vested: '500000',
  //   refunded: '495000',
  //   fee: '5000'
  // }
});

// Listen for marketplace events
socket.on('nft-listed', (data) => {
  console.log('NFT listed:', data);
});

socket.on('nft-sold', (data) => {
  console.log('NFT sold:', data);
});`}
          />
        </InfoCard>

        <InfoCard title="Available WebSocket Channels" variant="pink">
          <div className="space-y-2 text-sm">
            <div className="border-l-4 border-brand-pink pl-3">
              <code className="text-xs">user-streams</code>
              <p className="text-muted-foreground text-xs mt-1">
                All stream events for a specific user address
              </p>
            </div>
            <div className="border-l-4 border-brand-teal pl-3">
              <code className="text-xs">global-streams</code>
              <p className="text-muted-foreground text-xs mt-1">
                All stream events across the protocol
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-3">
              <code className="text-xs">marketplace</code>
              <p className="text-muted-foreground text-xs mt-1">
                All marketplace listing and trading events
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <code className="text-xs">treasury</code>
              <p className="text-muted-foreground text-xs mt-1">
                Treasury proposals and executions
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Smart Contract Integration">
        <InfoCard title="Stacks.js Integration" variant="info">
          <p className="text-sm text-muted-foreground mb-3">
            Integrate BitPay directly with Stacks.js for blockchain interactions:
          </p>
          <CodeBlock
            language="typescript"
            title="Create Stream with Stacks.js"
            code={`import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  principalCV,
  standardPrincipalCV
} from '@stacks/transactions';

async function createStream(
  recipient: string,
  amountSats: number,
  startBlock: number,
  endBlock: number
) {
  const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const contractName = 'bitpay-core';

  await openContractCall({
    contractAddress,
    contractName,
    functionName: 'create-stream',
    functionArgs: [
      standardPrincipalCV(recipient),
      uintCV(amountSats),
      uintCV(startBlock),
      uintCV(endBlock),
    ],
    onFinish: (data) => {
      console.log('Transaction ID:', data.txId);
      console.log('Stream created successfully');
    },
    onCancel: () => {
      console.log('Transaction cancelled by user');
    },
  });
}

// Example usage
createStream(
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
  1000000, // 1M sats
  100,     // start block
  200      // end block
);`}
          />
        </InfoCard>

        <InfoCard title="Read-Only Contract Calls" variant="success">
          <CodeBlock
            language="typescript"
            title="Query Stream Data"
            code={`import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

async function getStreamInfo(streamId: number) {
  const network = new StacksTestnet();
  const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const contractName = 'bitpay-core';

  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress: contractAddress,
  });

  return result;
}

async function getWithdrawableAmount(streamId: number) {
  const result = await callReadOnlyFunction({
    network: new StacksTestnet(),
    contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    contractName: 'bitpay-core',
    functionName: 'get-withdrawable-amount',
    functionArgs: [uintCV(streamId)],
    senderAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  });

  return result;
}`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="Rate Limits & Best Practices">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Rate Limits" variant="warning">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">REST API:</span>
                <code className="text-xs">100 req/min</code>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">WebSocket:</span>
                <code className="text-xs">Unlimited</code>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Burst limit:</span>
                <code className="text-xs">200 req/min</code>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Rate limits are per IP address. Contact us for higher limits if needed.
            </p>
          </InfoCard>

          <InfoCard title="Best Practices" variant="success">
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Use WebSocket for real-time updates instead of polling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Cache responses when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Handle errors gracefully with retry logic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Calculate vested amounts off-chain for instant feedback</span>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Error Handling">
        <InfoCard title="HTTP Error Codes" variant="pink">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs">200</code>
              <span className="text-foreground">Success</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs">400</code>
              <span className="text-foreground">
                Bad Request - Invalid parameters
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs">404</code>
              <span className="text-foreground">
                Not Found - Resource doesn't exist
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs">429</code>
              <span className="text-foreground">Rate Limit Exceeded</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs">500</code>
              <span className="text-foreground">Internal Server Error</span>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Smart Contract Errors" variant="info">
          <CodeBlock
            language="typescript"
            title="Error Handling Example"
            code={`try {
  await createStream(recipient, amount, startBlock, endBlock);
} catch (error) {
  if (error.code === 'ERR_INVALID_AMOUNT') {
    console.error('Amount must be greater than 0');
  } else if (error.code === 'ERR_INVALID_RECIPIENT') {
    console.error('Cannot stream to yourself');
  } else if (error.code === 'ERR_INSUFFICIENT_BALANCE') {
    console.error('Insufficient sBTC balance');
  } else {
    console.error('Transaction failed:', error);
  }
}`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="SDK & Libraries">
        <InfoCard title="Official BitPay SDK (Coming Soon)" variant="teal">
          <p className="text-sm text-foreground mb-3">
            We're working on official SDKs for popular languages:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded text-center">
              <code>@bitpay/sdk-js</code>
              <div className="text-xs text-muted-foreground mt-1">
                JavaScript/TypeScript
              </div>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <code>bitpay-python</code>
              <div className="text-xs text-muted-foreground mt-1">Python</div>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <code>bitpay-rust</code>
              <div className="text-xs text-muted-foreground mt-1">Rust</div>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <code>bitpay-go</code>
              <div className="text-xs text-muted-foreground mt-1">Go</div>
            </div>
          </div>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
