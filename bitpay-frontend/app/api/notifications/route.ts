/**
 * GET /api/notifications
 * Fetch user's notifications with filtering and pagination
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getUserNotifications,
  getUnreadCount,
} from '@/lib/notifications/notification-service';

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const status = searchParams.get('status') as
      | 'unread'
      | 'read'
      | 'archived'
      | null;

    // Fetch notifications
    const notifications = await getUserNotifications(userId, {
      limit,
      skip,
      status: status || undefined,
    });

    // Get unread count
    const unreadCount = await getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  }
}
