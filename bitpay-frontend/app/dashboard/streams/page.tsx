"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreams } from "@/hooks/use-bitpay-read";
import { useBlockHeight } from "@/hooks/use-block-height";
import { useWithdrawFromStream, useCancelStream } from "@/hooks/use-bitpay-write";
import { microToDisplay, StreamStatus, calculateProgress } from "@/lib/contracts/config";
import { StreamListSkeleton } from "@/components/dashboard/StreamCardSkeleton";

export default function StreamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { blockHeight } = useBlockHeight(30000);
  const { data: streams, isLoading, refetch } = useUserStreams(userAddress);
  const { write: withdraw, isLoading: isWithdrawing } = useWithdrawFromStream();
  const { write: cancel, isLoading: isCancelling } = useCancelStream();

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  const getStatusIcon = (status: StreamStatus) => {
    switch (status) {
      case StreamStatus.ACTIVE:
        return <Clock className="h-4 w-4 text-brand-teal" />;
      case StreamStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case StreamStatus.PENDING:
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case StreamStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const filteredStreams = streams?.filter((stream) => {
    const matchesSearch =
      stream.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.id.toString().includes(searchTerm);

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && stream.status.toLowerCase() === activeTab;
  }) || [];

  const handleWithdraw = async (streamId: bigint) => {
    const txId = await withdraw(streamId);
    if (txId) {
      setTimeout(() => refetch(), 3000);
    }
  };

  const handleCancel = async (streamId: bigint) => {
    const txId = await cancel(streamId);
    if (txId) {
      setTimeout(() => refetch(), 3000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (isLoading && !streams) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Streams</h1>
            <p className="text-muted-foreground">Loading your streams...</p>
          </div>
        </div>
        <StreamListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment Streams</h1>
          <p className="text-muted-foreground">
            Manage your Bitcoin streaming payments
          </p>
        </div>

        <Button asChild className="bg-brand-pink hover:bg-brand-pink/90 text-white">
          <Link href="/dashboard/streams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Stream
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by address or stream ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({streams?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({streams?.filter((s) => s.status === StreamStatus.ACTIVE).length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({streams?.filter((s) => s.status === StreamStatus.COMPLETED).length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({streams?.filter((s) => s.status === StreamStatus.PENDING).length || 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({streams?.filter((s) => s.status === StreamStatus.CANCELLED).length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {filteredStreams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === "all" ? "No streams yet" : `No ${activeTab} streams`}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {activeTab === "all"
                      ? "Create your first payment stream to start sending Bitcoin over time with automatic vesting."
                      : `You don't have any ${activeTab} streams at the moment.`}
                  </p>
                  {activeTab === "all" && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild className="bg-brand-pink hover:bg-brand-pink/90 text-white">
                        <Link href="/dashboard/streams/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Stream
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/dashboard/bulk-create">
                          Create Bulk Streams
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredStreams.map((stream) => {
              const progress = blockHeight
                ? calculateProgress(stream["start-block"], stream["end-block"], BigInt(blockHeight))
                : 0;
              const isRecipient = userAddress?.toLowerCase() === stream.recipient.toLowerCase();

              return (
                <Card key={stream.id.toString()} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stream.status)}
                          <CardTitle className="text-lg">Stream #{stream.id.toString()}</CardTitle>
                          {getStatusBadge(stream.status)}
                        </div>
                        <CardDescription>
                          {isRecipient ? "Receiving from" : "Sending to"}{" "}
                          {truncateAddress(isRecipient ? stream.sender : stream.recipient)}
                        </CardDescription>
                      </div>
                      <Link href={`/dashboard/streams/${stream.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Amounts */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-lg font-semibold">{microToDisplay(stream.amount)} sBTC</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Vested</p>
                        <p className="text-lg font-semibold text-brand-teal">
                          {microToDisplay(stream.vestedAmount)} sBTC
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Withdrawn</p>
                        <p className="text-lg font-semibold">{microToDisplay(stream.withdrawn)} sBTC</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Available</p>
                        <p className="text-lg font-semibold text-brand-pink">
                          {microToDisplay(stream.withdrawableAmount)} sBTC
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Block Info */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: Block {stream["start-block"].toString()}</span>
                      <span>End: Block {stream["end-block"].toString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {isRecipient && stream.withdrawableAmount > BigInt(0) && stream.status === StreamStatus.ACTIVE && (
                        <Button
                          onClick={() => handleWithdraw(stream.id)}
                          disabled={isWithdrawing}
                          className="bg-brand-teal hover:bg-brand-teal/90"
                        >
                          {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Withdraw
                        </Button>
                      )}
                      {!isRecipient && stream.status === StreamStatus.ACTIVE && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancel(stream.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Cancel Stream
                        </Button>
                      )}
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/streams/${stream.id}`}>View Full Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
