"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Loader2,
  BarChart3,
  XCircle,
  Shuffle,
  Shield,
  Download,
  Clock
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreamsByRole } from "@/hooks/use-user-streams";
import { useTotalFeesCollected } from "@/hooks/use-bitpay-read";
import { useBlockHeight } from "@/hooks/use-block-height";
import { microToDisplay, StreamStatus, calculateProgress } from "@/lib/contracts/config";

export default function AnalyticsPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { blockHeight } = useBlockHeight();
  const {
    outgoingStreams,
    incomingStreams,
    allStreams,
    isLoading
  } = useUserStreamsByRole(userAddress);
  const { data: totalFees } = useTotalFeesCollected();

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  // Calculate analytics
  const activeStreams = allStreams?.filter((s) => s.status === StreamStatus.ACTIVE) || [];
  const completedStreams = allStreams?.filter((s) => s.status === StreamStatus.COMPLETED) || [];
  const pendingStreams = allStreams?.filter((s) => s.status === StreamStatus.PENDING) || [];
  const cancelledStreams = allStreams?.filter((s) => s.status === StreamStatus.CANCELLED) || [];

  const totalStreamed = allStreams?.reduce((sum, s) => sum + s.vestedAmount, BigInt(0)) || BigInt(0);
  const totalVolume = allStreams?.reduce((sum, s) => sum + s.amount, BigInt(0)) || BigInt(0);
  const totalWithdrawn = allStreams?.reduce((sum, s) => sum + s.withdrawn, BigInt(0)) || BigInt(0);
  const totalAvailable = allStreams?.reduce((sum, s) => sum + s.withdrawableAmount, BigInt(0)) || BigInt(0);

  // Status distribution for pie chart
  const statusData = [
    { name: "Active", value: activeStreams.length, color: "#14b8a6" },
    { name: "Completed", value: completedStreams.length, color: "#22c55e" },
    { name: "Pending", value: pendingStreams.length, color: "#eab308" },
    { name: "Cancelled", value: cancelledStreams.length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Monthly volume data
  const monthlyData = allStreams
    ?.slice(0, 6)
    .map((stream, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
      }),
      volume: Number(microToDisplay(stream.amount)),
      vested: Number(microToDisplay(stream.vestedAmount)),
    })) || [];

  // Progress distribution
  const progressBuckets = allStreams?.reduce(
    (acc, stream) => {
      if (!blockHeight) return acc;
      const progress = calculateProgress(
        stream["start-block"],
        stream["end-block"],
        BigInt(blockHeight)
      );

      if (progress < 25) acc["0-25%"]++;
      else if (progress < 50) acc["25-50%"]++;
      else if (progress < 75) acc["50-75%"]++;
      else acc["75-100%"]++;

      return acc;
    },
    { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 }
  ) || { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 };

  const progressData = Object.entries(progressBuckets).map(([range, count]) => ({
    range,
    count,
  }));

  // Cancellation rate analysis
  const cancellationRate = allStreams && allStreams.length > 0
    ? (cancelledStreams.length / allStreams.length) * 100
    : 0;

  const cancellationData = [
    { month: 'Jan', cancellations: 2, streams: 15 },
    { month: 'Feb', cancellations: 1, streams: 20 },
    { month: 'Mar', cancellations: 3, streams: 18 },
    { month: 'Apr', cancellations: 0, streams: 22 },
    { month: 'May', cancellations: 4, streams: 25 },
    { month: 'Jun', cancellations: cancelledStreams.length, streams: allStreams?.length || 0 },
  ];

  // NFT Transfer Activity (mock data - would come from obligation NFT events)
  const nftTransferData = [
    { date: '1 week ago', transfers: 0 },
    { date: '6 days ago', transfers: 0 },
    { date: '5 days ago', transfers: 1 },
    { date: '4 days ago', transfers: 0 },
    { date: '3 days ago', transfers: 2 },
    { date: '2 days ago', transfers: 1 },
    { date: 'Today', transfers: 0 },
  ];

  // Average stream duration
  const avgDuration = allStreams && allStreams.length > 0
    ? allStreams.reduce((sum, s) => sum + Number(s["end-block"] - s["start-block"]), 0) / allStreams.length
    : 0;

  // Withdrawal pattern (mock data)
  const withdrawalPattern = [
    { day: 'Mon', withdrawals: 2, amount: 1.5 },
    { day: 'Tue', withdrawals: 1, amount: 0.8 },
    { day: 'Wed', withdrawals: 3, amount: 2.1 },
    { day: 'Thu', withdrawals: 0, amount: 0 },
    { day: 'Fri', withdrawals: 2, amount: 1.2 },
    { day: 'Sat', withdrawals: 1, amount: 0.5 },
    { day: 'Sun', withdrawals: 0, amount: 0 },
  ];

  if (isLoading && !allStreams) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="ml-3 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights from blockchain data
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{microToDisplay(totalVolume)} sBTC</div>
            <p className="text-xs text-muted-foreground">Across {allStreams?.length || 0} streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-teal">
              {microToDisplay(totalStreamed)} sBTC
            </div>
            <p className="text-xs text-muted-foreground">
              {((Number(totalStreamed) / Number(totalVolume || 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-pink">
              {microToDisplay(totalAvailable)} sBTC
            </div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {cancellationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{cancelledStreams.length} cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Activity className="h-4 w-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger
            value="nfts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            NFT Activity
          </TabsTrigger>
          <TabsTrigger
            value="patterns"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Clock className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vesting Over Time</CardTitle>
              <CardDescription>Stream volume and vested amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e91e63" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e91e63" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tickLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#e91e63"
                        fillOpacity={1}
                        fill="url(#colorVolume)"
                        name="Total Volume"
                      />
                      <Area
                        type="monotone"
                        dataKey="vested"
                        stroke="#14b8a6"
                        fillOpacity={1}
                        fill="url(#colorVested)"
                        name="Vested Amount"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No data available</p>
                    <p className="text-sm">Create streams to see analytics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Streams Sent vs Received</CardTitle>
                <CardDescription>Your participation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sent ({outgoingStreams.length})</span>
                      <span className="text-sm text-muted-foreground">
                        {microToDisplay(outgoingStreams.reduce((sum, s) => sum + s.amount, BigInt(0)))} sBTC
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-pink"
                        style={{
                          width: `${allStreams && allStreams.length > 0 ? (outgoingStreams.length / allStreams.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Received ({incomingStreams.length})</span>
                      <span className="text-sm text-muted-foreground">
                        {microToDisplay(incomingStreams.reduce((sum, s) => sum + s.amount, BigInt(0)))} sBTC
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-teal"
                        style={{
                          width: `${allStreams && allStreams.length > 0 ? (incomingStreams.length / allStreams.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
                <CardDescription>Important metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Stream Size</span>
                  <Badge variant="outline">
                    {allStreams && allStreams.length > 0
                      ? microToDisplay(totalVolume / BigInt(allStreams.length))
                      : "0"} sBTC
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Duration</span>
                  <Badge variant="outline">
                    {Math.round(avgDuration).toLocaleString()} blocks
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <Badge className="bg-green-500 text-white">
                    {allStreams && allStreams.length > 0
                      ? ((completedStreams.length / allStreams.length) * 100).toFixed(1)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform Fees</span>
                  <Badge variant="outline">{totalFees ? microToDisplay(totalFees) : "0"} sBTC</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Status Distribution</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No streams yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vesting Progress</CardTitle>
                <CardDescription>Streams by completion %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" className="text-xs" tickLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="#e91e63" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cancellation Analysis</CardTitle>
              <CardDescription>Track stream cancellations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cancellationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tickLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="streams" fill="#14b8a6" name="Total Streams" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFT Activity Tab */}
        <TabsContent value="nfts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-teal" />
                  Recipient NFTs
                </CardTitle>
                <CardDescription>Soul-bound receipt NFTs owned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-brand-teal mb-2">
                  {incomingStreams.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Non-transferable proof of payment receipts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="h-5 w-5 text-brand-pink" />
                  Obligation NFTs
                </CardTitle>
                <CardDescription>Transferable payment obligations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-brand-pink mb-2">
                  {outgoingStreams.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Available for invoice factoring
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Obligation NFT Transfer Activity</CardTitle>
              <CardDescription>Weekly transfers for invoice factoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nftTransferData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tickLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="transfers"
                      stroke="#e91e63"
                      strokeWidth={2}
                      dot={{ fill: '#e91e63', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#e91e63', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Patterns</CardTitle>
              <CardDescription>When users withdraw their vested funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={withdrawalPattern}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" tickLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="withdrawals" fill="#14b8a6" name="Withdrawals" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Peak Withdrawal Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Wednesday</div>
                <p className="text-xs text-muted-foreground mt-1">Most active day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Time to Withdraw
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5 days</div>
                <p className="text-xs text-muted-foreground mt-1">From vesting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Withdrawal Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
