"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Shuffle, ExternalLink } from "lucide-react";
import { StreamStatus } from "@/lib/contracts/config";

interface ObligationNFTCardProps {
  stream: {
    id: bigint;
    recipient: string;
    amount: bigint;
    vestedAmount: bigint;
    status: StreamStatus;
  };
  displayAmount: (amount: bigint) => string;
  onTransfer: () => void;
}

export function ObligationNFTCard({ stream, displayAmount, onTransfer }: ObligationNFTCardProps) {
  return (
    <Card className="overflow-hidden hover:border-brand-pink/50 transition-colors">
      {/* NFT Visualization */}
      <div className="relative h-48 bg-brand-pink/10 flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-16 w-16 mx-auto text-brand-pink/50 mb-2" />
          <p className="text-2xl font-bold">#{stream.id.toString()}</p>
        </div>
        <Badge className="absolute top-3 right-3 bg-brand-pink">
          <Shuffle className="h-3 w-3 mr-1" />
          Transferable
        </Badge>
        {stream.status === StreamStatus.ACTIVE && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            Active
          </Badge>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-lg">Obligation NFT #{stream.id.toString()}</CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>To:</span>
            <span className="font-mono">{stream.recipient.slice(0, 8)}...{stream.recipient.slice(-4)}</span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stream Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Obligation</p>
            <p className="font-semibold">{displayAmount(stream.amount)} sBTC</p>
          </div>
          <div>
            <p className="text-muted-foreground">Paid Out</p>
            <p className="font-semibold text-brand-pink">
              {displayAmount(stream.vestedAmount)} sBTC
            </p>
          </div>
        </div>

        <Alert>
          <Shuffle className="h-4 w-4 text-brand-pink" />
          <AlertDescription className="text-xs">
            Can be transferred for invoice factoring
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white"
            onClick={onTransfer}
            disabled={stream.status !== StreamStatus.ACTIVE}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Transfer NFT
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/streams/${stream.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
