import { getFirebaseDb } from './firestoreClient';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import { UserActivity } from './activityTypes';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  memberSince: string;
  projectCount: number;
  lastActive: string;
  activities?: UserActivity[];
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export interface UserStats {
  projectCount: number;
  totalNodes: number;
  totalEdges: number;
  memberSince: string;
  lastActive: string;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      console.error('Firebase not initialized');
      return null;
    }
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio || '',
        memberSince: data.memberSince || 'September 2025',
        projectCount: data.projectCount || 0,
        lastActive: data.lastActive || new Date().toISOString(),
        preferences: data.preferences || {
          theme: 'system',
          notifications: true
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Create or update user profile in Firestore
 */
export async function createOrUpdateUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<UserProfile> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const userRef = doc(db, 'users', user.uid);

    // Check if user already exists
    const existingUser = await getDoc(userRef);

    const profileData: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || undefined,
      lastActive: new Date().toISOString(),
      ...additionalData
    };

    if (existingUser.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...profileData,
        lastActive: serverTimestamp()
      });

      // Return updated profile
      const updatedProfile = await getUserProfile(user.uid);
      return updatedProfile!;
    } else {
      // Create new user
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        bio: '',
        memberSince: 'September 2025', // Default as requested
        projectCount: 0,
        lastActive: new Date().toISOString(),
        activities: [],
        preferences: {
          theme: 'system',
          notifications: true
        },
        ...additionalData
      };

      await setDoc(userRef, {
        ...newProfile,
        memberSince: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      return newProfile;
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Update user display name
 */
export async function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      displayName,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error;
  }
}

/**
 * Update user bio
 */
export async function updateUserBio(uid: string, bio: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      bio: bio.trim(),
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(uid: string): Promise<UserStats> {
  try {
    const profile = await getUserProfile(uid);

    if (!profile) {
      return {
        projectCount: 0,
        totalNodes: 0,
        totalEdges: 0,
        memberSince: 'September 2025',
        lastActive: new Date().toISOString()
      };
    }

    // Get project statistics from projects collection
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const projectsQuery = query(
      collection(db, 'projects'),
      where('userId', '==', uid)
    );

    const projectsSnapshot = await getDocs(projectsQuery);
    let totalNodes = 0;
    let totalEdges = 0;

    projectsSnapshot.forEach(doc => {
      const project = doc.data();
      if (project.data) {
        totalNodes += project.data.nodes?.length || 0;
        totalEdges += project.data.edges?.length || 0;
      }
    });

    return {
      projectCount: projectsSnapshot.size,
      totalNodes,
      totalEdges,
      memberSince: profile.memberSince,
      lastActive: profile.lastActive
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      projectCount: 0,
      totalNodes: 0,
      totalEdges: 0,
      memberSince: 'September 2025',
      lastActive: new Date().toISOString()
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase not initialized');
    }
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      preferences,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}