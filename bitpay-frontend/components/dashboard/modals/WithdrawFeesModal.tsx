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
import { Loader2, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface WithdrawFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalFeesAvailable: string;
  onSuccess?: () => void;
}

export function WithdrawFeesModal({
  isOpen,
  onClose,
  totalFeesAvailable,
  onSuccess,
}: WithdrawFeesModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWithdraw = async () => {
    setError("");

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    const availableFees = parseFloat(totalFeesAvailable);

    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > availableFees) {
      setError(`Cannot withdraw more than ${totalFeesAvailable} sBTC`);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call bitpay-treasury.withdraw-fees(amount)
      console.log("Withdrawing fees:", {
        amount: withdrawAmount,
        amountInMicro: withdrawAmount * 1_000_000,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Fees withdrawn successfully!", {
        description: `${amount} sBTC has been transferred to your wallet`,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Error withdrawing fees:", err);
      setError("Failed to withdraw fees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  const handleMaxClick = () => {
    setAmount(totalFeesAvailable);
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-pink" />
            Withdraw Collected Fees
          </DialogTitle>
          <DialogDescription>
            Withdraw accumulated cancellation fees from the treasury
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Available Fees Display */}
          <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Fees Available</p>
            <p className="text-3xl font-bold text-brand-pink">{totalFeesAvailable} sBTC</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (sBTC)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0"
                max={totalFeesAvailable}
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className={error ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                className="border-brand-pink text-brand-pink hover:bg-brand-pink/10"
              >
                MAX
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Info Alert */}
          <Alert>
            <CheckCircle className="h-4 w-4 text-brand-teal" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">Withdrawal Process</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>Fees will be transferred from treasury to your wallet</li>
                <li>Transaction will be recorded on-chain</li>
                <li>Balance will update after confirmation</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Warning for full withdrawal */}
          {amount === totalFeesAvailable && parseFloat(amount) > 0 && (
            <Alert className="border-yellow-500/50 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                You are withdrawing all available fees. The treasury balance will be zero after
                this transaction.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="bg-brand-pink hover:bg-brand-pink/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Withdraw Fees
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
