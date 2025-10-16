"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Shield, Lock, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function SecurityBestPractices() {
  return (
    <DocsSection
      title="Security & Best Practices"
      description="Understanding BitPay's security model and best practices"
      badge="Security"
    >
      <SubSection title="Security Philosophy">
        <InfoCard title="Multi-Layered Security Approach" variant="info">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay is built with security as the highest priority. Our multi-layered
            approach combines Bitcoin's battle-tested security with Clarity's
            decidability and rigorous testing practices.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-muted p-3 rounded-lg text-center">
              <Shield className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-sm">Bitcoin Security</div>
              <div className="text-xs text-muted-foreground">
                Secured by BTC PoW
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <Lock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-sm">Decidable Contracts</div>
              <div className="text-xs text-muted-foreground">
                Provably correct code
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-sm">Audited Code</div>
              <div className="text-xs text-muted-foreground">
                Professional audits
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Smart Contract Security">
        <div className="space-y-4">
          <InfoCard title="1. Decidability - The Clarity Advantage" variant="success">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  Unlike Solidity and other Turing-complete languages, Clarity is
                  decidable. This means you can prove what the code will do before
                  execution.
                </p>
                <div className="bg-muted p-3 rounded text-xs space-y-2">
                  <div>
                    <strong>What this means:</strong>
                  </div>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• No reentrancy attacks possible</li>
                    <li>• No infinite loops or gas griefing</li>
                    <li>• Static analysis can catch all bugs</li>
                    <li>• Formal verification is practical</li>
                  </ul>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="2. Safe Math by Default" variant="teal">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-3">
                  Clarity automatically checks for overflow/underflow. No need for
                  SafeMath libraries.
                </p>
                <CodeBlock
                  language="clarity"
                  title="Automatic Overflow Protection"
                  code={`;; This would overflow in Solidity without SafeMath
;; In Clarity, it automatically returns an error
(define-public (unsafe-add (a uint) (b uint))
    (ok (+ a b))  ;; Clarity checks for overflow automatically
)

;; If a + b > MAX_UINT, the function fails with an error
;; No silent wrapping or unexpected behavior`}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard title="3. No Hidden State" variant="pink">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  All contract state is explicitly defined in maps and data vars.
                  There's no implicit state or storage slots that can be manipulated.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground ml-4">
                  <li>• No delegatecall vulnerabilities</li>
                  <li>• No storage collision attacks</li>
                  <li>• Complete transparency of state</li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="4. Rigorous Access Control" variant="warning">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-3">
                  Every sensitive function has explicit permission checks:
                </p>
                <CodeBlock
                  language="clarity"
                  title="Access Control Pattern"
                  code={`;; Only recipient can withdraw
(define-public (withdraw-from-stream (stream-id uint))
    (let ((stream (unwrap! (map-get? streams stream-id) ERR_NOT_FOUND)))
        (begin
            (asserts! (is-eq tx-sender (get recipient stream))
                ERR_UNAUTHORIZED
            )
            ;; ... withdrawal logic
        )
    )
)

;; Only sender can cancel
(define-public (cancel-stream (stream-id uint))
    (let ((stream (unwrap! (map-get? streams stream-id) ERR_NOT_FOUND)))
        (begin
            (asserts! (is-eq tx-sender (get sender stream))
                ERR_UNAUTHORIZED
            )
            ;; ... cancellation logic
        )
    )
)`}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard title="5. Emergency Pause Mechanism" variant="info">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-3">
                  In case of a critical vulnerability, admins can pause the protocol
                  to prevent further damage.
                </p>
                <CodeBlock
                  language="clarity"
                  title="Circuit Breaker Pattern"
                  code={`;; Pause state
(define-data-var is-paused bool false)

;; Every public function checks pause state
(define-public (create-stream ...)
    (begin
        (try! (contract-call? .bitpay-access-control assert-not-paused))
        ;; ... rest of function
    )
)

;; Only admins can pause/unpause
(define-public (set-paused (paused bool))
    (begin
        (try! (contract-call? .bitpay-access-control assert-is-admin))
        (var-set is-paused paused)
        (ok true)
    )
)`}
                />
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Audit Status">
        <InfoCard title="Security Audits" variant="teal">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current Status</h4>
              <p className="text-sm text-muted-foreground">
                BitPay smart contracts are currently in active development and have
                undergone internal security reviews. Professional audits are planned
                before mainnet launch.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Planned Audits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-foreground">
                    <strong>Trail of Bits:</strong> Comprehensive smart contract audit
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-foreground">
                    <strong>Certora:</strong> Formal verification of core functions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-foreground">
                    <strong>Bug Bounty:</strong> Community-driven security testing
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs text-foreground">
                <strong>⚠️ Testnet Warning:</strong> BitPay is currently in beta on
                testnet. Do not use with mainnet funds until audits are complete and
                mainnet launch is announced.
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="User Best Practices">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="For Senders" variant="pink">
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Verify recipient address</strong> - Double-check addresses
                  before creating streams
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Start with small amounts</strong> - Test with small streams
                  first
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Understand cancellation</strong> - Remember the 1% fee on
                  cancellation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Monitor your streams</strong> - Keep track of active streams
                  in dashboard
                </span>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="For Recipients" variant="teal">
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Withdraw regularly</strong> - Don't leave large balances
                  unvested
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Understand cancellation risk</strong> - Senders can cancel
                  streams
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Secure your wallet</strong> - Use hardware wallet for large
                  amounts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Backup seed phrase</strong> - Never lose access to your funds
                </span>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Wallet Security">
        <InfoCard title="Protecting Your Wallet" variant="warning">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Use Hardware Wallets</h4>
                <p className="text-muted-foreground">
                  For significant amounts, use a hardware wallet like Ledger for
                  signing transactions. This keeps your private keys offline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Never Share Your Seed Phrase</h4>
                <p className="text-muted-foreground">
                  BitPay will never ask for your seed phrase. Anyone with your seed
                  phrase has full access to your funds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Beware of Phishing</h4>
                <p className="text-muted-foreground">
                  Always verify you're on the official BitPay website. Check the URL
                  and SSL certificate before connecting your wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Review Transactions</h4>
                <p className="text-muted-foreground">
                  Always review transaction details in your wallet before signing.
                  Verify contract address, function name, and parameters.
                </p>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Testing & Verification">
        <InfoCard title="Comprehensive Test Suite" variant="success">
          <p className="text-sm text-muted-foreground mb-3">
            All smart contracts are tested extensively with multiple test types:
          </p>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-green-500 pl-3">
              <strong>Unit Tests:</strong> Test individual functions in isolation
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <strong>Integration Tests:</strong> Test interactions between contracts
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <strong>Edge Case Tests:</strong> Test boundary conditions and unusual
              inputs
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <strong>Fuzz Testing:</strong> Automated testing with random inputs
            </div>
          </div>

          <div className="mt-4 bg-muted p-3 rounded text-xs">
            <strong>Test Coverage:</strong> We aim for 100% code coverage with
            comprehensive test scenarios covering all happy paths and error conditions.
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Responsible Disclosure">
        <InfoCard title="Security Bug Bounty Program" variant="pink">
          <p className="text-sm text-foreground mb-4">
            If you discover a security vulnerability in BitPay, please report it
            responsibly. We offer rewards for valid security findings.
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Scope</h4>
              <ul className="ml-4 space-y-1 text-muted-foreground">
                <li>• Smart contract vulnerabilities</li>
                <li>• Frontend security issues (XSS, CSRF, etc.)</li>
                <li>• API security flaws</li>
                <li>• Cryptographic issues</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Bounty Amounts</h4>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Critical</div>
                  <div className="font-bold text-foreground">Up to $50k</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">High</div>
                  <div className="font-bold text-foreground">Up to $10k</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Medium</div>
                  <div className="font-bold text-foreground">Up to $5k</div>
                </div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded">
              <strong>Report to:</strong>{" "}
              <a
                href="mailto:security@bitpay.finance"
                className="text-brand-pink hover:underline"
              >
                security@bitpay.finance
              </a>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Security Resources">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Documentation" variant="info">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Security Architecture Overview
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Audit Reports (Coming Soon)
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Bug Bounty Program Details
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Incident Response Plan
                </a>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Community" variant="success">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Security Discord Channel
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  GitHub Security Advisories
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Security Mailing List
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-teal hover:underline">
                  Responsible Disclosure Policy
                </a>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>
    </DocsSection>
  );
}
