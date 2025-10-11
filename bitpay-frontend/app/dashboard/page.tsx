"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  TrendingUp,
  Wallet,
  Activity,
  Bitcoin,
  RefreshCw,
  Loader2,
  Send,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from "framer-motion";
import Link from "next/link";
import walletService from "@/lib/wallet/wallet-service";
import { useUserStreamsByRole } from "@/hooks/use-user-streams";
import { useBlockHeight } from "@/hooks/use-block-height";
import { microToDisplay, StreamStatus } from "@/lib/contracts/config";

export default function DashboardPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<bigint>(BigInt(0));

  // Get current block height
  const { blockHeight, isLoading: blockLoading } = useBlockHeight(30000);

  // Get user's streams split by role
  const {
    outgoingStreams,
    incomingStreams,
    hasOutgoing,
    hasIncoming,
    totalOutgoing,
    totalIncoming,
    allStreams,
    isLoading: streamsLoading,
    refetch
  } = useUserStreamsByRole(userAddress);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const address = await walletService.getCurrentAddress();
        setUserAddress(address);

        if (address) {
          const balance = await walletService.getStxBalance();
          setWalletBalance(balance);
        }
      } catch (error) {
        console.error('Error loading wallet data:', error);
      }
    };

    loadWalletData();
  }, []);

  // Calculate combined stats
  const activeStreams = allStreams?.filter(s => s.status === StreamStatus.ACTIVE).length || 0;
  const completedStreams = allStreams?.filter(s => s.status === StreamStatus.COMPLETED).length || 0;
  const totalStreamed = allStreams?.reduce((sum, stream) => sum + stream.vestedAmount, BigInt(0)) || BigInt(0);
  const totalVolume = allStreams?.reduce((sum, stream) => sum + stream.amount, BigInt(0)) || BigInt(0);

  // Calculate role-specific stats
  const totalSending = outgoingStreams.reduce((sum, s) => sum + s.amount, BigInt(0));
  const totalReceiving = incomingStreams.reduce((sum, s) => sum + s.vestedAmount, BigInt(0));
  const availableToWithdraw = incomingStreams.reduce((sum, s) => sum + s.withdrawableAmount, BigInt(0));

  const stats = [
    {
      title: "Total Streamed",
      value: `${microToDisplay(totalStreamed)} sBTC`,
      change: `${completedStreams} completed`,
      changeType: "neutral" as const,
      icon: Bitcoin,
    },
    {
      title: "Active Streams",
      value: activeStreams.toString(),
      change: `${allStreams?.length || 0} Total`,
      changeType: "neutral" as const,
      icon: Activity,
    },
    {
      title: "Total Volume",
      value: `${microToDisplay(totalVolume)} sBTC`,
      change: "All streams combined",
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
    {
      title: "Available to Withdraw",
      value: `${microToDisplay(availableToWithdraw)} sBTC`,
      change: "Ready for withdrawal",
      changeType: "neutral" as const,
      icon: Wallet,
    },
  ];

  // Chart data
  const chartData = allStreams && allStreams.length > 0 ?
    allStreams.slice(0, 5).map((stream, i) => ({
      date: `Stream ${i + 1}`,
      balance: Number(microToDisplay(stream.vestedAmount)),
    })) : [];

  const loading = blockLoading || streamsLoading;

  if (loading && !blockHeight) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="ml-3 text-muted-foreground">Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your Bitcoin streaming activity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
            onClick={() => refetch()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Updating...' : 'Refresh Data'}
          </Button>

          {userAddress && (
            <Button asChild className="bg-brand-pink hover:bg-brand-pink/90 text-white">
              <Link href="/dashboard/streams/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Stream
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          {hasOutgoing && (
            <TabsTrigger
              value="sending"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
            >
              <Send className="h-4 w-4 mr-2" />
              Sending ({totalOutgoing})
            </TabsTrigger>
          )}
          {hasIncoming && (
            <TabsTrigger
              value="receiving"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Receiving ({totalIncoming})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest Bitcoin streaming activity and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allStreams && allStreams.length > 0 ? (
                    allStreams.slice(0, 5).map((stream) => (
                      <Link
                        key={stream.id.toString()}
                        href={`/dashboard/streams/${stream.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:border-brand-pink/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-brand-pink/10 rounded-full">
                            <Activity className="h-4 w-4 text-brand-pink" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Stream #{stream.id.toString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stream.recipient.slice(0, 8)}...{stream.recipient.slice(-6)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-teal">
                            {microToDisplay(stream.vestedAmount)} sBTC
                          </p>
                          <Badge variant={stream.status === StreamStatus.ACTIVE ? 'default' : 'secondary'} className="text-xs">
                            {stream.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No streams yet</p>
                      <p className="text-xs">Create your first stream to see activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your Bitcoin streams and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full justify-start bg-brand-pink hover:bg-brand-pink/90 text-white"
                    asChild
                  >
                    <Link href="/dashboard/streams/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Stream
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                    asChild
                  >
                    <Link href="/dashboard/streams">
                      <Activity className="mr-2 h-4 w-4" />
                      Manage Streams
                    </Link>
                  </Button>
                  {userAddress && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                      <p className="text-sm font-mono">{userAddress.slice(0, 12)}...{userAddress.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Block Height: {blockHeight || '...'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Streaming Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Streaming Overview</CardTitle>
              <CardDescription>
                Your Bitcoin streaming trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.some(d => d.balance > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tickLine={false}
                      />
                      <YAxis
                        className="text-xs"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value.toFixed(6)} sBTC`, 'Streamed']}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#e91e63"
                        strokeWidth={2}
                        dot={{ fill: '#e91e63', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#e91e63', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>No streaming data available</p>
                    <p className="text-sm">Create your first stream to see trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sending Tab */}
        {hasOutgoing && (
          <TabsContent value="sending" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Streams I'm Sending</CardTitle>
                    <CardDescription>
                      Manage outgoing Bitcoin streams and obligation NFTs
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-pink">{microToDisplay(totalSending)} sBTC</p>
                    <p className="text-xs text-muted-foreground">Total locked</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {outgoingStreams.map((stream) => (
                    <Link
                      key={stream.id.toString()}
                      href={`/dashboard/streams/${stream.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-pink/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-brand-pink/10 rounded-full">
                          <ArrowUpRight className="h-5 w-5 text-brand-pink" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Stream #{stream.id.toString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            To: {stream.recipient.slice(0, 8)}...{stream.recipient.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{microToDisplay(stream.amount)} sBTC</p>
                        <Badge variant={stream.status === StreamStatus.ACTIVE ? 'default' : 'secondary'} className="text-xs">
                          {stream.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Receiving Tab */}
        {hasIncoming && (
          <TabsContent value="receiving" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Streams I'm Receiving</CardTitle>
                    <CardDescription>
                      View incoming Bitcoin streams and withdraw funds
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-teal">{microToDisplay(availableToWithdraw)} sBTC</p>
                    <p className="text-xs text-muted-foreground">Available to withdraw</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableToWithdraw > BigInt(0) && (
                    <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white">
                      <Wallet className="mr-2 h-4 w-4" />
                      Withdraw All ({microToDisplay(availableToWithdraw)} sBTC)
                    </Button>
                  )}

                  {incomingStreams.map((stream) => (
                    <Link
                      key={stream.id.toString()}
                      href={`/dashboard/streams/${stream.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-teal/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-brand-teal/10 rounded-full">
                          <ArrowDownLeft className="h-5 w-5 text-brand-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Stream #{stream.id.toString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {stream.sender.slice(0, 8)}...{stream.sender.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-brand-teal">
                          {microToDisplay(stream.withdrawableAmount)} sBTC
                        </p>
                        <Badge variant={stream.status === StreamStatus.ACTIVE ? 'default' : 'secondary'} className="text-xs">
                          {stream.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Getting Started Card (for new users) */}
      {(!allStreams || allStreams.length === 0) && userAddress && (
        <Card className="border-brand-pink/20 bg-brand-pink/5">
          <CardHeader>
            <CardTitle className="text-brand-pink">🚀 Get Started with BitPay</CardTitle>
            <CardDescription>
              Create your first Bitcoin stream in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  1
                </div>
                <p className="text-sm font-medium">Connect Wallet</p>
                <p className="text-xs text-muted-foreground">Link your Stacks wallet</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  2
                </div>
                <p className="text-sm font-medium">Create Stream</p>
                <p className="text-xs text-muted-foreground">Set recipient and amount</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  3
                </div>
                <p className="text-sm font-medium">Start Streaming</p>
                <p className="text-xs text-muted-foreground">Bitcoin flows automatically</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button asChild className="bg-brand-pink hover:bg-brand-pink/90 text-white">
                <Link href="/dashboard/streams/create">
                  Create Your First Stream
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
