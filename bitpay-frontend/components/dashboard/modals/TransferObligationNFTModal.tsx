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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Obligation NFT</DialogTitle>
          <DialogDescription>
            Transfer your obligation NFT to sell or assign stream payment rights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stream Info */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stream ID</span>
                <Badge variant="outline">#{streamId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Obligation NFT ID</span>
                <Badge variant="outline">#{obligationTokenId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stream Amount</span>
                <span className="text-sm font-medium">{currentAmount} sBTC</span>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <p className="font-medium mb-1">Two-Step Transfer Process</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>You transfer the obligation NFT to the new owner</li>
                <li>New owner must call <code className="bg-muted px-1 rounded text-xs">update-stream-sender</code> to become the stream sender</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4 text-brand-teal" />
            <AlertDescription className="text-sm">
              The new owner will receive all future stream payments and can cancel the stream. Already vested amounts belong to the recipient.
            </AlertDescription>
          </Alert>

          {/* New Owner Input */}
          <div className="space-y-2">
            <Label htmlFor="new-owner">New Owner Address</Label>
            <Input
              id="new-owner"
              placeholder="SP... or ST..."
              value={newOwner}
              onChange={(e) => {
                setNewOwner(e.target.value);
                setError("");
              }}
              disabled={isTransferring}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Stacks address of the new obligation NFT owner
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring || !newOwner.trim()}
            className="bg-brand-pink hover:bg-brand-pink/90 text-white"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                Transfer NFT
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
