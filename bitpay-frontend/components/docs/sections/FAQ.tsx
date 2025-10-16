"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { HelpCircle, Users, Shield, Code2, TrendingUp } from "lucide-react";

export function FAQ() {
  return (
    <DocsSection
      title="Frequently Asked Questions"
      description="Common questions about BitPay answered"
      badge="FAQ"
    >
      <SubSection title="General Questions">
        <div className="space-y-4">
          <InfoCard title="Why wouldn't I just use Venmo or my bank?" variant="info">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-3">
                  Great question! Venmo and banks are for simple, one-time payments.
                  BitPay is for ongoing financial relationships.
                </p>
                <p className="text-sm text-muted-foreground">
                  It's the difference between buying a DVD (lump sum) and having a
                  Netflix subscription (a continuous stream). BitPay is programmable
                  money, automatically executing a payment plan without you needing to
                  remember to send money every day. Plus, it's built on Bitcoin, giving
                  you true ownership and global accessibility.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Is my money safe in this smart contract?" variant="success">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  Yes! This is built on Stacks and Bitcoin, two of the most secure
                  networks in the world.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    • The code that manages the money (the smart contract) is public and
                    transparent for anyone to audit
                  </li>
                  <li>
                    • Once the rules of the stream are set, not even we (the creators)
                    can change them or take your money
                  </li>
                  <li>• It's locked by math and code, secured by Bitcoin's PoW</li>
                  <li>
                    • Professional audits are planned before mainnet launch
                  </li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="What happens if the BitPay website goes down?" variant="warning">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  The website is just a window to view your streams. The actual streams
                  themselves live on the blockchain.
                </p>
                <p className="text-sm text-muted-foreground">
                  The blockchain is a network of thousands of computers worldwide. Even
                  if our website goes offline forever, your stream continues. You could
                  use a different app that reads the same blockchain, or even interact
                  with the contract directly to withdraw your money, because the contract
                  is permanent and independent.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Do you take a fee?" variant="pink">
            <p className="text-sm text-foreground mb-2">
              <strong>Current Fees:</strong>
            </p>
            <ul className="text-sm space-y-2 text-foreground ml-4">
              <li>
                • <strong>Stream Creation:</strong> No fee
              </li>
              <li>
                • <strong>Withdrawals:</strong> No fee (only gas/transaction fees to
                Stacks)
              </li>
              <li>
                • <strong>Cancellation:</strong> 1% of unvested amount (goes to protocol
                treasury)
              </li>
            </ul>
            <div className="mt-3 text-xs text-muted-foreground bg-muted p-2 rounded">
              Future versions may include a very small optional creation fee (0.1-0.5%)
              to support ongoing development, but this would be governed by the community
              and made extremely clear upfront.
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Technical Questions">
        <div className="space-y-4">
          <InfoCard title="Why build on Stacks and not Ethereum?" variant="teal">
            <div className="flex items-start gap-3">
              <Code2 className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  To "unlock the Bitcoin economy." Bitcoin is the most secure store of
                  value but lacks programmability.
                </p>
                <p className="text-sm text-muted-foreground">
                  Stacks and sBTC allow us to build powerful applications while settling
                  on Bitcoin. This is the future of Bitcoin DeFi. We're not building on
                  Ethereum with wrapped assets - we're building a native Bitcoin DeFi
                  primitive with true Bitcoin security.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="How do you prevent smart contract vulnerabilities?" variant="success">
            <div className="space-y-3 text-sm">
              <p className="text-foreground">
                <strong>Multi-layered security approach:</strong>
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>
                  • <strong>Decidable Language:</strong> Clarity is decidable, meaning
                  it's impossible to have reentrancy attacks. The language itself
                  prevents this class of bugs
                </li>
                <li>
                  • <strong>Safe Math:</strong> Clarity's built-in arithmetic
                  automatically prevents overflow/underflow
                </li>
                <li>
                  • <strong>Extensive Testing:</strong> Comprehensive unit tests covering
                  all edge cases
                </li>
                <li>
                  • <strong>Manual Review:</strong> Every line of code is manually
                  reviewed, even AI-generated code
                </li>
                <li>
                  • <strong>Professional Audits:</strong> Planned before mainnet launch
                </li>
              </ul>
            </div>
          </InfoCard>

          <InfoCard title="Vesting is based on block height. Isn't that unreliable?" variant="warning">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  You are correct that block time is variable. For the current version,
                  this is an acceptable approximation.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Stacks blocks occur approximately every 10 minutes (tied to Bitcoin
                  blocks). For streams lasting days to years, small variations average
                  out.
                </p>
                <div className="bg-muted p-3 rounded text-xs">
                  <strong>Future Enhancement:</strong> We're architected to migrate to
                  timestamp-based vesting using Stacks' Nakamoto upgrade proof-of-transfer
                  time or decentralized oracle networks. The core vesting logic remains
                  the same - we just change the time source.
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="How is BitPay different from Sablier/Superfluid?" variant="pink">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-3">
                  While the core concept of streaming money is inspired by these
                  pioneers, BitPay's uniqueness is its deep integration with Bitcoin via
                  sBTC.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-brand-pink">✓</span>
                    <span className="text-foreground">
                      <strong>Bitcoin-Native:</strong> We're not building on Ethereum
                      with wrapped assets
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand-pink">✓</span>
                    <span className="text-foreground">
                      <strong>Bitcoin Security:</strong> Settled on the Bitcoin base
                      layer
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand-pink">✓</span>
                    <span className="text-foreground">
                      <strong>NFT Marketplace:</strong> Trade future cash flows as NFTs
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand-pink">✓</span>
                    <span className="text-foreground">
                      <strong>Decidable Contracts:</strong> Clarity's provably correct
                      code
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Use Cases & Features">
        <div className="space-y-4">
          <InfoCard title="What are the main use cases for BitPay?" variant="info">
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="border-l-4 border-brand-pink pl-3">
                <h4 className="font-semibold mb-1">Employee Compensation</h4>
                <p className="text-xs text-muted-foreground">
                  Salary streams, contractor payments, equity vesting
                </p>
              </div>
              <div className="border-l-4 border-brand-teal pl-3">
                <h4 className="font-semibold mb-1">Creator Support</h4>
                <p className="text-xs text-muted-foreground">
                  Continuous fan support, subscription-style payments
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <h4 className="font-semibold mb-1">Freelance Contracts</h4>
                <p className="text-xs text-muted-foreground">
                  Project-based payments with continuous cash flow
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="font-semibold mb-1">Startup Equity</h4>
                <p className="text-xs text-muted-foreground">
                  Token/equity vesting for co-founders and employees
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Can I cancel a stream?" variant="warning">
            <p className="text-sm text-foreground mb-2">
              <strong>Yes, but with conditions:</strong>
            </p>
            <ul className="text-sm space-y-2 text-foreground ml-4">
              <li>• Only the sender can cancel a stream they created</li>
              <li>• The recipient keeps all vested funds up to cancellation</li>
              <li>
                • A 1% cancellation fee is charged on the unvested amount (goes to
                treasury)
              </li>
              <li>• Sender receives the remaining unvested amount minus the fee</li>
            </ul>
            <div className="mt-3 bg-muted p-2 rounded text-xs">
              <strong>Example:</strong> Stream of 1M sats, 50% complete. Upon
              cancellation: Recipient keeps 500k vested. Of the 500k unvested, sender
              pays 5k fee and receives 495k back.
            </div>
          </InfoCard>

          <InfoCard title="What's the minimum/maximum stream amount?" variant="teal">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Minimum Amount:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  1,000 sats (0.00001 BTC)
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Maximum Amount:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  Unlimited (up to your balance)
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Minimum Duration:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  10 blocks (~100 minutes)
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Maximum Duration:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  Unlimited (years possible)
                </code>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Roadmap & Future">
        <InfoCard title="What are the next steps for BitPay?" variant="pink">
          <p className="text-sm text-muted-foreground mb-3">
            Our roadmap includes:
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-brand-pink pl-4">
              <h4 className="font-semibold text-sm mb-1">
                Phase 1: Security & Audits
              </h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Professional smart contract audits</li>
                <li>• Bug bounty program launch</li>
                <li>• Formal verification of core logic</li>
              </ul>
            </div>

            <div className="border-l-4 border-brand-teal pl-4">
              <h4 className="font-semibold text-sm mb-1">Phase 2: Enhanced Features</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Nakamoto upgrade integration (precise timestamps)</li>
                <li>• Multi-asset support (SIP-010 tokens, stablecoins)</li>
                <li>• Advanced streaming patterns (delta streams, cliff vesting)</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-sm mb-1">Phase 3: Ecosystem Growth</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• SDK for developers (JS, Python, Rust, Go)</li>
                <li>• Subgraph for faster indexing</li>
                <li>• Integration partnerships with wallets and apps</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-sm mb-1">
                Phase 4: Full Decentralization
              </h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• DAO governance implementation</li>
                <li>• Community-driven protocol upgrades</li>
                <li>• Token-based voting on proposals</li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Still Have Questions?">
        <InfoCard title="Get in Touch" variant="success">
          <p className="text-sm text-foreground mb-3">
            Can't find the answer you're looking for? Our community and support team
            are here to help.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <a
              href="#"
              className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors"
            >
              <div className="font-semibold mb-1">Discord Community</div>
              <div className="text-xs text-muted-foreground">
                Join our Discord for real-time support
              </div>
            </a>
            <a
              href="#"
              className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors"
            >
              <div className="font-semibold mb-1">Email Support</div>
              <div className="text-xs text-muted-foreground">
                support@bitpay.finance
              </div>
            </a>
            <a
              href="#"
              className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors"
            >
              <div className="font-semibold mb-1">GitHub Discussions</div>
              <div className="text-xs text-muted-foreground">
                Technical questions and feature requests
              </div>
            </a>
            <a
              href="#"
              className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors"
            >
              <div className="font-semibold mb-1">Twitter/X</div>
              <div className="text-xs text-muted-foreground">
                @BitPayFinance for updates
              </div>
            </a>
          </div>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
