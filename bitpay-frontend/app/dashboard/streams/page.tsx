"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreams } from "@/hooks/use-bitpay-read";
import { useBlockHeight } from "@/hooks/use-block-height";
import { useWithdrawFromStream, useCancelStream } from "@/hooks/use-bitpay-write";
import { StreamStatus, calculateProgress } from "@/lib/contracts/config";
import { StreamListSkeleton } from "@/components/dashboard/StreamCardSkeleton";
import { StreamListHeader } from "@/components/dashboard/streams/list/StreamListHeader";
import { StreamSearch } from "@/components/dashboard/streams/list/StreamSearch";
import { StreamCard } from "@/components/dashboard/streams/list/StreamCard";
import { EmptyStreamState } from "@/components/dashboard/streams/list/EmptyStreamState";

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

  // Auto-refresh streams every 30 seconds to catch newly confirmed transactions
  useEffect(() => {
    if (!userAddress) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing streams from blockchain...');
      refetch();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [userAddress, refetch]);

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

  if (isLoading && !streams) {
    return (
      <div className="space-y-6">
        <StreamListHeader />
        <StreamListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StreamListHeader />
      <StreamSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
            <EmptyStreamState activeTab={activeTab} />
          ) : (
            filteredStreams.map((stream) => {
              const progress = blockHeight
                ? calculateProgress(stream["start-block"], stream["end-block"], BigInt(blockHeight))
                : 0;
              const isRecipient = userAddress?.toLowerCase() === stream.recipient.toLowerCase();

              return (
                <StreamCard
                  key={stream.id.toString()}
                  stream={stream}
                  isRecipient={isRecipient}
                  progress={progress}
                  onWithdraw={handleWithdraw}
                  onCancel={handleCancel}
                  isWithdrawing={isWithdrawing}
                  isCancelling={isCancelling}
                />
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
