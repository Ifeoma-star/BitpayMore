"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon,
  Search,
  ExternalLink,
  Loader2,
  Gift,
  Lock,
  Shuffle,
  Info,
  Shield,
  ArrowRight
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreamsByRole } from "@/hooks/use-user-streams";
import { microToDisplay, StreamStatus } from "@/lib/contracts/config";
import { TransferObligationNFTModal } from "@/components/dashboard/modals/TransferObligationNFTModal";

export default function NFTGalleryPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStreamForTransfer, setSelectedStreamForTransfer] = useState<any>(null);

  const {
    outgoingStreams,
    incomingStreams,
    isLoading,
    refetch
  } = useUserStreamsByRole(userAddress);

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  // Filter by search
  const filteredRecipientNFTs = incomingStreams.filter((stream) =>
    stream.id.toString().includes(searchTerm) ||
    stream.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredObligationNFTs = outgoingStreams.filter((stream) =>
    stream.id.toString().includes(searchTerm) ||
    stream.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="ml-3 text-muted-foreground">Loading NFT gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">NFT Gallery</h1>
          <p className="text-muted-foreground">
            Manage your stream NFTs - receipts and payment obligations
          </p>
        </div>
      </div>

      {/* Dual NFT System Explanation */}
      <Alert className="border-brand-teal/30 bg-brand-teal/5">
        <Info className="h-4 w-4 text-brand-teal" />
        <AlertDescription>
          <p className="font-medium mb-2 text-brand-teal">Dual NFT System</p>
          <div className="text-sm space-y-1">
            <p><strong>Recipient NFTs (Soul-bound):</strong> Non-transferable proof of payment receipt. Can't be sold or transferred.</p>
            <p><strong>Obligation NFTs (Transferable):</strong> Represents payment obligation. Can be transferred for invoice factoring.</p>
          </div>
        </AlertDescription>
      </Alert>

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

      {/* Tabs for Recipient vs Obligation NFTs */}
      <Tabs defaultValue="recipient" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="recipient"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-teal data-[state=active]:bg-transparent"
          >
            <Shield className="h-4 w-4 mr-2" />
            Recipient NFTs ({incomingStreams.length})
          </TabsTrigger>
          <TabsTrigger
            value="obligation"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Obligation NFTs ({outgoingStreams.length})
          </TabsTrigger>
        </TabsList>

        {/* Recipient NFTs Tab (Soul-bound) */}
        <TabsContent value="recipient" className="space-y-6">
          <Card className="border-brand-teal/20 bg-brand-teal/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-teal">
                <Lock className="h-5 w-5" />
                Soul-Bound Receipt NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These NFTs represent proof that you are receiving a payment stream. They are <strong>non-transferable</strong> (soul-bound) and serve as permanent receipts of income.
              </p>
            </CardContent>
          </Card>

          {filteredRecipientNFTs.length === 0 ? (
            <Card className="border-dashed border-brand-teal/30">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-teal/10 mb-4">
                    <Shield className="h-10 w-10 text-brand-teal" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Recipient NFTs Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    When someone creates a payment stream to you, you'll automatically receive a soul-bound receipt NFT. These NFTs serve as permanent proof of income and cannot be transferred.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Soul-bound • Non-transferable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipientNFTs.map((stream) => (
                <Card key={stream.id.toString()} className="overflow-hidden hover:border-brand-teal/50 transition-colors">
                  {/* NFT Visualization */}
                  <div className="relative h-48 bg-brand-teal/10 flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="h-16 w-16 mx-auto text-brand-teal/50 mb-2" />
                      <p className="text-2xl font-bold">#{stream.id.toString()}</p>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-brand-teal">
                      <Lock className="h-3 w-3 mr-1" />
                      Soul-Bound
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">Receipt NFT #{stream.id.toString()}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>From:</span>
                        <span className="font-mono">{stream.sender.slice(0, 8)}...{stream.sender.slice(-4)}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stream Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">{microToDisplay(stream.amount)} sBTC</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Received</p>
                        <p className="font-semibold text-brand-teal">
                          {microToDisplay(stream.vestedAmount)} sBTC
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <Lock className="h-4 w-4 text-brand-teal" />
                      <AlertDescription className="text-xs">
                        Non-transferable. Permanent proof of receipt.
                      </AlertDescription>
                    </Alert>

                    {/* Actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                      asChild
                    >
                      <Link href={`/dashboard/streams/${stream.id}`}>
                        View Stream <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Obligation NFTs Tab (Transferable) */}
        <TabsContent value="obligation" className="space-y-6">
          <Card className="border-brand-pink/20 bg-brand-pink/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-pink">
                <Shuffle className="h-5 w-5" />
                Transferable Obligation NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These NFTs represent payment obligations for streams you're sending. They are <strong>transferable</strong> and can be sold for invoice factoring or assigned to others.
              </p>
            </CardContent>
          </Card>

          {filteredObligationNFTs.length === 0 ? (
            <Card className="border-dashed border-brand-pink/30">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-pink/10 mb-4">
                    <Shuffle className="h-10 w-10 text-brand-pink" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Obligation NFTs Yet</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    When you create a payment stream, you'll receive an obligation NFT representing the payment commitment. These NFTs are transferable and can be sold for invoice factoring.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                    <Button asChild className="bg-brand-pink hover:bg-brand-pink/90 text-white">
                      <Link href="/dashboard/streams/create">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Create Stream
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shuffle className="h-4 w-4" />
                    <span>Transferable • Invoice Factoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredObligationNFTs.map((stream) => (
                <Card key={stream.id.toString()} className="overflow-hidden hover:border-brand-pink/50 transition-colors">
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
                        <p className="font-semibold">{microToDisplay(stream.amount)} sBTC</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid Out</p>
                        <p className="font-semibold text-brand-pink">
                          {microToDisplay(stream.vestedAmount)} sBTC
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
                        onClick={() => setSelectedStreamForTransfer(stream)}
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
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-teal">{incomingStreams.length}</p>
              <p className="text-xs text-muted-foreground">Recipient NFTs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-pink">{outgoingStreams.length}</p>
              <p className="text-xs text-muted-foreground">Obligation NFTs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {microToDisplay(
                  incomingStreams.reduce((sum, s) => sum + s.vestedAmount, BigInt(0))
                )}
              </p>
              <p className="text-xs text-muted-foreground">Total Received (sBTC)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {microToDisplay(
                  outgoingStreams.reduce((sum, s) => sum + s.amount, BigInt(0))
                )}
              </p>
              <p className="text-xs text-muted-foreground">Total Obligations (sBTC)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Obligation NFT Modal */}
      {selectedStreamForTransfer && (
        <TransferObligationNFTModal
          isOpen={!!selectedStreamForTransfer}
          onClose={() => setSelectedStreamForTransfer(null)}
          streamId={selectedStreamForTransfer.id.toString()}
          obligationTokenId={selectedStreamForTransfer.id.toString()} // TODO: Get actual obligation token ID
          currentAmount={microToDisplay(selectedStreamForTransfer.amount)}
        />
      )}
    </div>
  );
}
