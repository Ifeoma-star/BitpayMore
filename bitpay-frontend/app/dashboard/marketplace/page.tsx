"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Tag,
  Search,
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
  Percent,
  Info,
  Shuffle,
  Plus,
  ArrowUpRight,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreamsByRole } from "@/hooks/use-user-streams";
import { microToDisplay, StreamStatus } from "@/lib/contracts/config";
import { ListObligationNFTModal } from "@/components/dashboard/modals/ListObligationNFTModal";
import { BuyObligationNFTModal } from "@/components/dashboard/modals/BuyObligationNFTModal";
import { NFTGridSkeleton } from "@/components/dashboard/NFTCardSkeleton";

interface MarketplaceListing {
  streamId: string;
  seller: string;
  price: number;
  discount: number;
  totalAmount: number;
  vestedAmount: number;
  remainingAmount: number;
  endBlock: number;
  daysRemaining: number;
  apr: number;
  listed: string;
}

export default function MarketplacePage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [sortBy, setSortBy] = useState("discount");
  const [filterDiscount, setFilterDiscount] = useState("all");

  const { outgoingStreams, isLoading } = useUserStreamsByRole(userAddress);

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  // Mock marketplace listings (in production, fetch from backend)
  const mockListings: MarketplaceListing[] = [
    {
      streamId: "1",
      seller: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      price: 9.5,
      discount: 5,
      totalAmount: 10,
      vestedAmount: 3,
      remainingAmount: 7,
      endBlock: 150000,
      daysRemaining: 45,
      apr: 12.5,
      listed: "2 days ago",
    },
    {
      streamId: "2",
      seller: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
      price: 18,
      discount: 10,
      totalAmount: 20,
      vestedAmount: 8,
      remainingAmount: 12,
      endBlock: 160000,
      daysRemaining: 60,
      apr: 18.2,
      listed: "5 hours ago",
    },
    {
      streamId: "3",
      seller: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE",
      price: 28.5,
      discount: 15,
      totalAmount: 35,
      vestedAmount: 5,
      remainingAmount: 30,
      endBlock: 170000,
      daysRemaining: 90,
      apr: 22.8,
      listed: "1 day ago",
    },
  ];

  // Filter active obligation NFTs that can be listed
  const listableNFTs = outgoingStreams.filter(
    (stream) => stream.status === StreamStatus.ACTIVE && !stream.cancelled
  );

  // Filter and sort listings
  let filteredListings = mockListings.filter((listing) =>
    listing.streamId.includes(searchTerm) ||
    listing.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterDiscount !== "all") {
    const minDiscount = parseInt(filterDiscount);
    filteredListings = filteredListings.filter((l) => l.discount >= minDiscount);
  }

  // Sort listings
  filteredListings.sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return b.discount - a.discount;
      case "apr":
        return b.apr - a.apr;
      case "amount":
        return b.remainingAmount - a.remainingAmount;
      case "time":
        return a.daysRemaining - b.daysRemaining;
      default:
        return 0;
    }
  });

  const calculateDiscount = (price: number, totalAmount: number) => {
    return ((totalAmount - price) / totalAmount) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">NFT Marketplace</h1>
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        </div>
        <NFTGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">NFT Marketplace</h1>
          <p className="text-muted-foreground">
            Buy and sell obligation NFTs for invoice factoring
          </p>
        </div>
        {listableNFTs.length > 0 && (
          <Button
            onClick={() => setShowListModal(true)}
            className="bg-brand-pink hover:bg-brand-pink/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            List NFT for Sale
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Alert className="border-brand-teal/30 bg-brand-teal/5">
        <Info className="h-4 w-4 text-brand-teal" />
        <AlertDescription>
          <p className="font-medium text-brand-teal mb-1">What is Invoice Factoring?</p>
          <p className="text-sm">
            Obligation NFTs represent future payment streams. Sellers can list them at a discount for
            immediate liquidity, while buyers earn returns by collecting the full stream amount over time.
          </p>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Browse Listings ({filteredListings.length})
          </TabsTrigger>
          <TabsTrigger value="my-listings">
            <Tag className="h-4 w-4 mr-2" />
            My Listings (0)
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Analytics
          </TabsTrigger>
        </TabsList>

        {/* Browse Listings Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by stream ID or seller..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">Highest Discount</SelectItem>
                      <SelectItem value="apr">Highest APR</SelectItem>
                      <SelectItem value="amount">Largest Amount</SelectItem>
                      <SelectItem value="time">Shortest Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount-filter">Min. Discount</Label>
                  <Select value={filterDiscount} onValueChange={setFilterDiscount}>
                    <SelectTrigger id="discount-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="5">5%+</SelectItem>
                      <SelectItem value="10">10%+</SelectItem>
                      <SelectItem value="15">15%+</SelectItem>
                      <SelectItem value="20">20%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    {searchTerm || filterDiscount !== "all"
                      ? "Try adjusting your filters to see more listings."
                      : "Be the first to list an obligation NFT for sale!"}
                  </p>
                  {listableNFTs.length > 0 && (
                    <Button
                      onClick={() => setShowListModal(true)}
                      className="bg-brand-pink hover:bg-brand-pink/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      List Your NFT
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.streamId}
                  className="overflow-hidden hover:border-brand-pink/50 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-brand-pink text-white">
                        {listing.discount}% OFF
                      </Badge>
                      <span className="text-xs text-muted-foreground">{listing.listed}</span>
                    </div>
                    <CardTitle className="text-lg">Stream #{listing.streamId}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {listing.seller.slice(0, 8)}...{listing.seller.slice(-6)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="p-4 bg-brand-pink/5 rounded-lg border border-brand-pink/20">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Sale Price</span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-brand-pink">
                            {listing.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {listing.totalAmount.toFixed(2)} sBTC
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p className="font-medium">{listing.remainingAmount.toFixed(2)} sBTC</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">APR</p>
                          <p className="font-medium text-green-600">{listing.apr.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{listing.daysRemaining}d</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Profit</p>
                          <p className="font-medium text-green-600">
                            +{(listing.totalAmount - listing.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowBuyModal(true);
                        }}
                        className="flex-1 bg-brand-pink hover:bg-brand-pink/90"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/dashboard/streams/${listing.streamId}`}>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings" className="space-y-6">
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  You haven't listed any obligation NFTs for sale yet.
                </p>
                {listableNFTs.length > 0 && (
                  <Button
                    onClick={() => setShowListModal(true)}
                    className="bg-brand-pink hover:bg-brand-pink/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    List Your First NFT
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Discount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-pink">10.2%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all listings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. APR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">17.8%</div>
                <p className="text-xs text-muted-foreground mt-1">Annual return rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">65 sBTC</div>
                <p className="text-xs text-muted-foreground mt-1">Listed for sale</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Key statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Active Listings</span>
                  <span className="font-medium">{mockListings.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Avg. Days Remaining</span>
                  <span className="font-medium">65 days</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Best Discount</span>
                  <span className="font-medium text-brand-pink">15%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Best APR</span>
                  <span className="font-medium text-green-600">22.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ListObligationNFTModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        availableNFTs={listableNFTs}
        onSuccess={() => {
          setShowListModal(false);
          // Refresh listings
        }}
      />

      {selectedListing && (
        <BuyObligationNFTModal
          isOpen={showBuyModal}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onSuccess={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
            // Refresh listings
          }}
        />
      )}
    </div>
  );
}
