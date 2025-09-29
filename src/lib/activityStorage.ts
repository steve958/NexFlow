import { getFirebaseDb } from './firestoreClient';
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { UserActivity, ActivityAction } from './activityTypes';

const MAX_ACTIVITIES = 5; // Store only last 5 activities

/**
 * Log a new user activity
 */
export async function logUserActivity(
  userId: string,
  action: ActivityAction,
  details: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('Firebase not initialized');
      return false;
    }

    const userRef = doc(db, 'users', userId);

    // Get current activities to manage the limit
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User document does not exist');
      return false;
    }

    const userData = userDoc.data();
    const currentActivities: UserActivity[] = userData?.activities || [];

    // Create new activity - ensure no undefined values
    const newActivity: UserActivity = {
      id: crypto.randomUUID(),
      userId,
      action,
      details: details || '',
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
      timestamp: new Date().toISOString()
    };

    // Calculate the new activities array
    let updatedActivities = [...currentActivities];

    // If we have 5 activities, remove the oldest one
    if (updatedActivities.length >= MAX_ACTIVITIES) {
      // Sort by timestamp to ensure we're removing the oldest
      updatedActivities.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      // Remove the oldest activity
      updatedActivities = updatedActivities.slice(1);
    }

    // Add the new activity
    updatedActivities.push(newActivity);

    // Update the document with the new activities array
    await updateDoc(userRef, {
      activities: updatedActivities,
      lastActive: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error logging user activity:', error);
    return false;
  }
}

/**
 * Get user activities (last 5)
 */
export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const activities: UserActivity[] = userDoc.data().activities || [];

    // Sort by timestamp (newest first) and return last 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_ACTIVITIES);
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
}

/**
 * Clear all user activities
 */
export async function clearUserActivities(userId: string): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('Firebase not initialized');
      return false;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      activities: [],
      lastActive: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error clearing user activities:', error);
    return false;
  }
}

/**
 * Helper function to format activity time
 */
export function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}