"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useStream } from "@/hooks/use-bitpay-read";
import { useBlockHeight } from "@/hooks/use-block-height";
import { useWithdrawFromStream, useCancelStream } from "@/hooks/use-bitpay-write";
import { microToDisplay, StreamStatus, calculateProgress, STACKS_API_URL } from "@/lib/contracts/config";
import { toast } from "sonner";

export default function StreamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id ? BigInt(params.id as string) : null;

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { blockHeight } = useBlockHeight(30000);
  const { data: stream, isLoading, refetch } = useStream(streamId);
  const { write: withdraw, isLoading: isWithdrawing, txId: withdrawTxId } = useWithdrawFromStream();
  const { write: cancel, isLoading: isCancelling, txId: cancelTxId } = useCancelStream();

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  const handleWithdraw = async () => {
    if (!streamId) return;
    const txId = await withdraw(streamId);
    if (txId) {
      toast.success("Withdrawal initiated!", {
        description: "Transaction submitted to the blockchain",
      });
      setTimeout(() => refetch(), 3000);
    }
  };

  const handleCancel = async () => {
    if (!streamId) return;
    const txId = await cancel(streamId);
    if (txId) {
      toast.success("Stream cancelled!", {
        description: "Transaction submitted to the blockchain",
      });
      setTimeout(() => refetch(), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.ACTIVE:
        return <Clock className="h-5 w-5 text-brand-teal" />;
      case StreamStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case StreamStatus.PENDING:
        return <Pause className="h-5 w-5 text-yellow-500" />;
      case StreamStatus.CANCELLED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.ACTIVE:
        return <Badge className="bg-brand-teal text-white">Active</Badge>;
      case StreamStatus.COMPLETED:
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case StreamStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case StreamStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading || !stream) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-3 text-muted-foreground">Loading stream details...</p>
      </div>
    );
  }

  const progress = blockHeight
    ? calculateProgress(stream["start-block"], stream["end-block"], BigInt(blockHeight))
    : 0;
  const isRecipient = userAddress?.toLowerCase() === stream.recipient.toLowerCase();
  const isSender = userAddress?.toLowerCase() === stream.sender.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Stream #{streamId?.toString()}</h1>
          <p className="text-muted-foreground">Detailed view of payment stream</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(stream.status)}
          {getStatusBadge(stream.status)}
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Information</CardTitle>
          <CardDescription>Complete details of this payment stream</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vesting Progress</span>
              <span className="font-medium">{progress.toFixed(2)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <Separator />

          {/* Amounts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold">{microToDisplay(stream.amount)}</p>
              <p className="text-xs text-muted-foreground">sBTC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vested</p>
              <p className="text-2xl font-bold text-brand-teal">{microToDisplay(stream.vestedAmount)}</p>
              <p className="text-xs text-muted-foreground">sBTC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Withdrawn</p>
              <p className="text-2xl font-bold">{microToDisplay(stream.withdrawn)}</p>
              <p className="text-xs text-muted-foreground">sBTC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available</p>
              <p className="text-2xl font-bold text-brand-pink">{microToDisplay(stream.withdrawableAmount)}</p>
              <p className="text-xs text-muted-foreground">sBTC</p>
            </div>
          </div>

          <Separator />

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Sender</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono">
                  {stream.sender}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(stream.sender)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {isSender && <Badge className="mt-2">You</Badge>}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Recipient</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono">
                  {stream.recipient}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(stream.recipient)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {isRecipient && <Badge className="mt-2">You</Badge>}
            </div>
          </div>

          <Separator />

          {/* Block Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Block</p>
              <p className="text-lg font-semibold">{stream["start-block"].toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Block</p>
              <p className="text-lg font-semibold">{stream["end-block"].toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Block</p>
              <p className="text-lg font-semibold text-brand-pink">{blockHeight?.toString() || "..."}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="text-lg font-semibold">
              {(Number(stream["end-block"]) - Number(stream["start-block"])).toLocaleString()} blocks
            </p>
            <p className="text-xs text-muted-foreground">
              ~{Math.round((Number(stream["end-block"]) - Number(stream["start-block"])) / 144)} days
            </p>
          </div>

          {stream.cancelled && stream["cancelled-at-block"] && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cancelled At Block</p>
                <p className="text-lg font-semibold text-red-500">{stream["cancelled-at-block"].toString()}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this stream</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRecipient && stream.withdrawableAmount > BigInt(0) && stream.status === StreamStatus.ACTIVE && (
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="w-full bg-brand-teal hover:bg-brand-teal/90"
              size="lg"
            >
              {isWithdrawing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Withdraw {microToDisplay(stream.withdrawableAmount)} sBTC
            </Button>
          )}

          {isSender && stream.status === StreamStatus.ACTIVE && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full"
              size="lg"
            >
              {isCancelling ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Cancel Stream
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <a
                href={`${STACKS_API_URL.replace("api", "explorer")}/address/${stream.sender}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Sender <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a
                href={`${STACKS_API_URL.replace("api", "explorer")}/address/${stream.recipient}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Recipient <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {(withdrawTxId || cancelTxId) && (
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`${STACKS_API_URL.replace("api", "explorer")}/tx/${withdrawTxId || cancelTxId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Last Transaction <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/streams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Streams
          </Link>
        </Button>
      </div>
    </div>
  );
}
