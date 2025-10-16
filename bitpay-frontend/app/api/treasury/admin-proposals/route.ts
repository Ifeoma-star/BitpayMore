/**
 * GET /api/treasury/admin-proposals
 * Fetches all pending admin proposals from database
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET(request: Request) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Fetch all pending (non-executed) admin proposals
    const proposals = await db
      .collection('admin_proposals')
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform MongoDB documents to match expected format
    const formattedProposals = proposals.map((p) => ({
      id: p.proposalId,
      proposalId: p.proposalId,
      proposer: p.proposer,
      action: p.action,
      targetAdmin: p.targetAdmin,
      approvals: p.approvals || [],
      executed: p.status === 'executed',
      proposedAt: p.proposedAt,
      expiresAt: p.expiresAt,
      txHash: p.txHash,
      blockHeight: p.blockHeight,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      proposals: formattedProposals,
    });
  } catch (error) {
    console.error('Failed to fetch admin proposals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proposals',
      },
      { status: 500 }
    );
  }
}
