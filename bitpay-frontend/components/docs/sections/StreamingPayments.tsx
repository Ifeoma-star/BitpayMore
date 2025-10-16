"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Waves, Clock, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function StreamingPayments() {
  return (
    <DocsSection
      title="Streaming Payments"
      description="Understanding how continuous money streams work in BitPay"
      badge="Core Concept"
    >
      <SubSection title="The Essence of Streaming Payments">
        <InfoCard title="Drip Irrigation vs. Firehose" variant="teal">
          <p className="text-foreground leading-relaxed mb-4">
            The essence isn't about "making a gain" in the traditional profit sense;
            it's about managing risk, aligning incentives, and creating new
            financial relationships.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Waves className="h-4 w-4 text-brand-teal" />
                Traditional Payment (Firehose)
              </h4>
              <p className="text-sm text-muted-foreground">
                All money arrives at once. High risk for sender. No flexibility for
                changing circumstances. Binary trust model.
              </p>
            </div>
            <div className="bg-brand-teal/10 p-4 rounded-lg border border-brand-teal/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Waves className="h-4 w-4 text-brand-teal" />
                Streaming Payment (Drip)
              </h4>
              <p className="text-sm text-foreground">
                Money flows continuously. Risk is proportional to time. Instant
                feedback loop. Trust is earned continuously.
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Why Receive Money in Streams?">
        <div className="space-y-4">
          <InfoCard title="Lower Risk for Everyone" variant="success">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Continuous Proof of Value</h4>
                  <p className="text-muted-foreground">
                    If you're hired for a 6-month project and receive payment
                    upfront, what incentive do you have to finish? With streaming,
                    you only get paid as you deliver value.
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Cash Flow Smoothing" variant="info">
            <p className="text-sm text-foreground mb-3">
              Instead of waiting for a monthly paycheck, imagine getting paid every
              second. This is revolutionary for:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• Freelancers who need steady income</li>
              <li>• Employees living paycheck-to-paycheck</li>
              <li>• Contractors managing multiple projects</li>
              <li>• Content creators with variable income</li>
            </ul>
          </InfoCard>

          <InfoCard title="Flexibility & Liquidity" variant="pink">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div className="text-sm">
                <p className="text-foreground mb-2">
                  You can withdraw vested funds at any time - not just on payday.
                  Need $50 today? Withdraw it. The rest keeps streaming.
                </p>
                <p className="text-muted-foreground">
                  This is like having an always-available line of credit against your
                  future earnings.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Why Send Money in Streams?">
        <div className="space-y-4">
          <InfoCard title="Risk Management for Senders" variant="warning">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    Cancel Anytime, Pay Only for Time Worked
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    If you hire someone for 6 months but the relationship doesn't
                    work out after 2 months, you can cancel the stream. They keep
                    what they've earned (2 months), and you get the rest back (4
                    months).
                  </p>
                </div>
              </div>
              <InfoCard title="The Cancellation Fee" variant="info">
                <p className="text-xs text-muted-foreground">
                  BitPay charges a small 1% cancellation fee on the unvested amount.
                  This discourages frivolous cancellations while still allowing
                  flexibility. The fee goes to the protocol treasury.
                </p>
              </InfoCard>
            </div>
          </InfoCard>

          <InfoCard title="Vesting & Equity" variant="teal">
            <p className="text-sm text-foreground leading-relaxed mb-3">
              For startups giving equity to employees or advisors, streaming is the
              perfect mechanism:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-brand-teal">✓</span>
                <span className="text-foreground">
                  Standard 4-year vesting schedules
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-teal">✓</span>
                <span className="text-foreground">
                  Employee leaves early? They only get vested portion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-teal">✓</span>
                <span className="text-foreground">
                  No complex legal contracts - it's all in the smart contract
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-teal">✓</span>
                <span className="text-foreground">
                  Transparent and auditable by all parties
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Subscriptions & Recurring Payments" variant="pink">
            <p className="text-sm text-foreground leading-relaxed">
              Instead of monthly charges, stream payments continuously. Customers can
              cancel anytime and only pay for time used. Perfect for SaaS, content
              subscriptions, and service contracts.
            </p>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Stream Lifecycle">
        <InfoCard title="From Creation to Completion" variant="info">
          <div className="space-y-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Stream Timeline</span>
                <span className="text-xs text-muted-foreground">
                  Time (in blocks) →
                </span>
              </div>
              <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-2 bg-gradient-to-r from-brand-pink via-brand-teal to-green-500" />
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-pink border-2 border-white" />
                    <span className="text-xs mt-1">Start</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-teal border-2 border-white" />
                    <span className="text-xs mt-1">50% Vested</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    <span className="text-xs mt-1">End</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-brand-pink pl-4">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  1. Stream Created
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sender deposits total amount into smart contract. Stream is
                  scheduled to start at specified block height. Both parties receive
                  NFTs representing their positions.
                </p>
              </div>

              <div className="border-l-4 border-brand-teal pl-4">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <Waves className="h-4 w-4" />
                  2. Streaming Active
                </h4>
                <p className="text-sm text-muted-foreground">
                  Funds vest continuously according to linear schedule. Recipient can
                  withdraw any vested amount at any time. Sender can cancel if
                  needed (with 1% fee).
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  3. Stream Completed
                </h4>
                <p className="text-sm text-muted-foreground">
                  End block reached. 100% of funds are vested. Recipient can withdraw
                  remaining balance. Stream marked as completed in smart contract.
                </p>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Vesting Mathematics">
        <InfoCard title="Linear Vesting Formula" variant="pink">
          <p className="text-sm text-muted-foreground mb-4">
            BitPay uses a simple, elegant linear vesting formula:
          </p>
          <div className="bg-slate-900 p-6 rounded-lg text-center mb-4">
            <div className="font-mono text-xl text-slate-100">
              vested = (elapsed / duration) × total_amount
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-foreground">Where:</strong>
              <ul className="mt-2 space-y-1 ml-4 text-muted-foreground">
                <li>• elapsed = current_block - start_block</li>
                <li>• duration = end_block - start_block</li>
                <li>• total_amount = total sBTC in the stream</li>
              </ul>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Example Calculation" variant="teal">
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg text-sm">
              <div className="font-semibold mb-2">Scenario:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Total Amount: 1,000,000 sats (0.01 BTC)</li>
                <li>• Start Block: 100</li>
                <li>• End Block: 200 (duration = 100 blocks)</li>
                <li>• Current Block: 150 (halfway through)</li>
              </ul>
            </div>

            <CodeBlock
              language="typescript"
              title="Vesting Calculation"
              code={`// At block 150 (halfway)
const elapsed = 150 - 100;  // 50 blocks
const duration = 200 - 100;  // 100 blocks
const totalAmount = 1000000;  // sats

const vested = (elapsed / duration) * totalAmount;
// vested = (50 / 100) * 1,000,000 = 500,000 sats

// Withdrawable = vested - already_withdrawn
const withdrawable = vested - withdrawn;
// If nothing withdrawn yet: 500,000 sats available`}
            />

            <div className="bg-brand-teal/10 p-4 rounded-lg border border-brand-teal/20">
              <p className="text-sm text-foreground">
                <strong>Result:</strong> At block 150, 500,000 sats (50%) have vested
                and can be withdrawn by the recipient.
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Cancellation Mechanics">
        <InfoCard title="How Cancellation Works" variant="warning">
          <div className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              When a sender cancels a stream, the following happens atomically:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Calculate Vested Amount</h4>
                  <p className="text-muted-foreground">
                    Smart contract calculates how much has vested up to the current
                    block using the linear formula.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">
                    Lock Vested Amount for Recipient
                  </h4>
                  <p className="text-muted-foreground">
                    The vested amount remains in the contract, available for
                    recipient to withdraw at any time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">
                    Calculate Cancellation Fee (1%)
                  </h4>
                  <p className="text-muted-foreground">
                    Fee = (unvested_amount × 100) / 10,000 = 1% of unvested amount
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Transfer Fee to Treasury</h4>
                  <p className="text-muted-foreground">
                    Cancellation fee is sent to protocol treasury for governance and
                    development.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  5
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">
                    Refund Remaining to Sender
                  </h4>
                  <p className="text-muted-foreground">
                    Sender receives: unvested_amount - cancellation_fee
                  </p>
                </div>
              </div>
            </div>

            <CodeBlock
              language="clarity"
              title="Cancellation Example"
              code={`;; Example: Cancelling at 50% completion
;; Total: 1,000,000 sats
;; Vested: 500,000 sats (stays with recipient)
;; Unvested: 500,000 sats
;; Fee: 5,000 sats (1% of unvested)
;; Refund: 495,000 sats (returned to sender)

(define-public (cancel-stream (stream-id uint))
  (let (
    (vested 500000)
    (unvested 500000)
    (fee (/ (* unvested 100) 10000))  ;; 1% = 5,000
    (refund (- unvested fee))          ;; 495,000
  )
    ;; Transfer fee to treasury
    (try! (contract-call? .bitpay-treasury deposit-fees fee))

    ;; Refund to sender
    (try! (transfer-from-vault refund tx-sender))

    (ok refund)
  )
)`}
            />
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Real-World Use Cases">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Employee Compensation" variant="pink">
            <p className="text-sm text-foreground mb-2">
              <strong>Scenario:</strong> Startup hires developer at $120k/year
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Create stream: 120k sBTC over 52,560 blocks (~1 year)</li>
              <li>• Employee can withdraw anytime (no waiting for payday)</li>
              <li>• If employee leaves, they only get time worked</li>
              <li>• Company can cancel with 1% fee if needed</li>
            </ul>
          </InfoCard>

          <InfoCard title="Content Creator Support" variant="teal">
            <p className="text-sm text-foreground mb-2">
              <strong>Scenario:</strong> Fan supports creator at $10/month
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Create stream: 10 sBTC over 4,320 blocks (~30 days)</li>
              <li>• Creator gets paid every block (~10 min)</li>
              <li>• Fan can cancel anytime (fair usage)</li>
              <li>• More sustainable than one-time donations</li>
            </ul>
          </InfoCard>

          <InfoCard title="Equity Vesting" variant="info">
            <p className="text-sm text-foreground mb-2">
              <strong>Scenario:</strong> Co-founder equity with 4-year vest
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Create stream: 25% equity over 210,240 blocks (~4 years)</li>
              <li>• Automatic cliff periods via start-block delay</li>
              <li>• If co-founder leaves, they keep vested portion only</li>
              <li>• Transparent, trustless, no legal disputes</li>
            </ul>
          </InfoCard>

          <InfoCard title="Freelance Contracts" variant="success">
            <p className="text-sm text-foreground mb-2">
              <strong>Scenario:</strong> 3-month freelance project at $15k
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Create stream: 15k sBTC over 12,960 blocks (~90 days)</li>
              <li>• Freelancer has guaranteed cash flow</li>
              <li>• Client can cancel if quality issues arise</li>
              <li>• Both parties protected by smart contract</li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>
    </DocsSection>
  );
}
