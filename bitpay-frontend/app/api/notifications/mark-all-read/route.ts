/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { clientPromise } from '@/lib/db';

export async function POST() {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;

    // Update all unread notifications to read
    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection('notifications')
      .updateMany(
        { userId, status: 'unread' },
        { $set: { status: 'read', readAt: new Date() } }
      );

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark all notifications as read',
      },
      { status: 500 }
    );
  }
}
