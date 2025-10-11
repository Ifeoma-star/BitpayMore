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
import { Loader2, Shield, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

interface AuthorizeContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAuthorizedContracts: string[];
  onSuccess?: () => void;
}

export function AuthorizeContractModal({
  isOpen,
  onClose,
  currentAuthorizedContracts,
  onSuccess,
}: AuthorizeContractModalProps) {
  const [contractAddress, setContractAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthorize = async () => {
    setError("");

    // Validate contract address format (Stacks principal format)
    if (!contractAddress) {
      setError("Please enter a contract address");
      return;
    }

    // Check if it's a valid Stacks contract address format
    if (!contractAddress.includes(".")) {
      setError("Invalid contract address format. Must be: address.contract-name");
      return;
    }

    const [address, contractName] = contractAddress.split(".");

    if (!address.startsWith("SP") && !address.startsWith("ST")) {
      setError("Invalid Stacks address. Must start with SP or ST");
      return;
    }

    if (!contractName || contractName.length === 0) {
      setError("Contract name is required");
      return;
    }

    // Check if already authorized
    if (currentAuthorizedContracts.includes(contractAddress)) {
      setError("This contract is already authorized");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call bitpay-access-control.authorize-contract(contract-address)
      console.log("Authorizing contract:", contractAddress);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Contract authorized successfully!", {
        description: `${contractName} can now access vault functions`,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error("Error authorizing contract:", err);
      setError("Failed to authorize contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContractAddress("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-teal" />
            Authorize Contract
          </DialogTitle>
          <DialogDescription>
            Grant vault access permissions to a contract
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Currently Authorized Contracts */}
          <div className="bg-muted/50 border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Currently Authorized Contracts</p>
            <div className="space-y-1">
              {currentAuthorizedContracts.length > 0 ? (
                currentAuthorizedContracts.map((contract) => (
                  <div
                    key={contract}
                    className="flex items-center gap-2 text-xs font-mono bg-background p-2 rounded"
                  >
                    <Shield className="h-3 w-3 text-brand-teal" />
                    <span className="text-muted-foreground">{contract}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No contracts authorized yet</p>
              )}
            </div>
          </div>

          {/* Contract Address Input */}
          <div className="space-y-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input
              id="contract-address"
              type="text"
              placeholder="SP000000000000000000002Q6VF78.contract-name"
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setError("");
              }}
              className={`font-mono text-sm ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Format: address.contract-name (e.g., SP1234...ABCD.my-contract)
            </p>
          </div>

          {/* Warning Alert */}
          <Alert className="border-yellow-500/50 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Security Warning</p>
              <p>
                Authorized contracts will be able to call <code className="text-xs">transfer-from-vault</code> and access
                treasury funds. Only authorize contracts you trust.
              </p>
            </AlertDescription>
          </Alert>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4 text-brand-teal" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">Authorization Process</p>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>Contract address is added to the access control whitelist</li>
                <li>Contract can immediately call vault functions</li>
                <li>You can revoke access at any time from the Access Control panel</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAuthorize}
            disabled={isLoading || !contractAddress}
            className="bg-brand-teal hover:bg-brand-teal/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Authorizing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Authorize Contract
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
