/**
 * POST /api/notifications/[id]/mark-read
 * Mark a notification as read
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { markAsRead } from '@/lib/notifications/notification-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;
    const notificationId = params.id;

    // Mark notification as read
    const success = await markAsRead(notificationId, userId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found or already read',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark notification as read',
      },
      { status: 500 }
    );
  }
}
