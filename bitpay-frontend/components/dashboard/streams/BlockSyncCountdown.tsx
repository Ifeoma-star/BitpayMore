"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface BlockSyncCountdownProps {
  startBlock: bigint;
  currentBlock: number | null;
  className?: string;
}

export function BlockSyncCountdown({ startBlock, currentBlock, className = "" }: BlockSyncCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [blocksRemaining, setBlocksRemaining] = useState<number>(0);

  useEffect(() => {
    if (!currentBlock) return;

    const startBlockNum = Number(startBlock);
    const remaining = startBlockNum - currentBlock;

    // Only show countdown if stream hasn't started yet and is within 20 blocks
    if (remaining <= 0 || remaining > 20) {
      setBlocksRemaining(0);
      return;
    }

    setBlocksRemaining(remaining);

    // Calculate approximate time (10 minutes per block)
    const minutesRemaining = remaining * 10;
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = minutesRemaining % 60;

    if (hours > 0) {
      setTimeRemaining(`~${hours}h ${minutes}m`);
    } else {
      setTimeRemaining(`~${minutes}m`);
    }
  }, [startBlock, currentBlock]);

  if (blocksRemaining === 0) return null;

  return (
    <Alert className={`border-blue-500/50 bg-blue-500/5 ${className}`}>
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-sm">
        <span className="font-medium text-blue-800">Stream starting soon!</span>
        <span className="text-muted-foreground ml-2">
          Waiting for block synchronization: {blocksRemaining} block{blocksRemaining !== 1 ? 's' : ''} ({timeRemaining})
        </span>
      </AlertDescription>
    </Alert>
  );
}
