"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { HelpCircle, Users, Shield, Code2, TrendingUp, Zap } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function FAQ() {
  return (
    <DocsSection
      title="Frequently Asked Questions"
      description="Comprehensive answers to all your questions about BitPay"
      badge="Complete FAQ"
    >
      <SubSection title="Category 1: Novice & User Questions">
        <div className="space-y-4">
          <InfoCard title="Q1: I don't get it. Why wouldn't I just use Venmo or my bank?" variant="info">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground">
                  <strong>A:</strong> Great question! Venmo and banks are for simple, one-time payments. BitPay is for ongoing financial relationships. It's the difference between buying a DVD (lump sum) and having a Netflix subscription (a continuous stream). BitPay is programmable money, automatically executing a payment plan without you needing to remember to send money every day.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q2: Is my money safe in this smart contract thing?" variant="success">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground">
                  <strong>A:</strong> This is built on Stacks and Bitcoin, two of the most secure networks in the world. The code that manages the money (the smart contract) is public and transparent for anyone to audit. Once the rules of the stream are set, not even we, the creators, can change them or take your money. It's locked by math and code.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q3: What happens if the internet goes down or the BitPay website disappears?" variant="warning">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground">
                  <strong>A:</strong> The website is just a window to view your streams. The actual streams themselves live on the blockchain, which is a network of thousands of computers worldwide. Even if our website goes offline forever, your stream continues. You could use a different app that reads the same blockchain, or even interact with the contract directly to withdraw your money, because the contract is permanent and independent.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q4: Do you take a fee?" variant="pink">
            <p className="text-sm text-foreground">
              <strong>A:</strong> In this initial version built for the hackathon, there are no fees. In a future real-world version, a very small fee might be added to support development and maintenance, but this would be made extremely clear upfront.
            </p>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Category 2: Judge & Technical Questions">
        <div className="space-y-4">
          <InfoCard title="Q5: Why build this on Stacks and not another chain like Ethereum?" variant="teal">
            <p className="text-sm text-foreground">
              <strong>A:</strong> To "unlock the Bitcoin economy." Bitcoin is the most secure store of value but lacks programmability. Stacks and sBTC allow us to build powerful applications while settling on Bitcoin. This is the future of Bitcoin DeFi.
            </p>
          </InfoCard>

          <InfoCard title="Q6: Explain your contract's security model. How did you prevent common vulnerabilities like reentrancy or integer overflows?" variant="success">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> This is a critical point. We leveraged AI for productivity but prioritized security through manual review.
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Reentrancy:</h4>
                <p className="text-muted-foreground">
                  Clarity is a decidable language, meaning it's impossible to have unknown reentrancy attacks. The language itself prevents this class of bugs. We still follow the checks-effects-interactions pattern as a best practice.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Integer Overflows/Underflows:</h4>
                <p className="text-muted-foreground">
                  We used Clarity's built-in safe math functions (+, -, *) which automatically return none on overflow instead of wrapping. We then handle these none responses explicitly with unwrap! or try! to safely halt execution.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Testing:</h4>
                <p className="text-muted-foreground">
                  We wrote extensive unit tests covering edge cases (e.g., withdrawing before start time, after end time, cancelling empty streams) using the clarinet testing framework.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q7: Your vesting calculation is based on block height. Isn't that unreliable due to variable block times?" variant="warning">
            <p className="text-sm text-foreground mb-2">
              <strong>A:</strong> You are correct that block time is variable. For a hackathon demo on testnet, this is an acceptable simplification to show the core concept. We acknowledge this.
            </p>
            <p className="text-sm text-muted-foreground">
              In a production environment, we would pivot to using a timestamp-based oracle (like the upcoming Stacks Nakamoto upgrade's proof-of-transfer time) or a decentralized oracle network like Chainlink to achieve more precise time-based vesting. The core architectural pattern of the contract remains the same.
            </p>
          </InfoCard>

          <InfoCard title="Q8: How did you specifically use AI ('Vibe Coding') in this project?" variant="info">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> We used AI as a powerful copilot, not a replacement for thinking. Key examples:
            </p>
            <ul className="space-y-2 text-sm text-foreground ml-4">
              <li>• <strong>Clarity Boilerplate:</strong> "Generate a Clarity smart contract with a map for storing streams and public functions for create, withdraw, and cancel."</li>
              <li>• <strong>Algorithm Drafting:</strong> "Write a function that calculates a linear vesting amount based on start block, end block, and current block." We then refined the output for security and gas efficiency.</li>
              <li>• <strong>Front-End Help:</strong> "Generate a React component using stacks.js that connects a wallet and displays a list of transactions."</li>
              <li>• <strong>Documentation:</strong> "Help me write a clear README section explaining how sBTC integrates with our contract."</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              For each AI-generated output, we meticulously reviewed, tested, and refactored the code. This process is documented in our VIBE_CODING.md file.
            </p>
          </InfoCard>

          <InfoCard title="Q9: What is the biggest technical challenge you faced?" variant="pink">
            <p className="text-sm text-foreground">
              <strong>A:</strong> The biggest challenge was orchestrating the flow of sBTC between the user's wallet, our contract vault, and the recipient. Understanding the sBTC system's APIs and ensuring our contract was the only entity authorized to move funds from its own vault required careful design. We solved this by creating a clear separation of concerns in our contract logic and writing extensive tests for the transfer functions.
            </p>
          </InfoCard>

          <InfoCard title="Q10: This is similar to Sablier/Superfluid. What makes BitPay unique?" variant="teal">
            <p className="text-sm text-foreground mb-2">
              <strong>A:</strong> The core concept of streaming money is indeed inspired by these pioneers. However, BitPay's uniqueness is its deep integration with Bitcoin via sBTC.
            </p>
            <p className="text-sm text-muted-foreground">
              We are not building on Ethereum with wrapped assets. We are building a native Bitcoin DeFi primitive. This aligns with the Stacks ecosystem's mission and offers a fundamentally different security and value proposition by being settled on the Bitcoin base layer.
            </p>
          </InfoCard>

          <InfoCard title="Q11: What are the next steps for this project if you were to continue?" variant="success">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> Our roadmap would include:
            </p>
            <div className="space-y-2 text-sm">
              <div className="border-l-4 border-green-500 pl-3">
                <strong>1. Nakamoto Upgrade:</strong> Migrating to use the upgraded Stacks chain with faster blocks and proof-of-transfer time for accurate vesting.
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <strong>2. Multi-Asset Support:</strong> Supporting streams of SIP-010 tokens (e.g., stablecoins) alongside sBTC.
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <strong>3. Advanced Features:</strong> "Delta streams" for fluctuating payments, streaming to multiple recipients, and a subgraph for faster front-end indexing.
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <strong>4. Audits:</strong> A full professional security audit before any mainnet launch.
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Category 3: Security & Audits">
        <div className="space-y-4">
          <InfoCard title="Q1: This handles real value. What is your security process beyond the hackathon?" variant="warning">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> Security is our paramount concern. Our approach is multi-layered:
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Formal Verification:</h4>
                <p className="text-muted-foreground">
                  Clarity's nature allows for formal verification. Our next step is to formally verify the core vesting logic to mathematically prove its correctness against our specification.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Professional Audit:</h4>
                <p className="text-muted-foreground">
                  Immediately following the hackathon, we will engage a top-tier smart contract auditing firm (e.g., Trail of Bits, Least Authority) for a full, professional audit. No value-bearing contract will be deployed to mainnet until this audit is complete and all findings are addressed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Bug Bounty Program:</h4>
                <p className="text-muted-foreground">
                  Upon a secure mainnet release, we will institute a public bug bounty program to incentivize white-hat hackers to stress-test the system continuously.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Time-Locked Upgrades:</h4>
                <p className="text-muted-foreground">
                  Any future upgrades to the core protocol will be managed via a time-locked multisig contract, giving the community a window to review changes before they go live.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q2: You use block height for vesting. This is inaccurate for real-world use. What is your production solution?" variant="info">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> You are absolutely right. For production, reliance on block height is unacceptable for precise time-based agreements like payroll.
            </p>
            <div className="space-y-3 text-sm mb-4">
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-semibold mb-1">Short-Term Plan (Post-Nakamoto):</h4>
                <p className="text-muted-foreground">
                  We will immediately integrate with the Stacks Nakamoto upgrade's proof-of-transfer time. This provides a secure, Bitcoin-backed timestamp that is accurate enough for daily/weekly vesting schedules.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-semibold mb-1">Long-Term Plan:</h4>
                <p className="text-muted-foreground">
                  For second or minute-level precision (e.g., for streaming video subscriptions), we will integrate a decentralized oracle network like Chainlink. The oracle will provide a trusted time feed, and our contract will use this signed data to calculate vesting. The architecture is designed to be agnostic to the time source.
                </p>
              </div>
            </div>
            <CodeBlock
              language="clarity"
              title="Agnostic Time Architecture"
              code={`(define-private (get-current-time)
  block-height  ;; Currently uses block height
  ;; Can be replaced with:
  ;; (contract-call? .nakamoto-time get-timestamp)
  ;; or (contract-call? .chainlink-oracle get-time)
)

(define-read-only (calculate-vested-amount (stream-id uint))
  (let ((current-time (get-current-time))) ;; Use abstracted function
    ;; ... calculate based on current-time ...
  )
)`}
            />
          </InfoCard>

          <InfoCard title="Q3: How do you handle the inherent risks of sBTC, like its two-way peg mechanism?" variant="warning">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> This is a crucial ecosystem-level risk. Our responsibility is to:
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">1. User Education:</h4>
                <p className="text-muted-foreground">
                  Clearly disclaimer that sBTC derives its security from the underlying sBTC protocol. We will provide educational material on our platform explaining the risks of the peg mechanism.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">2. Circuit Breakers:</h4>
                <p className="text-muted-foreground">
                  Implement monitoring for sBTC peg stability. In a worst-case scenario (e.g., a peg outage is declared), we can pause new stream creation to protect users.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">3. Non-Custodial Design:</h4>
                <p className="text-muted-foreground">
                  Users always retain ownership of their sBTC; it is simply locked in our contract vault. This minimizes counterparty risk from us, the application developers.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Category 4: Business Model & Sustainability">
        <div className="space-y-4">
          <InfoCard title="Q4: What is your business model? How will this project be sustainable?" variant="pink">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> We believe in sustainable, value-aligned growth, not rent-seeking.
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Protocol Fee:</h4>
                <p className="text-muted-foreground">
                  A minimal, fixed fee (e.g., 0.1%) could be applied on stream creation or withdrawal. This fee would be governed by a future BitPay DAO.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Treasury Diversification:</h4>
                <p className="text-muted-foreground">
                  Fee revenue would be directed to a treasury, managed by the DAO, to fund ongoing development, audits, and marketing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Value Capture:</h4>
                <p className="text-muted-foreground">
                  The primary value is in the protocol's usage and the ecosystem it builds. A sustainable fee ensures the protocol's longevity without being a burden to users.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q5: What is your go-to-market strategy? Who is your first target customer?" variant="teal">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> We will pursue a focused, bottom-up strategy:
            </p>
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-brand-teal pl-3">
                <h4 className="font-semibold mb-1">Phase 1 (Early Adopters):</h4>
                <p className="text-muted-foreground">
                  Target the Stacks and Bitcoin startup ecosystem. These companies are already comfortable with crypto and have an immediate need for transparent, on-chain vesting schedules for their team and investors. We will onboard them directly.
                </p>
              </div>
              <div className="border-l-4 border-brand-teal pl-3">
                <h4 className="font-semibold mb-1">Phase 2 (Expansion):</h4>
                <p className="text-muted-foreground">
                  Develop a simple API/SDK and no-code front-end for Web2 freelancer platforms (e.g., Upwork, Fiverr) to offer "streamed payments" as a secure option for their clients.
                </p>
              </div>
              <div className="border-l-4 border-brand-teal pl-3">
                <h4 className="font-semibold mb-1">Phase 3 (Mass Adoption):</h4>
                <p className="text-muted-foreground">
                  Partner with Bitcoin-native payroll providers to become the settlement layer for real-time salary payments.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Category 5: Technical Architecture & Scalability">
        <div className="space-y-4">
          <InfoCard title="Q6: How will you handle scalability and high gas fees if usage grows?" variant="success">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> Our architecture is forward-looking.
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Stacks Nakamoto Upgrade:</h4>
                <p className="text-muted-foreground">
                  This is our primary scaling solution. The upgrade brings sub-10 second block times and dramatically lower costs, making micro-streams economically feasible.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Layer-3 Solutions:</h4>
                <p className="text-muted-foreground">
                  We are exploring L3 scaling solutions like subnets or supercharged state channels specifically for streaming. Thousands of streaming transactions could be batched into a single L2 transaction, reducing costs by orders of magnitude.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Off-Chain Computation:</h4>
                <p className="text-muted-foreground">
                  The vesting calculation itself is a pure function. We can compute it off-chain for the UI and only use the blockchain for the immutable settlement layer (the actual transfers), minimizing on-chain operations.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q7: Is your contract upgradeable? How will you fix bugs or add features?" variant="info">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> We follow best practices for upgradeability without compromising decentralization.
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Data vs. Logic Separation:</h4>
                <p className="text-muted-foreground">
                  Our core design separates data (the stream details) from business logic (the functions that act on them). This allows for a more straightforward migration path if a new, audited version of the logic contract is needed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Proxy Patterns:</h4>
                <p className="text-muted-foreground">
                  We are evaluating secure proxy patterns (like the "proxy diamond" pattern) that would allow for controlled, community-governed upgrades. However, this introduces complexity and must be implemented with extreme caution and expert auditing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Transparency:</h4>
                <p className="text-muted-foreground">
                  Any upgrade process will be fully transparent and governed by the community DAO, not a centralized team.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Q8: How will you ensure a good user experience for non-technical users?" variant="warning">
            <p className="text-sm text-foreground mb-3">
              <strong>A:</strong> UX is critical for adoption. Our strategy is to abstract away the complexity:
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Fiat On-Ramps:</h4>
                <p className="text-muted-foreground">
                  Integrate providers like Lemon Squeezy or Stripe to allow users to fund streams with a credit card. The conversion to sBTC happens seamlessly in the background.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Gas Abstraction:</h4>
                <p className="text-muted-foreground">
                  Use sponsored transactions (where BitPay pays the gas fee for the user's first few transactions) or account abstraction to hide the concept of "gas" entirely.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Stream Templates:</h4>
                <p className="text-muted-foreground">
                  Pre-built templates for common use cases: "30-day freelancer contract," "4-year vesting schedule," "Weekly subscription."
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Robust Support & Education:</h4>
                <p className="text-muted-foreground">
                  A comprehensive knowledge base, tutorial videos, and real customer support.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Revenue Model Deep Dive">
        <InfoCard title="Multi-Layered Revenue Strategy" variant="pink">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-pink" />
                Layer 1: Protocol Fee (The Foundation)
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <strong>Mechanism:</strong> A very small fee (0.1% - 0.5%) applied on the total-amount of a stream upon creation. This is taken from the deposited sBTC.
                </p>
                <p className="text-foreground">
                  <strong>Key Design:</strong> The fee is burned. Yes, burned.
                </p>
                <div className="bg-muted p-3 rounded mt-2">
                  <p className="text-xs font-semibold mb-2">Why Burn It?</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• <strong>Value Accrual:</strong> Burning the fee creates deflationary pressure on the potential future BitPay governance token. Scarcity drives value.</li>
                    <li>• <strong>Regulatory Clarity:</strong> It avoids the legal complexity of the protocol being seen as a profit-making security. It's a utility fee that is destroyed.</li>
                    <li>• <strong>Alignment:</strong> It aligns the protocol's success with the community's success; the more the protocol is used, the more value is accrued to token holders, not to a corporate treasury.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-teal" />
                Layer 2: Premium SaaS Features (The Business)
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <strong>Target:</strong> Businesses, startups, DAOs. They need more than the raw protocol.
                </p>
                <p className="text-foreground mb-2"><strong>Features:</strong></p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Dashboard & Analytics:</strong> Advanced analytics on cash flow, employee vesting schedules, and tax reporting (Form 1099 equivalent).</li>
                  <li>• <strong>Multi-Stream Management:</strong> API endpoints to create 100 streams for 100 employees at once.</li>
                  <li>• <strong>Compliance & KYC:</strong> Optional integrated KYC checks for regulated entities.</li>
                </ul>
                <p className="text-foreground mt-2">
                  <strong>Pricing:</strong> A flat monthly subscription fee ($99-$499/month) for access to the premium web app and API.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Layer 3: Treasury & Ecosystem Fund (The Flywheel)
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <strong>Mechanism:</strong> If you have a token, you can have a treasury. The treasury is funded by a small portion of unburned fees or initial token allocation.
                </p>
                <p className="text-foreground mb-2"><strong>Use of Funds:</strong></p>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Grants:</strong> Fund developers to build amazing tools on top of your SDK.</li>
                  <li>• <strong>Liquidity Provision:</strong> Provide liquidity for "Stream NFT" marketplaces to make them more efficient.</li>
                  <li>• <strong>Gas Sponsorship:</strong> Use the treasury to sponsor transaction fees for new users, onboarding them seamlessly.</li>
                </ul>
                <div className="bg-muted p-3 rounded mt-2">
                  <p className="text-xs text-foreground">
                    <strong>This creates a powerful flywheel:</strong> more usage → more fees → more treasury funds → better ecosystem → more usage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Still Have Questions?">
        <InfoCard title="Get in Touch" variant="success">
          <p className="text-sm text-foreground mb-3">
            Can't find the answer you're looking for? Our community and support team are here to help.
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <a href="#" className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors">
              <div className="font-semibold mb-1">Discord Community</div>
              <div className="text-xs text-muted-foreground">
                Join our Discord for real-time support
              </div>
            </a>
            <a href="#" className="bg-muted hover:bg-muted/80 p-3 rounded-lg transition-colors">
              <div className="font-semibold mb-1">Email Support</div>
              <div className="text-xs text-muted-foreground">support@bitpay.finance</div>
            </a>
          </div>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
