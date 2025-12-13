import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '../contexts/AuthContext';

/**
 * USER SERVICE
 * Firestore operations for users collection
 */
export const userService = {
  /**
   * Get user profile by UID
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        console.warn(`User profile not found: ${uid}`);
        return null;
      }
      
      return userSnapshot.data() as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User profile updated');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Add friend to friends list
   */
  async addFriend(uid: string, friendId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(friendId),
      });
      console.log(`✅ Added friend: ${friendId}`);
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  },

  /**
   * Remove friend
   */
  async removeFriend(uid: string, friendId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendId),
      });
      console.log(`✅ Removed friend: ${friendId}`);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },

  /**
   * Block user
   */
  async blockUser(uid: string, blockedUserId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        blockedUsers: arrayUnion(blockedUserId),
      });
      console.log(`✅ Blocked user: ${blockedUserId}`);
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },
};

/**
 * CLIP SERVICE
 * Firestore operations for clips collection
 */
export interface Clip {
  id: string;
  movieId: number;
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  source: 'youtube' | 'tiktok' | 'custom';
  likes: number;
  views: number;
  createdAt: Timestamp;
  genre: string[];
}

export const clipService = {
  /**
   * Get clips feed (with pagination)
   */
  async getClipsFeed(pageSize: number = 10): Promise<Clip[]> {
    try {
      const q = query(
        collection(db, 'clips'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Clip[];
    } catch (error) {
      console.error('Error fetching clips feed:', error);
      throw error;
    }
  },

  /**
   * Get clips by genre
   */
  async getClipsByGenre(genre: string, pageSize: number = 10): Promise<Clip[]> {
    try {
      const q = query(
        collection(db, 'clips'),
        where('genre', 'array-contains', genre),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Clip[];
    } catch (error) {
      console.error('Error fetching clips by genre:', error);
      throw error;
    }
  },

  /**
   * Get clips by movie ID
   */
  async getClipsByMovie(movieId: number): Promise<Clip[]> {
    try {
      const q = query(
        collection(db, 'clips'),
        where('movieId', '==', movieId),
        orderBy('likes', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Clip[];
    } catch (error) {
      console.error('Error fetching clips by movie:', error);
      throw error;
    }
  },

  /**
   * Like a clip
   */
  async likeClip(uid: string, clipId: string): Promise<void> {
    try {
      // Add to user's likedClipIds
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        likedClipIds: arrayUnion(clipId),
      });
      
      // Increment clip likes count
      const clipDocRef = doc(db, 'clips', clipId);
      await updateDoc(clipDocRef, {
        likes: increment(1),
      });
      
      console.log(`✅ Liked clip: ${clipId}`);
    } catch (error) {
      console.error('Error liking clip:', error);
      throw error;
    }
  },

  /**
   * Unlike a clip
   */
  async unlikeClip(uid: string, clipId: string): Promise<void> {
    try {
      // Remove from user's likedClipIds
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        likedClipIds: arrayRemove(clipId),
      });
      
      // Decrement clip likes count
      const clipDocRef = doc(db, 'clips', clipId);
      await updateDoc(clipDocRef, {
        likes: increment(-1),
      });
      
      console.log(`✅ Unliked clip: ${clipId}`);
    } catch (error) {
      console.error('Error unliking clip:', error);
      throw error;
    }
  },

  /**
   * Record clip view
   */
  async recordView(clipId: string): Promise<void> {
    try {
      const clipDocRef = doc(db, 'clips', clipId);
      await updateDoc(clipDocRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error('Error recording view:', error);
      // Don't throw - view tracking failure shouldn't break UX
    }
  },

  /**
   * Add comment to clip
   */
  async addComment(
    clipId: string,
    uid: string,
    userName: string,
    text: string
  ): Promise<string> {
    try {
      const commentsRef = collection(db, 'clips', clipId, 'comments');
      const docRef = await addDoc(commentsRef, {
        userId: uid,
        userName,
        text,
        timestamp: serverTimestamp(),
        likes: 0,
      });
      
      console.log(`✅ Added comment: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Get clip comments
   */
  async getComments(clipId: string, pageSize: number = 10): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'clips', clipId, 'comments'),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
};

/**
 * WATCH PARTY SERVICE
 * Firestore operations for watch parties
 */
export interface WatchParty {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  members: string[]; // Array of user IDs
  currentClipId: string;
  playbackTime: number; // seconds
  isPlaying: boolean;
  playlist: string[]; // Array of clip IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Timestamp;
  reactions: {[emoji: string]: string[]}; // emoji -> [userIds]
  isDeleted?: boolean;
}

export const watchPartyService = {
  /**
   * Create watch party room
   */
  async createRoom(
    creatorId: string,
    title: string,
    description: string,
    firstClipId: string,
    isPublic: boolean = false
  ): Promise<string> {
    try {
      const roomRef = await addDoc(collection(db, 'watchParties'), {
        creatorId,
        title,
        description,
        members: [creatorId],
        currentClipId: firstClipId,
        playbackTime: 0,
        isPlaying: false,
        playlist: [firstClipId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic,
      });
      
      console.log(`✅ Created watch party: ${roomRef.id}`);
      return roomRef.id;
    } catch (error) {
      console.error('Error creating watch party:', error);
      throw error;
    }
  },

  /**
   * Join watch party room
   */
  async joinRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomDocRef = doc(db, 'watchParties', roomId);
      await updateDoc(roomDocRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Joined room: ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  /**
   * Leave watch party room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomDocRef = doc(db, 'watchParties', roomId);
      await updateDoc(roomDocRef, {
        members: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Left room: ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  },

  /**
   * Send chat message
   */
  async sendMessage(
    roomId: string,
    userId: string,
    userName: string,
    text: string
  ): Promise<string> {
    try {
      const messagesRef = collection(db, 'watchParties', roomId, 'messages');
      const docRef = await addDoc(messagesRef, {
        userId,
        userName,
        text,
        timestamp: serverTimestamp(),
        reactions: {},
      });
      
      console.log(`✅ Message sent: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get room messages
   */
  async getMessages(roomId: string, pageSize: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'watchParties', roomId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Update playback time
   */
  async updatePlayback(
    roomId: string,
    playbackTime: number,
    isPlaying: boolean
  ): Promise<void> {
    try {
      const roomDocRef = doc(db, 'watchParties', roomId);
      await updateDoc(roomDocRef, {
        playbackTime,
        isPlaying,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating playback:', error);
      throw error;
    }
  },
};
