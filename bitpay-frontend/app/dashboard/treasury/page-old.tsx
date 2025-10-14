"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Shield,
  UserCog,
  BarChart3,
  XCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import walletService from "@/lib/wallet/wallet-service";
import { useTreasuryFeeBps, useTotalFeesCollected, useBitPayRead } from "@/hooks/use-bitpay-read";
import { useBitPayWrite } from "@/hooks/use-bitpay-write";
import { microToDisplay, CONTRACT_NAMES } from "@/lib/contracts/config";
import { uintCV, principalCV } from "@stacks/transactions";
import { toast } from "sonner";
import { AccessControlPanel } from "@/components/dashboard/AccessControlPanel";
import { ProposeAdminTransferModal } from "@/components/dashboard/modals/ProposeAdminTransferModal";
import { AcceptAdminTransferModal } from "@/components/dashboard/modals/AcceptAdminTransferModal";
import { WithdrawFeesModal } from "@/components/dashboard/modals/WithdrawFeesModal";

export default function TreasuryPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newFeeBps, setNewFeeBps] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRecipient, setWithdrawRecipient] = useState("");
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showWithdrawFeesModal, setShowWithdrawFeesModal] = useState(false);

  // Read treasury data
  const { data: feeBps, isLoading: loadingFee, refetch: refetchFee } = useTreasuryFeeBps();
  const { data: totalFees, isLoading: loadingTotal, refetch: refetchTotal } = useTotalFeesCollected();
  const { data: treasuryBalance, isLoading: loadingBalance, refetch: refetchBalance } = useBitPayRead(
    CONTRACT_NAMES.TREASURY,
    'get-treasury-balance'
  );

  // Check if user is admin
  const { data: isAdminData } = useBitPayRead(
    CONTRACT_NAMES.ACCESS_CONTROL,
    'is-admin',
    userAddress ? [principalCV(userAddress)] : [],
    !!userAddress
  );

  // Write operations
  const { write: setFee, isLoading: isSettingFee } = useBitPayWrite(
    CONTRACT_NAMES.TREASURY,
    'set-fee-bps'
  );
  const { write: withdraw, isLoading: isWithdrawing } = useBitPayWrite(
    CONTRACT_NAMES.TREASURY,
    'withdraw'
  );

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
      if (address) {
        setWithdrawRecipient(address);
      }
    };
    loadWallet();
  }, []);

  useEffect(() => {
    if (isAdminData !== null && isAdminData !== undefined) {
      setIsAdmin(!!isAdminData);
    }
  }, [isAdminData]);

  const handleSetFee = async () => {
    const bps = parseInt(newFeeBps);
    if (isNaN(bps) || bps < 0 || bps > 10000) {
      toast.error("Invalid fee", {
        description: "Fee must be between 0 and 10000 basis points (0-100%)",
      });
      return;
    }

    const txId = await setFee(uintCV(bps));
    if (txId) {
      toast.success("Fee Updated!", {
        description: `New fee: ${(bps / 100).toFixed(2)}%`,
      });
      setNewFeeBps("");
      setTimeout(() => refetchFee(), 3000);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (!withdrawRecipient) {
      toast.error("Recipient address required");
      return;
    }

    const amountMicro = BigInt(Math.floor(amount * 1_000_000));
    const txId = await withdraw(uintCV(amountMicro), principalCV(withdrawRecipient));
    if (txId) {
      toast.success("Withdrawal Initiated!", {
        description: `${amount} sBTC to ${withdrawRecipient.slice(0, 8)}...`,
      });
      setWithdrawAmount("");
      setTimeout(() => {
        refetchBalance();
        refetchTotal();
      }, 3000);
    }
  };

  const currentFeePercent = feeBps ? Number(feeBps) / 100 : 0;

  // Mock data for fee collection over time
  const feeChartData = [
    { date: 'Jan', fees: 0.05 },
    { date: 'Feb', fees: 0.12 },
    { date: 'Mar', fees: 0.18 },
    { date: 'Apr', fees: 0.24 },
    { date: 'May', fees: 0.31 },
    { date: 'Jun', fees: Number(microToDisplay(totalFees || BigInt(0))) },
  ];

  // Mock data for cancellation fees
  const cancellationStats = {
    total: 0.05, // 5% of total fees from cancellations
    count: 12,
    avgFee: 0.004167,
  };

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
        <p className="text-muted-foreground">Please connect your wallet</p>
      </div>
    );
  }

  if (loadingFee && !feeBps) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-pink" />
        <p className="ml-3 text-muted-foreground">Loading treasury data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treasury Management</h1>
          <p className="text-muted-foreground">
            Fee collection and treasury administration
          </p>
        </div>
        {isAdmin ? (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        ) : (
          <Badge variant="secondary">
            <AlertCircle className="h-4 w-4 mr-1" />
            View Only
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Fee</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-pink">
              {currentFeePercent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {feeBps?.toString() || "0"} basis points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-teal">
              {treasuryBalance ? microToDisplay(treasuryBalance as bigint) : "0.000000"} sBTC
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalFees ? microToDisplay(totalFees) : "0.000000"} sBTC
            </div>
            <p className="text-xs text-muted-foreground">
              All-time collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Fees</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {cancellationStats.total.toFixed(6)} sBTC
            </div>
            <p className="text-xs text-muted-foreground">
              {cancellationStats.count} cancellations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger
                value="manage"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </TabsTrigger>
              <TabsTrigger
                value="access-control"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Control
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Fee Collection Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Over Time</CardTitle>
              <CardDescription>
                Monthly fee revenue from stream creation and cancellations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tickLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(6)} sBTC`, 'Fees']}
                    />
                    <Line
                      type="monotone"
                      dataKey="fees"
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

          {/* Cancellation Fee Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Fee Statistics</CardTitle>
              <CardDescription>
                1% fee charged on unvested amounts when streams are cancelled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-red-500">{cancellationStats.total.toFixed(6)} sBTC</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Cancellations</p>
                  <p className="text-2xl font-bold">{cancellationStats.count}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Fee</p>
                  <p className="text-2xl font-bold">{cancellationStats.avgFee.toFixed(6)} sBTC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        {isAdmin && (
          <TabsContent value="manage" className="space-y-6">
            {/* Fee Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Fee Management
                </CardTitle>
                <CardDescription>
                  Update the protocol fee charged on stream creations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-bps">New Fee (Basis Points)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fee-bps"
                      type="number"
                      placeholder="50 (0.5%)"
                      value={newFeeBps}
                      onChange={(e) => setNewFeeBps(e.target.value)}
                      min="0"
                      max="10000"
                    />
                    <Button
                      onClick={handleSetFee}
                      disabled={isSettingFee || !newFeeBps}
                      className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                    >
                      {isSettingFee ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Fee"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1 basis point = 0.01%. Max 10000 bps (100%).
                  </p>
                </div>

                <Separator />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Fee Examples:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 10 bps = 0.10% fee</li>
                    <li>• 50 bps = 0.50% fee</li>
                    <li>• 100 bps = 1.00% fee (cancellation fee)</li>
                    <li>• 500 bps = 5.00% fee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-brand-pink" />
                  Withdraw Collected Fees
                </CardTitle>
                <CardDescription>
                  Transfer accumulated cancellation fees from the treasury
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Fees Available</p>
                  <p className="text-3xl font-bold text-brand-pink">
                    {totalFees ? microToDisplay(totalFees as bigint) : "0.00000000"} sBTC
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Treasury Balance: {treasuryBalance ? microToDisplay(treasuryBalance as bigint) : "0"} sBTC
                  </p>
                </div>

                <Button
                  onClick={() => setShowWithdrawFeesModal(true)}
                  disabled={!totalFees || Number(microToDisplay(totalFees as bigint)) === 0}
                  className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white"
                  size="lg"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Withdraw Fees
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Fees are collected from stream cancellations (1% of unvested amount)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Access Control Tab */}
        {isAdmin && (
          <TabsContent value="access-control">
            <AccessControlPanel />
          </TabsContent>
        )}

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Admin Transfer
                </CardTitle>
                <CardDescription>
                  Transfer treasury admin rights to another address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Current Admin</Label>
                  <p className="font-mono text-sm mt-1">{userAddress}</p>
                </div>

                <Button
                  onClick={() => setShowProposeModal(true)}
                  className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Propose Admin Transfer
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Two-step process: You propose, new admin accepts
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Non-Admin View */}
      {!isAdmin && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              You need admin privileges to manage treasury settings and withdraw funds.
              Contact the protocol administrator to request access.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Modals */}
      {showProposeModal && (
        <ProposeAdminTransferModal
          isOpen={showProposeModal}
          onClose={() => setShowProposeModal(false)}
          currentAdmin={userAddress || ""}
        />
      )}

      {showAcceptModal && (
        <AcceptAdminTransferModal
          isOpen={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          currentAdmin={userAddress || ""}
        />
      )}

      {showWithdrawFeesModal && (
        <WithdrawFeesModal
          isOpen={showWithdrawFeesModal}
          onClose={() => setShowWithdrawFeesModal(false)}
          totalFeesAvailable={totalFees ? microToDisplay(totalFees as bigint) : "0"}
          onSuccess={() => {
            refetchTotal();
            refetchBalance();
          }}
        />
      )}
    </div>
  );
}
