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
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, AlertTriangle, Info } from "lucide-react";

interface TransferObligationNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  obligationTokenId: string;
  currentAmount: string;
}

export function TransferObligationNFTModal({
  isOpen,
  onClose,
  streamId,
  obligationTokenId,
  currentAmount,
}: TransferObligationNFTModalProps) {
  const [newOwner, setNewOwner] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    if (!newOwner.trim()) {
      setError("Please enter a valid Stacks address");
      return;
    }

    // Validate Stacks address format (basic validation)
    if (!newOwner.startsWith("SP") && !newOwner.startsWith("ST")) {
      setError("Invalid Stacks address format");
      return;
    }

    setIsTransferring(true);
    setError("");

    try {
      // TODO: Implement actual contract call
      // Step 1: Transfer obligation NFT
      // Step 2: New owner must call update-stream-sender

      console.log("Transferring obligation NFT:", {
        tokenId: obligationTokenId,
        streamId,
        newOwner,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      onClose();

      // TODO: Show success toast
      alert("Obligation NFT transferred! The new owner must call update-stream-sender to complete the transfer.");

    } catch (err: any) {
      setError(err.message || "Failed to transfer obligation NFT");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Transfer Obligation NFT</DialogTitle>
          <DialogDescription className="text-xs">
            Transfer your obligation NFT to sell or assign stream payment rights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Stream Info */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stream ID</span>
                <Badge variant="outline" className="text-xs">#{streamId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Obligation NFT ID</span>
                <Badge variant="outline" className="text-xs">#{obligationTokenId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stream Amount</span>
                <span className="font-medium">{currentAmount} sBTC</span>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="py-2">
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
            <AlertDescription className="text-xs">
              <p className="font-medium mb-1">Two-Step Transfer Process</p>
              <ol className="space-y-0.5 ml-4 list-decimal text-[11px]">
                <li>You transfer the obligation NFT to the new owner</li>
                <li>New owner must call <code className="bg-muted px-1 rounded text-[10px]">update-stream-sender</code> to become the stream sender</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Info Alert */}
          <Alert className="py-2">
            <Info className="h-3 w-3 text-brand-teal" />
            <AlertDescription className="text-[11px]">
              The new owner will receive all future stream payments and can cancel the stream. Already vested amounts belong to the recipient.
            </AlertDescription>
          </Alert>

          {/* New Owner Input */}
          <div className="space-y-1.5">
            <Label htmlFor="new-owner" className="text-xs">New Owner Address</Label>
            <Input
              id="new-owner"
              placeholder="SP... or ST..."
              value={newOwner}
              onChange={(e) => {
                setNewOwner(e.target.value);
                setError("");
              }}
              disabled={isTransferring}
              className="font-mono text-xs h-8"
            />
            <p className="text-[10px] text-muted-foreground">
              Enter the Stacks address of the new obligation NFT owner
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isTransferring}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring || !newOwner.trim()}
            className="bg-brand-pink hover:bg-brand-pink/90 text-white h-8 text-xs"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                Transfer NFT
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
