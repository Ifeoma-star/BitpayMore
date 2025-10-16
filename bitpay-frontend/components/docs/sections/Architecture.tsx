"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Box, Layers, Database, Globe, Zap, Server } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function Architecture() {
  return (
    <DocsSection
      title="Architecture"
      description="Technical architecture and system design of BitPay"
      badge="Technical"
    >
      <SubSection title="System Overview">
        <InfoCard title="High-Level Architecture" variant="info">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay is built on a modern, scalable architecture that leverages the
            power of Bitcoin through Stacks and sBTC. The system consists of three
            main layers: Smart Contracts (on-chain logic), Frontend Application
            (user interface), and Backend Services (real-time updates and
            indexing).
          </p>
          <div className="bg-muted p-6 rounded-lg">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-32 font-semibold">Frontend Layer</div>
                <div className="flex-1 border-t-2 border-brand-pink"></div>
                <div className="text-muted-foreground">Next.js 15 + React</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 font-semibold">API Layer</div>
                <div className="flex-1 border-t-2 border-brand-teal"></div>
                <div className="text-muted-foreground">REST + WebSocket</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 font-semibold">Blockchain Layer</div>
                <div className="flex-1 border-t-2 border-yellow-500"></div>
                <div className="text-muted-foreground">
                  Stacks + sBTC + Clarity
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Technology Stack">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Smart Contracts" variant="pink">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Box className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Clarity Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Decidable, secure smart contract language designed for Bitcoin
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Stacks Blockchain</h4>
                  <p className="text-sm text-muted-foreground">
                    Smart contracts secured by Bitcoin's proof-of-work
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">sBTC Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Native Bitcoin as collateral for streaming payments
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Frontend Application" variant="teal">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Next.js 15</h4>
                  <p className="text-sm text-muted-foreground">
                    React framework with App Router for modern web applications
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Box className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Stacks.js & Connect
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Wallet integration and blockchain interactions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Shadcn UI + Tailwind
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Beautiful, accessible component library
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Backend Services" variant="info">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Server className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Node.js API</h4>
                  <p className="text-sm text-muted-foreground">
                    RESTful API for data access and aggregation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">WebSocket Server</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time updates for stream events and notifications
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    MongoDB + Chainhook
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Indexed blockchain data for fast queries
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Development Tools" variant="success">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Box className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Clarinet</h4>
                  <p className="text-sm text-muted-foreground">
                    Local development environment for Clarity contracts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    AI Tools (Claude & Cursor)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    "Vibe coding" with AI-assisted development
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Server className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    TypeScript & Testing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Type-safe development with comprehensive test coverage
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Smart Contract Architecture">
        <InfoCard title="Contract Structure" variant="pink">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay's smart contract system is composed of four main contracts that
            work together to enable streaming payments, marketplace functionality,
            and decentralized governance:
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-brand-pink pl-4">
              <h4 className="font-semibold mb-1">1. bitpay-core</h4>
              <p className="text-sm text-muted-foreground">
                Main contract handling stream creation, withdrawal, and
                cancellation. Contains core vesting calculation logic and stream
                state management.
              </p>
            </div>
            <div className="border-l-4 border-brand-teal pl-4">
              <h4 className="font-semibold mb-1">2. bitpay-treasury</h4>
              <p className="text-sm text-muted-foreground">
                Multi-signature treasury contract for protocol fee collection and
                management. Implements proposal-based governance for fund
                withdrawals.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold mb-1">3. bitpay-marketplace</h4>
              <p className="text-sm text-muted-foreground">
                NFT marketplace for trading stream obligation and claim NFTs.
                Enables secondary markets for future cash flows.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-1">4. bitpay-stream-nft</h4>
              <p className="text-sm text-muted-foreground">
                SIP-009 compliant NFT contract representing stream obligations
                (sender) and claims (recipient). Allows streams to be traded and
                transferred.
              </p>
            </div>
          </div>
        </InfoCard>

        <CodeBlock
          language="clarity"
          title="Core Data Structures"
          code={`;; Stream data structure
(define-map streams
  { stream-id: uint }
  {
    sender: principal,
    recipient: principal,
    start-time: uint,
    stop-time: uint,
    total-amount: uint,
    withdrawn: uint,
    cancelled: bool,
    sender-can-cancel: bool
  }
)

;; User stream tracking
(define-map user-streams
  { user: principal }
  { stream-ids: (list 1000 uint) }
)`}
        />
      </SubSection>

      <SubSection title="Data Flow Architecture">
        <InfoCard title="How Data Flows Through BitPay" variant="teal">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                User Interaction
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                User interacts with the Next.js frontend, connecting their wallet
                via Stacks Connect. The UI calculates vested amounts in real-time
                using off-chain computation for instant feedback.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-brand-pink text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Transaction Broadcast
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                When creating/withdrawing/cancelling streams, the frontend
                constructs a Clarity transaction and sends it to the Stacks
                blockchain via the user's wallet.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Smart Contract Execution
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                The smart contract executes on Stacks, validated and secured by
                Bitcoin. sBTC is locked/released according to the stream logic.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  4
                </span>
                Event Indexing
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                Chainhook monitors the blockchain for BitPay events and indexes
                them in MongoDB. This enables fast queries for the explorer and
                dashboard.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  5
                </span>
                Real-Time Updates
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                WebSocket server pushes real-time notifications to connected
                clients. Users see instant updates when streams are created,
                withdrawn, or cancelled.
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Scalability & Performance">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Off-Chain Computation" variant="success">
            <p className="text-sm text-foreground leading-relaxed mb-3">
              The vesting calculation is a pure function that can be computed
              off-chain. The frontend calculates vested amounts locally in
              real-time, only calling the blockchain for actual withdrawals.
            </p>
            <CodeBlock
              language="typescript"
              title="off-chain-calculation.ts"
              code={`function calculateVestedAmount(
  stream: Stream,
  currentBlock: number
): bigint {
  if (currentBlock <= stream.startTime) {
    return 0n;
  }
  if (currentBlock >= stream.stopTime) {
    return stream.totalAmount - stream.withdrawn;
  }

  const elapsed = currentBlock - stream.startTime;
  const duration = stream.stopTime - stream.startTime;
  const vested = (stream.totalAmount * elapsed) / duration;

  return vested - stream.withdrawn;
}`}
            />
          </InfoCard>

          <InfoCard title="Indexed Data Layer" variant="info">
            <p className="text-sm text-foreground leading-relaxed mb-3">
              MongoDB indexes blockchain events via Chainhook, enabling fast
              queries for dashboards and explorers without direct blockchain reads.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground mt-3">
              <div className="flex justify-between">
                <span>Direct blockchain query:</span>
                <span className="font-semibold text-foreground">~2-5s</span>
              </div>
              <div className="flex justify-between">
                <span>Indexed MongoDB query:</span>
                <span className="font-semibold text-green-600">~10-50ms</span>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Security Architecture">
        <InfoCard title="Multi-Layered Security" variant="warning">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">
                1. Decidable Smart Contracts
              </h4>
              <p className="text-muted-foreground">
                Clarity's decidability means you can prove what the code will do
                before execution, eliminating entire classes of vulnerabilities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                2. Bitcoin-Secured Settlement
              </h4>
              <p className="text-muted-foreground">
                All transactions are secured by Bitcoin's proof-of-work, inheriting
                Bitcoin's security model.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">3. Safe Math Operations</h4>
              <p className="text-muted-foreground">
                All arithmetic uses checked operations that prevent overflow and
                underflow vulnerabilities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">4. Access Control</h4>
              <p className="text-muted-foreground">
                Strict permission checks ensure only authorized users can perform
                sensitive operations (e.g., only sender can cancel, only recipient
                can withdraw).
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Future Extensibility">
        <InfoCard title="Designed for Growth" variant="teal">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay's architecture is designed with upgradeability and extensibility
            in mind:
          </p>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-brand-teal">•</span>
              <span>
                <strong>Data-Logic Separation:</strong> Core data structures are
                isolated from business logic, enabling safer upgrades
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-teal">•</span>
              <span>
                <strong>Trait-Based Interfaces:</strong> Contracts use Clarity
                traits for flexible integration with future contracts
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-teal">•</span>
              <span>
                <strong>Version Migration Paths:</strong> Users can migrate to new
                contract versions while preserving existing streams
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-teal">•</span>
              <span>
                <strong>Plugin Architecture:</strong> New features can be added via
                separate contracts that interact with the core
              </span>
            </li>
          </ul>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
