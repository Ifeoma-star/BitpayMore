"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  UserCog,
  BarChart3,
  XCircle,
  FileText,
  Plus
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useTreasuryFeeBps, useTotalFeesCollected, useBitPayRead } from "@/hooks/use-bitpay-read";
import { microToDisplay, CONTRACT_NAMES } from "@/lib/contracts/config";
import { principalCV } from "@stacks/transactions";
import { AccessControlPanel } from "@/components/dashboard/AccessControlPanel";
import { useBlockHeight } from "@/hooks/use-block-height";
import {
  useMultiSigConfig,
  useIsMultiSigAdmin,
  useAdminCount,
  useApproveWithdrawal,
  useExecuteWithdrawal,
  useProposeAddAdmin,
  useProposeRemoveAdmin,
} from "@/hooks/use-multisig-treasury";
import { ProposalCard } from "@/components/dashboard/treasury/ProposalCard";
import { ProposeWithdrawalModal } from "@/components/dashboard/treasury/ProposeWithdrawalModal";
import { MultiSigAdminList } from "@/components/dashboard/treasury/MultiSigAdminList";
import { toast } from "sonner";

export default function TreasuryPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProposeWithdrawalModal, setShowProposeWithdrawalModal] = useState(false);

  // Mock proposals data (will be fetched from contract after deployment)
  const [mockProposals] = useState<any[]>([
    // Example structure for when data is available:
    // {
    //   id: 1,
    //   proposer: "SP1...",
    //   amount: BigInt(50000000), // 0.5 sBTC
    //   recipient: "SP2...",
    //   approvals: ["SP1...", "SP2..."],
    //   executed: false,
    //   proposedAt: 100000,
    //   expiresAt: 101008,
    //   description: "Monthly operations budget"
    // }
  ]);

  // Read treasury data
  const { data: feeBps } = useTreasuryFeeBps();
  const { data: totalFees } = useTotalFeesCollected();
  const { data: treasuryBalance } = useBitPayRead(
    CONTRACT_NAMES.TREASURY,
    'get-treasury-balance'
  );

  // Multi-sig data
  const { blockHeight } = useBlockHeight(30000);
  const { data: multiSigConfig } = useMultiSigConfig();
  const { data: isMultiSigAdmin } = useIsMultiSigAdmin(userAddress);
  const { data: adminCount } = useAdminCount();
  const { approve: approveProposal, isLoading: isApproving } = useApproveWithdrawal();
  const { execute: executeProposal, isLoading: isExecuting } = useExecuteWithdrawal();
  const { proposeAdd: proposeAddAdmin } = useProposeAddAdmin();
  const { proposeRemove: proposeRemoveAdmin } = useProposeRemoveAdmin();

  // Check if user is admin (legacy)
  const { data: isAdminData } = useBitPayRead(
    CONTRACT_NAMES.ACCESS_CONTROL,
    'is-admin',
    userAddress ? [principalCV(userAddress)] : [],
    !!userAddress
  );

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  useEffect(() => {
    if (isAdminData !== null && isAdminData !== undefined) {
      setIsAdmin(!!isAdminData);
    }
  }, [isAdminData]);

  const handleApprove = async (proposalId: number) => {
    const txId = await approveProposal(proposalId);
    if (txId) {
      toast.success("Proposal Approved!", {
        description: `Your approval has been recorded`,
      });
    }
  };

  const handleExecute = async (proposalId: number) => {
    const txId = await executeProposal(proposalId);
    if (txId) {
      toast.success("Withdrawal Executed!", {
        description: "Funds have been transferred",
      });
    }
  };

  const handleProposeAddAdmin = async () => {
    // Will open modal in future iteration
    toast.info("Add Admin Modal", {
      description: "Coming soon after contract deployment",
    });
  };

  const handleProposeRemoveAdmin = async (address: string) => {
    // Will be implemented after contract deployment
    toast.info("Remove Admin Proposal", {
      description: `Proposing to remove ${address.slice(0, 8)}...`,
    });
  };

  const currentFeePercent = feeBps ? Number(feeBps) / 100 : 0;
  const treasuryBalanceDisplay = treasuryBalance ? microToDisplay(treasuryBalance as bigint) : "0.000000";

  // Mock admin list (will be fetched from contract)
  const mockAdmins = [
    { address: userAddress || "", isActive: true },
    { address: "", isActive: false },
    { address: "", isActive: false },
    { address: "", isActive: false },
    { address: "", isActive: false },
  ];

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
        <p className="text-muted-foreground">Please connect your wallet</p>
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
            Multi-sig fee collection and treasury administration
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isMultiSigAdmin ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Multi-Sig Admin
            </Badge>
          ) : isAdmin ? (
            <Badge className="bg-blue-500 text-white">
              <Shield className="h-4 w-4 mr-1" />
              Legacy Admin
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-4 w-4 mr-1" />
              View Only
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-teal">
              {treasuryBalanceDisplay} sBTC
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Multi-Sig Admins</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-pink">
              {adminCount || 1}/5
            </div>
            <p className="text-xs text-muted-foreground">
              3 approvals required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {mockProposals.filter(p => !p.executed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="proposals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            Proposals ({mockProposals.length})
          </TabsTrigger>
          <TabsTrigger
            value="multisig"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Shield className="h-4 w-4 mr-2" />
            Multi-Sig ({adminCount || 1}/5)
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {/* TODO: Uncomment after deployment for role-based access */}
          {/* {isAdmin && ( */}
            <TabsTrigger
              value="access-control"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access Control
            </TabsTrigger>
          {/* )} */}
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Withdrawal Proposals</CardTitle>
                  <CardDescription>
                    3-of-5 multi-sig • 24h timelock (144 blocks) • 100 sBTC daily limit
                  </CardDescription>
                </div>
                {/* TODO: Uncomment after deployment for role-based access */}
                {/* {isMultiSigAdmin && ( */}
                  <Button
                    onClick={() => setShowProposeWithdrawalModal(true)}
                    className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Proposal
                  </Button>
                {/* )} */}
              </div>
            </CardHeader>
            <CardContent>
              {mockProposals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {/* TODO: Uncomment after deployment for role-based access */}
                    {/* {isMultiSigAdmin
                      ? "Create your first withdrawal proposal to get started"
                      : "No withdrawal proposals have been created yet"} */}
                    Create your first withdrawal proposal to get started
                  </p>
                  {/* TODO: Uncomment after deployment for role-based access */}
                  {/* {isMultiSigAdmin && ( */}
                    <Button
                      onClick={() => setShowProposeWithdrawalModal(true)}
                      className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Proposal
                    </Button>
                  {/* )} */}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      currentBlock={blockHeight}
                      userAddress={userAddress}
                      isUserAdmin={!!isMultiSigAdmin}
                      onApprove={handleApprove}
                      onExecute={handleExecute}
                      isApproving={isApproving}
                      isExecuting={isExecuting}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Sig Tab */}
        <TabsContent value="multisig" className="space-y-6">
          {/* TODO: Uncomment after deployment for role-based access: isCurrentUserAdmin={!!isMultiSigAdmin} */}
          <MultiSigAdminList
            admins={mockAdmins}
            totalSlots={5}
            requiredSignatures={3}
            currentUserAddress={userAddress}
            isCurrentUserAdmin={true}
            onProposeAdd={handleProposeAddAdmin}
            onProposeRemove={handleProposeRemoveAdmin}
          />

          {/* Multi-Sig Config Info */}
          {multiSigConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Current multi-sig treasury settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Required Signatures</p>
                    <p className="text-2xl font-bold">{multiSigConfig.requiredSignatures}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timelock</p>
                    <p className="text-2xl font-bold">{multiSigConfig.timelockBlocks}</p>
                    <p className="text-xs text-muted-foreground">~24 hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Limit</p>
                    <p className="text-2xl font-bold">
                      {microToDisplay(multiSigConfig.dailyLimit)}
                    </p>
                    <p className="text-xs text-muted-foreground">sBTC per day</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Withdrawn Today</p>
                    <p className="text-2xl font-bold">
                      {microToDisplay(multiSigConfig.withdrawnToday)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proposal Expiry</p>
                    <p className="text-2xl font-bold">{multiSigConfig.proposalExpiryBlocks}</p>
                    <p className="text-xs text-muted-foreground">~7 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Overview</CardTitle>
              <CardDescription>
                Fee collection and treasury statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-sm text-muted-foreground">Current Fee Rate</span>
                  <span className="font-semibold">{currentFeePercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-sm text-muted-foreground">Treasury Balance</span>
                  <span className="font-semibold">{treasuryBalanceDisplay} sBTC</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-sm text-muted-foreground">Total Fees Collected</span>
                  <span className="font-semibold">
                    {totalFees ? microToDisplay(totalFees) : "0"} sBTC
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-muted-foreground">Multi-Sig Status</span>
                  <Badge className="bg-green-500 text-white">
                    {adminCount || 1}/5 Admins Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        {/* TODO: Uncomment after deployment for role-based access */}
        {/* {isAdmin && ( */}
          <TabsContent value="access-control">
            <AccessControlPanel />
          </TabsContent>
        {/* )} */}
      </Tabs>

      {/* Modals */}
      <ProposeWithdrawalModal
        isOpen={showProposeWithdrawalModal}
        onClose={() => setShowProposeWithdrawalModal(false)}
        treasuryBalance={treasuryBalanceDisplay}
        onSuccess={() => {
          // Refetch proposals
          toast.success("Proposal created successfully!");
        }}
      />
    </div>
  );
}
