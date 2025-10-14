/**
 * GET /api/notifications/unread-count
 * Get user's unread notification count
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUnreadCount } from '@/lib/notifications/notification-service';

export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;

    // Get unread count
    const count = await getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch unread count',
      },
      { status: 500 }
    );
  }
}
