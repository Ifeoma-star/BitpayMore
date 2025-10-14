"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { useProposeWithdrawal } from "@/hooks/use-multisig-treasury";
import { toast } from "sonner";

interface ProposeWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  treasuryBalance: string; // in display format (sBTC)
  onSuccess?: () => void;
}

export function ProposeWithdrawalModal({
  isOpen,
  onClose,
  treasuryBalance,
  onSuccess,
}: ProposeWithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");

  const { propose, isLoading } = useProposeWithdrawal();

  const maxAmount = parseFloat(treasuryBalance) || 0;
  const dailyLimit = 100; // 100 sBTC

  const handlePropose = async () => {
    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amountNum > maxAmount) {
      toast.error("Amount exceeds treasury balance");
      return;
    }

    if (amountNum > dailyLimit) {
      toast.error(`Amount exceeds daily limit of ${dailyLimit} sBTC`);
      return;
    }

    if (!recipient || !recipient.startsWith("SP") || recipient.length < 20) {
      toast.error("Invalid recipient address");
      return;
    }

    if (description.length === 0 || description.length > 256) {
      toast.error("Description must be between 1-256 characters");
      return;
    }

    // Convert to micro-units
    const amountMicro = BigInt(Math.floor(amountNum * 1_000_000));

    const txId = await propose(amountMicro, recipient, description);

    if (txId) {
      toast.success("Proposal Created!", {
        description: "Multi-sig approval process initiated",
      });
      setAmount("");
      setRecipient("");
      setDescription("");
      onClose();
      onSuccess?.();
    }
  };

  const handleSetMax = () => {
    const maxWithdrawable = Math.min(maxAmount, dailyLimit);
    setAmount(maxWithdrawable.toFixed(6));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-pink" />
            Propose Multi-Sig Withdrawal
          </DialogTitle>
          <DialogDescription>
            Create a withdrawal proposal requiring 3-of-5 multi-sig approval and 24-hour timelock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Multi-Sig Info */}
          <Alert className="border-brand-teal/30 bg-brand-teal/5">
            <Shield className="h-4 w-4 text-brand-teal" />
            <AlertDescription>
              <p className="font-medium text-brand-teal mb-2">Multi-Sig Process:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>You propose the withdrawal (auto-approved as 1st signature)</li>
                <li>2 more admins must approve (total 3 required)</li>
                <li>Wait 24 hours for timelock (144 blocks)</li>
                <li>Any admin can execute after timelock elapses</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (sBTC)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSetMax}
                disabled={isLoading}
              >
                Max
              </Button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {treasuryBalance} sBTC</span>
              <span>Daily Limit: {dailyLimit} sBTC</span>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="recipient"
                placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pl-9 font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Stacks address starting with SP
            </p>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                placeholder="Reason for withdrawal (e.g., Monthly operations budget, Team payment, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-9 min-h-[100px]"
                maxLength={256}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Required for transparency and audit trail</span>
              <span>{description.length}/256</span>
            </div>
          </div>

          {/* Summary */}
          {amount && recipient && description && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <p className="font-medium mb-2">Proposal Summary:</p>
                <div className="text-sm space-y-1">
                  <p>• Amount: <span className="font-bold text-brand-pink">{amount} sBTC</span></p>
                  <p>• Recipient: <span className="font-mono text-xs">{recipient.slice(0, 10)}...{recipient.slice(-8)}</span></p>
                  <p>• Required Approvals: <span className="font-bold">3</span> (including yours)</p>
                  <p>• Timelock: <span className="font-bold">24 hours</span> after 3rd approval</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePropose}
              disabled={isLoading || !amount || !recipient || !description}
              className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Proposal...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>

          {/* Warning */}
          <Alert className="border-yellow-500/50 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-xs">
              <p className="font-medium text-yellow-600 mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your proposal will automatically receive your approval (1/3)</li>
                <li>Proposals expire after 7 days if not executed</li>
                <li>Daily withdrawal limit: 100 sBTC per 24 hours (144 blocks)</li>
                <li>Once executed, the withdrawal is irreversible</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
