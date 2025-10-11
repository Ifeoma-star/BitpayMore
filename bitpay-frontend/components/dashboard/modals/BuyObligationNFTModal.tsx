"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart, Info, Calculator, TrendingUp, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MarketplaceListing {
  streamId: string;
  seller: string;
  price: number;
  discount: number;
  totalAmount: number;
  vestedAmount: number;
  remainingAmount: number;
  endBlock: number;
  daysRemaining: number;
  apr: number;
  listed: string;
}

interface BuyObligationNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketplaceListing;
  onSuccess?: () => void;
}

export function BuyObligationNFTModal({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: BuyObligationNFTModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const profit = listing.totalAmount - listing.price;
  const roi = (profit / listing.price) * 100;

  const handleBuy = async () => {
    if (!agreedToTerms) {
      toast.error("Please review and accept the terms");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call marketplace smart contract to buy NFT
      // marketplace.buy-nft(stream-id) with payment
      console.log("Buying NFT:", {
        streamId: listing.streamId,
        price: listing.price * 1_000_000, // Convert to micro units
        seller: listing.seller,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Purchase successful!", {
        description: `You now own the obligation NFT for Stream #${listing.streamId}`,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Error buying NFT:", err);
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-pink" />
            Purchase Obligation NFT
          </DialogTitle>
          <DialogDescription>
            Review the details before completing your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Listing Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Stream #{listing.streamId}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {listing.seller.slice(0, 12)}...{listing.seller.slice(-8)}
              </p>
            </div>
            <Badge className="bg-brand-pink text-white text-lg px-3 py-1">
              {listing.discount.toFixed(1)}% OFF
            </Badge>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="p-4 bg-brand-pink/5 border border-brand-pink/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-brand-pink" />
              <h4 className="font-semibold text-brand-pink">Investment Summary</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchase Price:</span>
                <span className="font-bold text-brand-pink">{listing.price.toFixed(2)} sBTC</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Stream Value:</span>
                <span className="line-through text-muted-foreground">
                  {listing.totalAmount.toFixed(2)} sBTC
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You Will Receive:</span>
                <span className="font-bold">{listing.totalAmount.toFixed(2)} sBTC</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Profit:</span>
                <span className="font-bold text-green-600">
                  +{profit.toFixed(2)} sBTC ({roi.toFixed(1)}% ROI)
                </span>
              </div>
            </div>
          </div>

          {/* Investment Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Annual Return</span>
              </div>
              <p className="text-xl font-bold text-green-600">{listing.apr.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">APR</p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-brand-teal" />
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <p className="text-xl font-bold">{listing.daysRemaining}</p>
              <p className="text-xs text-muted-foreground">days remaining</p>
            </div>
          </div>

          {/* Stream Details */}
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            <h4 className="font-semibold mb-2">Stream Details</h4>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Stream Amount:</span>
              <span className="font-medium">{listing.totalAmount.toFixed(2)} sBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Vested:</span>
              <span className="font-medium">{listing.vestedAmount.toFixed(2)} sBTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining to Vest:</span>
              <span className="font-medium text-brand-teal">
                {listing.remainingAmount.toFixed(2)} sBTC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Block:</span>
              <span className="font-medium font-mono">{listing.endBlock}</span>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4 text-brand-teal" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">What Happens Next</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>You pay {listing.price.toFixed(2)} sBTC to purchase the obligation NFT</li>
                <li>The NFT ownership transfers to you immediately</li>
                <li>You can withdraw vested amounts as the stream continues</li>
                <li>You receive the full {listing.totalAmount.toFixed(2)} sBTC over time</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm cursor-pointer">
              <span className="font-medium">I understand and accept the terms</span>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Payment streams vest linearly over time</li>
                <li>• The seller cannot cancel after you purchase</li>
                <li>• You become the new recipient of the stream</li>
                <li>• Returns are dependent on stream completion</li>
              </ul>
            </label>
          </div>

          {/* Investment Highlight */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800 dark:text-green-400">Good Investment</h4>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {listing.apr > 15 && "High APR! "}
              {listing.discount > 10 && "Great discount! "}
              This listing offers attractive returns for buyers looking for passive income.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            disabled={isLoading || !agreedToTerms}
            className="bg-brand-pink hover:bg-brand-pink/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy for {listing.price.toFixed(2)} sBTC
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
