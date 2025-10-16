"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { ShoppingBag, Tag, TrendingUp, ArrowRightLeft, Shield } from "lucide-react";
import { CodeBlock } from "../CodeBlock";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Marketplace() {
  return (
    <DocsSection
      title="Marketplace"
      description="Trade future cash flows with Stream NFTs"
      badge="Advanced"
    >
      <SubSection title="What is the BitPay Marketplace?">
        <InfoCard title="Tokenizing Future Cash Flows" variant="pink">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay's marketplace enables trading of stream positions through NFTs. When
            a stream is created, two NFTs are minted:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-brand-pink/10 p-4 rounded-lg border border-brand-pink/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-pink" />
                Claim NFT (Recipient)
              </h4>
              <p className="text-sm text-foreground mb-2">
                Represents the right to claim vested funds from a stream.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Soul-bound (non-transferable)</div>
                <div>• Proves stream ownership</div>
                <div>• Required for withdrawals</div>
              </div>
            </div>

            <div className="bg-brand-teal/10 p-4 rounded-lg border border-brand-teal/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-teal" />
                Obligation NFT (Sender)
              </h4>
              <p className="text-sm text-foreground mb-2">
                Represents the obligation to fund a stream.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Transferable & tradeable</div>
                <div>• Can be listed on marketplace</div>
                <div>• Enables obligation trading</div>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Why Trade Stream NFTs?">
        <div className="space-y-4">
          <InfoCard title="Liquidity for Future Earnings" variant="teal">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  <strong>For Recipients:</strong> Need money now instead of waiting?
                  Sell your claim NFT at a discount. Buyers get future cash flow, you
                  get immediate liquidity.
                </p>
                <div className="bg-muted p-3 rounded text-xs">
                  <strong>Example:</strong> You have a stream worth 10 BTC over 1 year,
                  but need 8 BTC now. List your claim NFT for 8 BTC, buyer gets the
                  full 10 BTC stream.
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Transfer Obligations" variant="pink">
            <div className="flex items-start gap-3">
              <ArrowRightLeft className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  <strong>For Senders:</strong> Need to transfer a payment obligation?
                  Sell your obligation NFT. The buyer becomes responsible for funding
                  the stream.
                </p>
                <div className="bg-muted p-3 rounded text-xs">
                  <strong>Example:</strong> Company A acquires Company B. Company B has
                  employee vesting streams. Company A buys the obligation NFTs to take
                  over the payment obligations.
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Investment Opportunities" variant="success">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>For Traders:</strong> Buy discounted future cash flows and
                  hold until maturity. Like bonds, but for Bitcoin streams. The
                  discount represents your yield.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="How to List an NFT">
        <InfoCard title="Listing Process" variant="info">
          <div className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              Only obligation NFTs can be listed on the marketplace. Claim NFTs are
              soul-bound to protect recipients.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Verify NFT Ownership</h4>
                  <p className="text-muted-foreground">
                    Connect wallet and ensure you own the obligation NFT for the stream
                    you want to sell.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Set Listing Price</h4>
                  <p className="text-muted-foreground">
                    Determine your asking price in sBTC. Consider the stream's remaining
                    value and market demand.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Create Listing</h4>
                  <p className="text-muted-foreground">
                    Call the list-obligation-nft function. Your NFT remains in your
                    wallet until sold.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Wait for Buyer</h4>
                  <p className="text-muted-foreground">
                    Your listing appears on the marketplace. Buyers can purchase
                    instantly at your price.
                  </p>
                </div>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              title="List Obligation NFT"
              code={`import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';

async function listObligationNFT(streamId: number, priceInSats: number) {
  await openContractCall({
    contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    contractName: 'bitpay-marketplace',
    functionName: 'list-obligation-nft',
    functionArgs: [
      uintCV(streamId),
      uintCV(priceInSats),
    ],
    onFinish: (data) => {
      console.log('Listed:', data.txId);
    },
  });
}`}
            />
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="How to Buy an NFT">
        <InfoCard title="Purchase Process" variant="teal">
          <div className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              Browse active listings on the marketplace and purchase instantly:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Browse Marketplace</h4>
                  <p className="text-muted-foreground">
                    View all active listings with stream details, remaining value, and
                    asking price.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Analyze the Deal</h4>
                  <p className="text-muted-foreground">
                    Calculate your potential yield: (stream_value - purchase_price) /
                    purchase_price
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">Execute Purchase</h4>
                  <p className="text-muted-foreground">
                    Call buy-obligation-nft. Payment is sent to seller, NFT is
                    transferred to you atomically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </span>
                <div className="text-sm">
                  <h4 className="font-semibold mb-1">You're Now the Sender</h4>
                  <p className="text-muted-foreground">
                    You now own the stream obligation. You can cancel it (with fee) or
                    hold until completion.
                  </p>
                </div>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              title="Buy Obligation NFT"
              code={`import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';

async function buyObligationNFT(streamId: number) {
  // First, ensure you have enough sBTC for the purchase price
  const listing = await getListingDetails(streamId);

  await openContractCall({
    contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    contractName: 'bitpay-marketplace',
    functionName: 'buy-obligation-nft',
    functionArgs: [uintCV(streamId)],
    onFinish: (data) => {
      console.log('Purchase complete:', data.txId);
      console.log('You now own stream obligation', streamId);
    },
  });
}`}
            />
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Pricing Strategies">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="For Sellers" variant="pink">
            <h4 className="font-semibold text-sm mb-2">How to Price Your Listing</h4>
            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-brand-pink">•</span>
                <span>
                  <strong>Remaining Value:</strong> Calculate total unvested amount in
                  stream
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink">•</span>
                <span>
                  <strong>Time to Maturity:</strong> Longer duration = higher discount
                  expected
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink">•</span>
                <span>
                  <strong>Urgency:</strong> Need money fast? Price lower for quick sale
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-pink">•</span>
                <span>
                  <strong>Market Rates:</strong> Check similar listings for competitive
                  pricing
                </span>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="For Buyers" variant="teal">
            <h4 className="font-semibold text-sm mb-2">Evaluating Opportunities</h4>
            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-brand-teal">•</span>
                <span>
                  <strong>Yield Calculation:</strong> (Future Value - Price) / Price ×
                  100%
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-teal">•</span>
                <span>
                  <strong>Risk Assessment:</strong> Can sender cancel? What's the
                  cancellation risk?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-teal">•</span>
                <span>
                  <strong>Time Value:</strong> Is the yield worth locking funds for
                  duration?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-teal">•</span>
                <span>
                  <strong>Liquidity:</strong> Can you resell easily if needed?
                </span>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Smart Contract Functions">
        <InfoCard title="Marketplace Contract Interface" variant="info">
          <CodeBlock
            language="clarity"
            title="bitpay-marketplace.clar - Core Functions"
            code={`;; List an obligation NFT for sale
(define-public (list-obligation-nft
    (stream-id uint)
    (price uint)
  )
  (begin
    ;; Verify ownership
    (asserts! (is-eq (some tx-sender)
        (contract-call? .bitpay-obligation-nft get-owner stream-id))
        ERR_NOT_OWNER
    )

    ;; Create listing
    (map-set listings stream-id {
      seller: tx-sender,
      price: price,
      listed-at: stacks-block-height,
    })

    (ok true)
  )
)

;; Buy a listed obligation NFT
(define-public (buy-obligation-nft (stream-id uint))
  (let (
      (listing (unwrap! (map-get? listings stream-id) ERR_NOT_LISTED))
    )
    (begin
      ;; Transfer payment to seller
      (try! (contract-call? .bitpay-sbtc-helper transfer-sbtc
          (get price listing)
          tx-sender
          (get seller listing)
      ))

      ;; Transfer NFT to buyer
      (try! (contract-call? .bitpay-obligation-nft transfer
          stream-id
          (get seller listing)
          tx-sender
      ))

      ;; Update stream sender in core contract
      (try! (contract-call? .bitpay-core update-stream-sender
          stream-id
          tx-sender
      ))

      ;; Remove listing
      (map-delete listings stream-id)

      (print {
        event: "nft-sold",
        stream-id: stream-id,
        seller: (get seller listing),
        buyer: tx-sender,
        price: (get price listing),
      })

      (ok true)
    )
  )
)

;; Cancel a listing
(define-public (cancel-listing (stream-id uint))
  (let (
      (listing (unwrap! (map-get? listings stream-id) ERR_NOT_LISTED))
    )
    (begin
      ;; Only seller can cancel
      (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)

      (map-delete listings stream-id)
      (ok true)
    )
  )
)

;; Update listing price
(define-public (update-listing-price
    (stream-id uint)
    (new-price uint)
  )
  (let (
      (listing (unwrap! (map-get? listings stream-id) ERR_NOT_LISTED))
    )
    (begin
      ;; Only seller can update
      (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)

      (map-set listings stream-id
        (merge listing { price: new-price })
      )

      (ok true)
    )
  )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="Security Considerations">
        <InfoCard title="Marketplace Safety" variant="warning">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Atomic Transactions</h4>
                <p className="text-muted-foreground">
                  All trades execute atomically. Either both payment and NFT transfer
                  succeed, or the entire transaction fails. No partial executions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Ownership Verification</h4>
                <p className="text-muted-foreground">
                  Smart contract verifies NFT ownership before allowing listings. Only
                  actual owners can list.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">No Custody</h4>
                <p className="text-muted-foreground">
                  NFTs remain in seller's wallet until sold. Marketplace never holds
                  custody of assets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Cancellation Risk</h4>
                <p className="text-muted-foreground">
                  Buyers should understand: Original sender can still cancel stream
                  (with 1% fee). This affects the value of obligation NFTs.
                </p>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Start Trading">
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/marketplace">
            <InfoCard title="Browse Marketplace" variant="teal">
              <p className="text-sm text-foreground mb-3">
                Explore active listings and find investment opportunities
              </p>
              <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Marketplace
              </Button>
            </InfoCard>
          </Link>

          <Link href="/dashboard">
            <InfoCard title="List Your NFTs" variant="pink">
              <p className="text-sm text-foreground mb-3">
                Turn your future cash flows into immediate liquidity
              </p>
              <Button variant="outline" className="w-full">
                <Tag className="mr-2 h-4 w-4" />
                My NFTs
              </Button>
            </InfoCard>
          </Link>
        </div>
      </SubSection>
    </DocsSection>
  );
}
