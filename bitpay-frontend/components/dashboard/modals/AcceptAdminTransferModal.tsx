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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";

interface AcceptAdminTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: string;
  onSuccess?: () => void;
}

export function AcceptAdminTransferModal({
  isOpen,
  onClose,
  currentAdmin,
  onSuccess,
}: AcceptAdminTransferModalProps) {
  const [understood, setUnderstood] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!understood) {
      setError("Please confirm you understand the responsibilities");
      return;
    }

    setIsAccepting(true);
    setError("");

    try {
      // TODO: Implement actual contract call
      // Call bitpay-treasury.accept-admin-transfer()
      console.log("Accepting admin transfer");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Admin transfer accepted!", {
        description: "You are now the treasury admin",
      });

      onSuccess?.();
      onClose();
      setUnderstood(false);
    } catch (err: any) {
      setError(err.message || "Failed to accept admin transfer");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-teal" />
            Accept Admin Transfer
          </DialogTitle>
          <DialogDescription>
            Complete the admin transfer and take control of the treasury
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Admin Info */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <Label className="text-xs text-muted-foreground">Transferring From</Label>
            <p className="font-mono text-sm mt-1">{currentAdmin}</p>
          </div>

          {/* Responsibilities Alert */}
          <Alert>
            <Shield className="h-4 w-4 text-brand-teal" />
            <AlertDescription>
              <p className="font-medium mb-2">Admin Responsibilities</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Manage treasury funds and collected fees</li>
                <li>Authorize and revoke contract access to vault</li>
                <li>Withdraw collected cancellation fees</li>
                <li>Propose future admin transfers</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium">Important:</p>
              <p>By accepting, you will immediately become the treasury admin. Make sure you understand the responsibilities and have secure key management.</p>
            </AlertDescription>
          </Alert>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="understand"
              checked={understood}
              onCheckedChange={(checked) => {
                setUnderstood(checked as boolean);
                setError("");
              }}
              disabled={isAccepting}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="understand"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I understand the admin responsibilities
              </Label>
              <p className="text-xs text-muted-foreground">
                I have read and understand my duties as treasury admin
              </p>
            </div>
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
            disabled={isAccepting}
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting || !understood}
            className="bg-brand-teal hover:bg-brand-teal/90 text-white"
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
