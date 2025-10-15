"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bitcoin, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Stream {
  id: string;
  description: string;
  recipient: string;
  recipientName?: string;
  totalAmount: string;
  vestedAmount: string;
  withdrawnAmount: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Stream | null;
  onSuccess?: () => void;
}

export function WithdrawModal({ isOpen, onClose, stream, onSuccess }: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!stream) return null;

  const availableAmount = parseFloat(stream.vestedAmount) - parseFloat(stream.withdrawnAmount);
  const maxWithdraw = availableAmount.toFixed(8);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (parseFloat(withdrawAmount) > availableAmount) {
      toast.error("Cannot withdraw more than available amount");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully withdrew ${withdrawAmount} sBTC`);
      onClose();
      setWithdrawAmount("");
      onSuccess?.(); // Call success callback to refresh data
      
      // In real app, refresh stream data
    } catch (error) {
      toast.error("Failed to process withdrawal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setWithdrawAmount(maxWithdraw);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-4 w-4 text-brand-teal" />
            Withdraw from Stream
          </DialogTitle>
          <DialogDescription className="text-xs">
            Withdraw vested Bitcoin from your payment stream
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Stream Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{stream.description}</h4>
              <Badge className="bg-brand-teal text-white text-xs">Active</Badge>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Recipient:</span>
                <span className="font-mono">{formatAddress(stream.recipient)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">{stream.totalAmount} sBTC</span>
              </div>
              <div className="flex justify-between">
                <span>Vested Amount:</span>
                <span className="font-semibold text-brand-pink">{stream.vestedAmount} sBTC</span>
              </div>
              <div className="flex justify-between">
                <span>Already Withdrawn:</span>
                <span>{stream.withdrawnAmount} sBTC</span>
              </div>
            </div>
            
            <Separator className="my-1.5" />
            
            <div className="flex justify-between items-center">
              <span className="font-medium text-xs">Available to Withdraw:</span>
              <div className="flex items-center gap-1">
                <Bitcoin className="h-3 w-3 text-brand-teal" />
                <span className="font-bold text-brand-teal text-sm">{maxWithdraw} sBTC</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs">Withdrawal Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  max={maxWithdraw}
                  placeholder="0.00000000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pr-20 h-9 text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">sBTC</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxAmount}
                    className="h-6 px-2 text-xs"
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Transaction Fee Notice</p>
                <p className="text-[11px] mt-0.5">A small network fee will be deducted from your withdrawal.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-sm">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || isLoading}
              className="flex-1 h-9 text-sm bg-brand-teal hover:bg-brand-teal/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="h-3 w-3 mr-1.5" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}