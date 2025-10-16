/**
 * GET /api/marketplace/listings
 * Fetch all active marketplace listings from MongoDB
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

    // Fetch all active listings with stream data using aggregation
    const listings = await db
      .collection('marketplace_listings')
      .aggregate([
        { $match: { status: 'active' } },
        {
          $lookup: {
            from: 'streams',
            localField: 'streamId',
            foreignField: 'streamId',
            as: 'stream',
          },
        },
        { $unwind: '$stream' },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    console.log(`📊 Fetched ${listings.length} active marketplace listings with stream data`);

    return NextResponse.json({
      success: true,
      listings: listings.map((listing) => ({
        streamId: listing.streamId,
        seller: listing.seller,
        price: listing.price,
        listedAt: listing.listedAt,
        blockHeight: listing.blockHeight,
        txHash: listing.txHash,
        // Include stream data
        stream: {
          amount: listing.stream.amount,
          startBlock: listing.stream.startBlock,
          endBlock: listing.stream.endBlock,
          recipient: listing.stream.recipient,
          withdrawn: listing.stream.withdrawn || '0',
          status: listing.stream.status,
        },
      })),
    });
  } catch (error) {
    console.error('❌ Failed to fetch marketplace listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}
