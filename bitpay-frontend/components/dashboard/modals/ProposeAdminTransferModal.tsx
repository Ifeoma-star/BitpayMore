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
import { Loader2, UserCog, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

interface ProposeAdminTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: string;
  onSuccess?: () => void;
}

export function ProposeAdminTransferModal({
  isOpen,
  onClose,
  currentAdmin,
  onSuccess,
}: ProposeAdminTransferModalProps) {
  const [newAdmin, setNewAdmin] = useState("");
  const [isProposing, setIsProposing] = useState(false);
  const [error, setError] = useState("");

  const handlePropose = async () => {
    if (!newAdmin.trim()) {
      setError("Please enter a valid Stacks address");
      return;
    }

    // Validate Stacks address format
    if (!newAdmin.startsWith("SP") && !newAdmin.startsWith("ST")) {
      setError("Invalid Stacks address format");
      return;
    }

    if (newAdmin.toLowerCase() === currentAdmin.toLowerCase()) {
      setError("New admin cannot be the same as current admin");
      return;
    }

    setIsProposing(true);
    setError("");

    try {
      // TODO: Implement actual contract call
      // Call bitpay-treasury.propose-admin-transfer(new-admin)
      console.log("Proposing admin transfer:", { currentAdmin, newAdmin });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Admin transfer proposed successfully", {
        description: `Waiting for ${newAdmin.slice(0, 8)}... to accept`,
      });

      onSuccess?.();
      onClose();
      setNewAdmin("");
    } catch (err: any) {
      setError(err.message || "Failed to propose admin transfer");
    } finally {
      setIsProposing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-brand-teal" />
            Propose Admin Transfer
          </DialogTitle>
          <DialogDescription>
            Initiate a two-step admin transfer process for treasury security
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Admin Info */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <Label className="text-xs text-muted-foreground">Current Admin</Label>
            <p className="font-mono text-sm mt-1">{currentAdmin}</p>
          </div>

          {/* Two-Step Process Info */}
          <Alert>
            <Info className="h-4 w-4 text-brand-teal" />
            <AlertDescription>
              <p className="font-medium mb-1">Two-Step Transfer Process</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>You propose the new admin address</li>
                <li>New admin must accept the transfer to complete it</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                You can cancel the proposal before the new admin accepts.
              </p>
            </AlertDescription>
          </Alert>

          {/* New Admin Input */}
          <div className="space-y-2">
            <Label htmlFor="new-admin">New Admin Address</Label>
            <Input
              id="new-admin"
              placeholder="SP... or ST..."
              value={newAdmin}
              onChange={(e) => {
                setNewAdmin(e.target.value);
                setError("");
              }}
              disabled={isProposing}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Stacks address of the new treasury admin
            </p>
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium">Important:</p>
              <p>Only propose admin transfer to addresses you control or trust. The new admin will have full control over the treasury.</p>
            </AlertDescription>
          </Alert>

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
            disabled={isProposing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePropose}
            disabled={isProposing || !newAdmin.trim()}
            className="bg-brand-teal hover:bg-brand-teal/90 text-white"
          >
            {isProposing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Proposing...
              </>
            ) : (
              <>
                <UserCog className="mr-2 h-4 w-4" />
                Propose Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
