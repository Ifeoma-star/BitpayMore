/**
 * GET/POST /api/notifications/preferences
 * Manage user notification preferences
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/lib/notifications/notification-service';

/**
 * GET - Fetch user's notification preferences
 */
export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;

    // Get preferences
    const preferences = await getUserPreferences(userId);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notification preferences',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Update user's notification preferences
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).address || (session.user as any).id;

    // Parse request body
    const updates = await request.json();

    // Validate updates
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid preferences data',
        },
        { status: 400 }
      );
    }

    // Update preferences
    const preferences = await updateUserPreferences(userId, updates);

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification preferences',
      },
      { status: 500 }
    );
  }
}
