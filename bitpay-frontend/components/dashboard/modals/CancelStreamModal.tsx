"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Loader2, AlertTriangle, ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";

interface Stream {
  id: string;
  description: string;
  recipient: string;
  recipientName?: string;
  totalAmount: string;
  vestedAmount: string;
  withdrawnAmount?: string;
}

interface CancelStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Stream | null;
  onSuccess?: () => void;
}

export function CancelStreamModal({ isOpen, onClose, stream, onSuccess }: CancelStreamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [understood, setUnderstood] = useState(false);

  if (!stream) return null;

  // Calculate amounts
  const totalAmount = parseFloat(stream.totalAmount);
  const vestedAmount = parseFloat(stream.vestedAmount);
  const unvestedAmount = totalAmount - vestedAmount;

  // 1% cancellation fee on unvested amount (100 BPS = 1%)
  const cancellationFee = unvestedAmount * 0.01;
  const unvestedAfterFee = unvestedAmount - cancellationFee;

  const isConfirmValid = confirmText.toLowerCase() === "cancel stream" && understood;

  const handleCancel = async () => {
    if (!isConfirmValid) {
      toast.error("Please confirm by typing 'cancel stream' and checking the box");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual contract call
      // Call bitpay-core.cancel-stream(stream-id)
      console.log("Cancelling stream:", stream.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Stream cancelled. ${unvestedAfterFee.toFixed(8)} sBTC returned to your wallet`);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      toast.error("Failed to cancel stream");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setConfirmText("");
    setUnderstood(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-500" />
            Cancel Stream
          </DialogTitle>
          <DialogDescription>
            Permanently cancel this payment stream
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Danger Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">⚠️ This action cannot be undone</p>
              <p className="text-sm">The stream will be permanently cancelled and cannot be resumed.</p>
            </AlertDescription>
          </Alert>

          {/* Stream Info */}
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div>
              <p className="font-medium">{stream.description}</p>
              <p className="text-sm text-muted-foreground">
                To: {stream.recipientName || `${stream.recipient.slice(0, 8)}...${stream.recipient.slice(-8)}`}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Stream Amount:</span>
                <span className="font-medium">{totalAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Vested:</span>
                <span className="font-medium text-brand-teal">{vestedAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unvested Amount:</span>
                <span className="font-medium">{unvestedAmount.toFixed(8)} sBTC</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Cancellation Fee (1%):</span>
                <span className="font-medium">-{cancellationFee.toFixed(8)} sBTC</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>You'll Receive:</span>
                <span className="text-brand-pink">{unvestedAfterFee.toFixed(8)} sBTC</span>
              </div>
            </div>
          </div>

          {/* Fee Info Alert */}
          <Alert>
            <Info className="h-4 w-4 text-brand-teal" />
            <AlertDescription className="text-sm">
              <p className="mb-1">
                <strong>Cancellation Fee:</strong> A 1% fee is charged on the unvested amount to discourage frivolous cancellations. This fee is sent to the treasury.
              </p>
              <p className="text-muted-foreground">
                The recipient keeps the {vestedAmount.toFixed(8)} sBTC already vested.
              </p>
            </AlertDescription>
          </Alert>

          {/* Confirmation */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="confirm">Type "cancel stream" to confirm:</Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="cancel stream"
                disabled={isLoading}
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="understood" className="text-sm cursor-pointer">
                I understand this action cannot be undone and accept the 1% fee
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Keep Stream
            </Button>
            <Button
              onClick={handleCancel}
              disabled={!isConfirmValid || isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Stream
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
