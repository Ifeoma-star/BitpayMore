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
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreams, useTotalFeesCollected } from "@/hooks/use-bitpay-read";
import { useBlockHeight } from "@/hooks/use-block-height";
import { microToDisplay, StreamStatus, calculateProgress } from "@/lib/contracts/config";

export default function AnalyticsPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { blockHeight } = useBlockHeight();
  const { data: streams, isLoading } = useUserStreams(userAddress);
  const { data: totalFees } = useTotalFeesCollected();

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  // Calculate analytics
  const activeStreams = streams?.filter((s) => s.status === StreamStatus.ACTIVE) || [];
  const completedStreams = streams?.filter((s) => s.status === StreamStatus.COMPLETED) || [];
  const pendingStreams = streams?.filter((s) => s.status === StreamStatus.PENDING) || [];
  const cancelledStreams = streams?.filter((s) => s.status === StreamStatus.CANCELLED) || [];

  const totalStreamed = streams?.reduce((sum, s) => sum + s.vestedAmount, BigInt(0)) || BigInt(0);
  const totalVolume = streams?.reduce((sum, s) => sum + s.amount, BigInt(0)) || BigInt(0);
  const totalWithdrawn = streams?.reduce((sum, s) => sum + s.withdrawn, BigInt(0)) || BigInt(0);
  const totalAvailable = streams?.reduce((sum, s) => sum + s.withdrawableAmount, BigInt(0)) || BigInt(0);

  // Streams sent vs received
  const sentStreams = streams?.filter((s) => s.sender.toLowerCase() === userAddress?.toLowerCase()) || [];
  const receivedStreams = streams?.filter((s) => s.recipient.toLowerCase() === userAddress?.toLowerCase()) || [];

  // Status distribution for pie chart
  const statusData = [
    { name: "Active", value: activeStreams.length, color: "#14b8a6" },
    { name: "Completed", value: completedStreams.length, color: "#22c55e" },
    { name: "Pending", value: pendingStreams.length, color: "#eab308" },
    { name: "Cancelled", value: cancelledStreams.length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Monthly volume data (simulated - would need historical blockchain data)
  const monthlyData = streams
    ?.slice(0, 6)
    .map((stream, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
      }),
      volume: Number(microToDisplay(stream.amount)),
      vested: Number(microToDisplay(stream.vestedAmount)),
    })) || [];

  // Progress distribution
  const progressBuckets = streams?.reduce(
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

  if (isLoading && !streams) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          Insights and statistics from real blockchain data
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
            <p className="text-xs text-muted-foreground">Across {streams?.length || 0} streams</p>
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
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{microToDisplay(totalWithdrawn)} sBTC</div>
            <p className="text-xs text-muted-foreground">From completed streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-pink">
              {microToDisplay(totalAvailable)} sBTC
            </div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="comparison">Sent vs Received</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vesting Over Time</CardTitle>
              <CardDescription>Stream volume and vested amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#e91e63"
                        strokeWidth={2}
                        name="Total Volume"
                      />
                      <Line
                        type="monotone"
                        dataKey="vested"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        name="Vested Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
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
                <CardTitle>Stream Metrics</CardTitle>
                <CardDescription>Key statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Streams</span>
                  <Badge>{streams?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Streams</span>
                  <Badge className="bg-brand-teal text-white">{activeStreams.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed Streams</span>
                  <Badge className="bg-green-500 text-white">{completedStreams.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Stream Size</span>
                  <Badge variant="outline">
                    {streams && streams.length > 0
                      ? microToDisplay(totalVolume / BigInt(streams.length))
                      : "0"}{" "}
                    sBTC
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

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vesting Progress Distribution</CardTitle>
              <CardDescription>Streams grouped by completion percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#e91e63" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Streams Sent</CardTitle>
                <CardDescription>Payment streams you created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-brand-pink">{sentStreams.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Value: {microToDisplay(sentStreams.reduce((sum, s) => sum + s.amount, BigInt(0)))} sBTC
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streams Received</CardTitle>
                <CardDescription>Payment streams sent to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-brand-teal">{receivedStreams.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Value:{" "}
                    {microToDisplay(receivedStreams.reduce((sum, s) => sum + s.amount, BigInt(0)))} sBTC
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
