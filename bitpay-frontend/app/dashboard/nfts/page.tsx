"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon,
  Search,
  ExternalLink,
  Loader2,
  Gift,
  Share2,
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreams } from "@/hooks/use-bitpay-read";
import { useMintStreamNFT } from "@/hooks/use-bitpay-write";
import { microToDisplay, StreamStatus, STACKS_API_URL } from "@/lib/contracts/config";
import { toast } from "sonner";

export default function NFTGalleryPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mintingStreamId, setMintingStreamId] = useState<bigint | null>(null);

  const { data: streams, isLoading, refetch } = useUserStreams(userAddress);
  const { write: mintNFT, isLoading: isMinting, txId } = useMintStreamNFT();

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  const handleMintNFT = async (streamId: bigint, recipient: string) => {
    setMintingStreamId(streamId);
    const txId = await mintNFT(streamId, recipient);
    if (txId) {
      toast.success("NFT Minting Initiated!", {
        description: "Transaction submitted to blockchain",
      });
      setTimeout(() => {
        refetch();
        setMintingStreamId(null);
      }, 3000);
    } else {
      setMintingStreamId(null);
    }
  };

  // Filter streams that can have NFTs (completed or active)
  const nftEligibleStreams = streams?.filter(
    (s) => s.status === StreamStatus.COMPLETED || s.status === StreamStatus.ACTIVE
  );

  // Filter by search
  const filteredStreams = nftEligibleStreams?.filter((stream) =>
    stream.id.toString().includes(searchTerm) ||
    stream.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.sender.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading && !streams) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-3 text-muted-foreground">Loading NFT gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stream NFT Gallery</h1>
          <p className="text-muted-foreground">
            Mint and manage NFTs for your payment streams
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-brand-pink/20 bg-brand-pink/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-brand-pink" />
            About Stream NFTs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stream NFTs are SIP-009 compliant tokens that represent ownership of a payment stream.
            NFTs can be minted for active or completed streams and can be transferred to other users.
            Each NFT contains metadata about the stream including amount, duration, and participants.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by stream ID or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* NFT Grid */}
      {filteredStreams.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No NFT-eligible streams found</p>
              <p className="text-sm">
                Complete a stream or create a new one to mint NFTs
              </p>
              <Button asChild className="mt-4 bg-brand-pink hover:bg-brand-pink/90 text-white">
                <Link href="/dashboard/streams/create">Create Stream</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => {
            const isRecipient = userAddress?.toLowerCase() === stream.recipient.toLowerCase();
            const isMintingThis = mintingStreamId?.toString() === stream.id.toString();

            return (
              <Card key={stream.id.toString()} className="overflow-hidden hover:border-brand-pink/50 transition-colors">
                {/* NFT Image/Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-brand-pink/20 via-brand-teal/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto text-brand-pink/50 mb-2" />
                    <p className="text-2xl font-bold text-foreground/80">#{stream.id.toString()}</p>
                  </div>
                  <Badge className="absolute top-3 right-3">
                    {stream.status === StreamStatus.COMPLETED ? "Completed" : "Active"}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">Stream #{stream.id.toString()}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>From:</span>
                      <span className="font-mono">{stream.sender.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>To:</span>
                      <span className="font-mono">{stream.recipient.slice(0, 8)}...</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stream Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">{microToDisplay(stream.amount)} sBTC</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vested</p>
                      <p className="font-semibold text-brand-teal">
                        {microToDisplay(stream.vestedAmount)} sBTC
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMintNFT(stream.id, stream.recipient)}
                      disabled={isMinting || isMintingThis}
                      className="flex-1 bg-brand-pink hover:bg-brand-pink/90"
                      size="sm"
                    >
                      {isMintingThis ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Minting...</>
                      ) : (
                        <><Gift className="h-4 w-4 mr-2" /> Mint NFT</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/streams/${stream.id}`}>
                        View <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Explorer Link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    asChild
                  >
                    <a
                      href={`${STACKS_API_URL.replace("api", "explorer")}/address/${stream.sender}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {filteredStreams.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-pink">{filteredStreams.length}</p>
                <p className="text-xs text-muted-foreground">NFT-Eligible Streams</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-teal">
                  {filteredStreams.filter(s => s.status === StreamStatus.COMPLETED).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {filteredStreams.filter(s => s.status === StreamStatus.ACTIVE).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {microToDisplay(
                    filteredStreams.reduce((sum, s) => sum + s.amount, BigInt(0))
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Total Value (sBTC)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
