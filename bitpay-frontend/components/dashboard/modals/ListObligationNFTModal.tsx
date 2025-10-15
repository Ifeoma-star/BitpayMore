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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Tag, Info, Calculator, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { microToDisplay } from "@/lib/contracts/config";

interface ListObligationNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableNFTs: any[];
  onSuccess?: () => void;
}

export function ListObligationNFTModal({
  isOpen,
  onClose,
  availableNFTs,
  onSuccess,
}: ListObligationNFTModalProps) {
  const [selectedNFT, setSelectedNFT] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get selected NFT details
  const nft = availableNFTs.find((n) => n.id.toString() === selectedNFT);
  const totalAmount = nft ? parseFloat(microToDisplay(nft.amount)) : 0;
  const vestedAmount = nft ? parseFloat(microToDisplay(nft.vestedAmount)) : 0;
  const remainingAmount = totalAmount - vestedAmount;
  const price = parseFloat(listingPrice) || 0;
  const discount = totalAmount > 0 ? ((totalAmount - price) / totalAmount) * 100 : 0;
  const immediateProceeds = price;

  // Calculate approximate APR for buyer
  const daysRemaining = nft ? Math.floor((Number(nft["end-block"]) - Number(nft["start-block"])) / 144) : 0;
  const profit = totalAmount - price;
  const apr = price > 0 && daysRemaining > 0 ? (profit / price) * (365 / daysRemaining) * 100 : 0;

  const handleList = async () => {
    setError("");

    // Validation
    if (!selectedNFT) {
      setError("Please select an obligation NFT");
      return;
    }

    if (!listingPrice || price <= 0) {
      setError("Please enter a valid listing price");
      return;
    }

    if (price >= totalAmount) {
      setError("Listing price must be less than the total stream amount");
      return;
    }

    if (price > remainingAmount) {
      setError("Listing price cannot exceed the remaining unvested amount");
      return;
    }

    if (discount < 1) {
      setError("Minimum discount of 1% required to attract buyers");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call marketplace smart contract to list NFT
      // marketplace.list-nft(stream-id, price)
      console.log("Listing NFT:", {
        streamId: selectedNFT,
        price: price * 1_000_000, // Convert to micro units
        discount: discount.toFixed(2),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("NFT listed successfully!", {
        description: `Your obligation NFT is now live on the marketplace`,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Error listing NFT:", err);
      setError("Failed to list NFT. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedNFT("");
    setListingPrice("");
    setError("");
    onClose();
  };

  // Preset discount options
  const applyDiscount = (discountPercent: number) => {
    if (nft) {
      const discountedPrice = totalAmount * (1 - discountPercent / 100);
      setListingPrice(discountedPrice.toFixed(8));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-4 w-4 text-brand-pink" />
            List Obligation NFT for Sale
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set your price and list your obligation NFT on the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Info Alert */}
          <Alert className="py-2">
            <Info className="h-3 w-3 text-brand-teal" />
            <AlertDescription className="text-xs">
              <p className="font-medium mb-0.5">Invoice Factoring</p>
              <p className="text-[11px]">
                Sell your future payment stream at a discount for immediate liquidity. Buyers earn
                returns by collecting the full stream amount over time.
              </p>
            </AlertDescription>
          </Alert>

          {/* Select NFT */}
          <div className="space-y-1.5">
            <Label htmlFor="nft-select" className="text-xs">Select Obligation NFT</Label>
            <Select value={selectedNFT} onValueChange={setSelectedNFT}>
              <SelectTrigger id="nft-select" className="h-8 text-xs">
                <SelectValue placeholder="Choose an NFT to list..." />
              </SelectTrigger>
              <SelectContent>
                {availableNFTs.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No listable NFTs available
                  </SelectItem>
                ) : (
                  availableNFTs.map((nft) => (
                    <SelectItem key={nft.id.toString()} value={nft.id.toString()}>
                      Stream #{nft.id.toString()} - {microToDisplay(nft.amount)} sBTC
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* NFT Details */}
          {nft && (
            <div className="p-3 bg-muted rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">{totalAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Vested:</span>
                <span className="font-medium">{vestedAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium text-brand-pink">{remainingAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">~{daysRemaining} days</span>
              </div>
            </div>
          )}

          {/* Listing Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs">Listing Price (sBTC)</Label>
            <Input
              id="price"
              type="number"
              step="0.00000001"
              min="0"
              max={remainingAmount}
              placeholder="0.00000000"
              value={listingPrice}
              onChange={(e) => {
                setListingPrice(e.target.value);
                setError("");
              }}
              disabled={!selectedNFT}
              className={`h-8 text-xs ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          {/* Quick Discount Buttons */}
          {nft && (
            <div className="space-y-1.5">
              <Label className="text-xs">Quick Discount Presets</Label>
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiscount(5)}
                  className="text-[10px] h-7"
                >
                  5% Off
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiscount(10)}
                  className="text-[10px] h-7"
                >
                  10% Off
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiscount(15)}
                  className="text-[10px] h-7"
                >
                  15% Off
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyDiscount(20)}
                  className="text-[10px] h-7"
                >
                  20% Off
                </Button>
              </div>
            </div>
          )}

          {/* Calculation Preview */}
          {nft && price > 0 && (
            <div className="p-3 bg-brand-pink/5 border border-brand-pink/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <Calculator className="h-3 w-3 text-brand-pink" />
                <h4 className="font-semibold text-brand-pink text-xs">Deal Summary</h4>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Listing Price:</span>
                  <span className="font-bold text-brand-pink">{price.toFixed(8)} sBTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount Offered:</span>
                  <span className="font-medium text-green-600">{discount.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Immediate Proceeds:</span>
                  <span className="font-medium">{immediateProceeds.toFixed(8)} sBTC</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t">
                  <span className="text-muted-foreground">Buyer's Potential APR:</span>
                  <span className="font-medium text-green-600">{apr.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {price > 0 && discount > 25 && (
            <Alert className="border-yellow-500/50 bg-yellow-500/5 py-2">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <AlertDescription className="text-[11px] text-yellow-800">
                High discount! Consider if this price provides enough immediate liquidity value.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleList}
            disabled={isLoading || !selectedNFT || !listingPrice || price <= 0}
            className="bg-brand-pink hover:bg-brand-pink/90 h-8 text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Listing...
              </>
            ) : (
              <>
                <Tag className="h-3 w-3 mr-1.5" />
                List for Sale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
