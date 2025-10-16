"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Wallet, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "../CodeBlock";
import Link from "next/link";

export function GettingStarted() {
  return (
    <DocsSection
      title="Getting Started"
      description="Start streaming Bitcoin in minutes"
      badge="Quick Start"
    >
      <SubSection title="Prerequisites">
        <InfoCard title="What You'll Need" variant="info">
          <ul className="space-y-3 text-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong>Stacks Wallet:</strong> We recommend{" "}
                <a
                  href="https://wallet.hiro.so/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink hover:underline"
                >
                  Hiro Wallet
                </a>{" "}
                or{" "}
                <a
                  href="https://www.xverse.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink hover:underline"
                >
                  Xverse
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong>sBTC:</strong> You'll need some sBTC in your wallet to
                create streams
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong>Recipient Address:</strong> The Stacks address of the
                person you want to stream to
              </div>
            </li>
          </ul>
        </InfoCard>
      </SubSection>

      <SubSection title="Step-by-Step Guide">
        <div className="space-y-6">
          <InfoCard title="Step 1: Connect Your Wallet" variant="pink">
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed">
                Click the "Connect Wallet" button in the top right corner of the
                BitPay dashboard. Select your preferred wallet provider and approve
                the connection.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Supported: Hiro Wallet, Xverse, Leather</span>
              </div>
              <Link href="/dashboard">
                <Button className="mt-2 bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              </Link>
            </div>
          </InfoCard>

          <InfoCard title="Step 2: Create Your First Stream" variant="teal">
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed">
                Navigate to the dashboard and click "Create Stream". You'll need to
                provide:
              </p>
              <ul className="space-y-2 text-sm text-foreground ml-4">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-brand-teal" />
                  <span>
                    <strong>Recipient Address:</strong> The Stacks wallet address
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-brand-teal" />
                  <span>
                    <strong>Amount:</strong> Total sBTC to stream (in BTC)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-brand-teal" />
                  <span>
                    <strong>Duration:</strong> How long the stream should last
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-brand-teal" />
                  <span>
                    <strong>Start Time:</strong> When the stream begins (optional,
                    defaults to now)
                  </span>
                </li>
              </ul>
            </div>
          </InfoCard>

          <InfoCard title="Step 3: Confirm Transaction" variant="info">
            <p className="text-foreground leading-relaxed">
              Review the stream details and confirm the transaction in your wallet.
              The sBTC will be locked in the smart contract and will start
              streaming according to your schedule.
            </p>
          </InfoCard>

          <InfoCard title="Step 4: Monitor Your Stream" variant="success">
            <p className="text-foreground leading-relaxed mb-3">
              Once created, you can monitor your stream in real-time from the
              dashboard. You'll see:
            </p>
            <ul className="space-y-2 text-sm text-foreground ml-4">
              <li>• Real-time progress bar showing vesting progress</li>
              <li>• Amount streamed vs. total amount</li>
              <li>• Amount withdrawn by recipient</li>
              <li>• Stream status (active, paused, cancelled, completed)</li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Quick Start Templates">
        <p className="text-muted-foreground mb-4">
          Use these pre-configured templates to get started quickly:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard title="30-Day Contract" variant="pink">
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Perfect for monthly payments or short-term contracts
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Duration: 4,320 blocks (~30 days)</div>
                <div>Rate: Continuous over 30 days</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
              >
                Use Template
              </Button>
            </div>
          </InfoCard>

          <InfoCard title="1-Year Vesting" variant="teal">
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Ideal for employee compensation and equity vesting
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Duration: 52,560 blocks (~1 year)</div>
                <div>Rate: Linear vesting over 12 months</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
              >
                Use Template
              </Button>
            </div>
          </InfoCard>

          <InfoCard title="4-Year Vesting" variant="info">
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Standard startup equity vesting schedule
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Duration: 210,240 blocks (~4 years)</div>
                <div>Rate: Linear vesting over 48 months</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
              >
                Use Template
              </Button>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="For Recipients: Withdrawing Funds">
        <InfoCard title="How to Claim Your Streamed Funds" variant="teal">
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              As a recipient, you can withdraw your vested funds at any time:
            </p>
            <ol className="space-y-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </span>
                <span>
                  Connect your wallet and navigate to "My Streams" in the
                  dashboard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </span>
                <span>
                  Find the stream you want to withdraw from - you'll see the
                  available balance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </span>
                <span>
                  Click "Withdraw" and confirm the transaction in your wallet
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </span>
                <span>
                  The vested sBTC will be transferred to your wallet immediately
                </span>
              </li>
            </ol>
            <InfoCard title="Pro Tip" variant="success">
              <p className="text-sm text-foreground">
                You don't have to withdraw all your vested funds at once. You can
                withdraw partial amounts as many times as you want throughout the
                stream duration.
              </p>
            </InfoCard>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Example: Creating a Stream with Code">
        <p className="text-muted-foreground mb-4">
          For developers integrating BitPay into their applications:
        </p>
        <CodeBlock
          language="typescript"
          title="create-stream.ts"
          code={`import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV, standardPrincipalCV } from '@stacks/transactions';

async function createStream() {
  const recipient = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const amount = 1000000; // 1 sBTC in satoshis
  const duration = 4320; // ~30 days in blocks

  await openContractCall({
    contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    contractName: 'bitpay-core',
    functionName: 'create-stream',
    functionArgs: [
      standardPrincipalCV(recipient),
      uintCV(amount),
      uintCV(duration),
    ],
    onFinish: (data) => {
      console.log('Stream created:', data.txId);
    },
  });
}`}
        />
      </SubSection>

      <SubSection title="Next Steps">
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/dashboard">
            <InfoCard title="Create Your First Stream" variant="pink">
              <p className="text-sm text-foreground mb-3">
                Start streaming Bitcoin now with our intuitive dashboard
              </p>
              <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
                <Play className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </InfoCard>
          </Link>

          <Link href="/explorer">
            <InfoCard title="Explore Active Streams" variant="teal">
              <p className="text-sm text-foreground mb-3">
                See what others are building with BitPay
              </p>
              <Button variant="outline" className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                View Explorer
              </Button>
            </InfoCard>
          </Link>
        </div>
      </SubSection>
    </DocsSection>
  );
}
