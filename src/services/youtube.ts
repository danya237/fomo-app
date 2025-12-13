/**
 * FOMO YouTube Shorts Service
 * 
 * Integrates with YouTube Data API v3 to search and fetch short video clips
 * Caches results in Firestore to minimize API quota usage
 * 
 * API Key: Set in .env.local as EXPO_PUBLIC_YOUTUBE_API_KEY
 * Quota: 10,000 credits/day (free tier)
 * Cost per search: ~100 credits
 */

import axios, { AxiosInstance } from 'axios';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

interface YouTubeShort {
  id: string; // YouTube video ID
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  embeddableUrl: string;
  duration?: number;
  viewCount?: number;
}

interface ClipCacheEntry {
  id: string;
  movieTitle: string;
  clips: YouTubeShort[];
  createdAt: Timestamp;
  expiresAt: Timestamp;
  quotaUsed: number;
}

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SEARCH_QUOTA_PER_REQUEST = 100;
const MAX_DAILY_QUOTA = 10000;

class YouTubeService {
  private api: AxiosInstance;
  private quotaTracker: {used: number, lastReset: Date} = {used: 0, lastReset: new Date()};

  constructor() {
    this.api = axios.create({
      baseURL: YOUTUBE_API_BASE,
      timeout: 10000,
    });

    // Reset quota daily
    this.startDailyQuotaReset();
  }

  /**
   * Start daily quota reset timer
   */
  private startDailyQuotaReset() {
    setInterval(() => {
      const now = new Date();
      const lastReset = this.quotaTracker.lastReset;
      
      // Reset if it's a new day (UTC)
      if (now.toDateString() !== lastReset.toDateString()) {
        console.log('🔄 YouTube API quota reset for new day');
        this.quotaTracker.used = 0;
        this.quotaTracker.lastReset = now;
      }
    }, 60000); // Check every minute
  }

  /**
   * Check if we have quota available
   */
  private hasQuota(cost: number = SEARCH_QUOTA_PER_REQUEST): boolean {
    return this.quotaTracker.used + cost <= MAX_DAILY_QUOTA;
  }

  /**
   * Get cached shorts from Firestore
   */
  private async getCachedShorts(movieTitle: string): Promise<YouTubeShort[] | null> {
    if (!db) {
      console.warn('Firestore not initialized');
      return null;
    }

    try {
      const cacheRef = collection(db, 'youtubeCache');
      const q = query(cacheRef, where('movieTitle', '==', movieTitle));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const cacheEntry = snapshot.docs[0].data() as ClipCacheEntry;

      // Check if cache is still valid
      const now = new Date();
      if (cacheEntry.expiresAt.toDate() > now) {
        console.log(`✅ Found cached shorts for "${movieTitle}"`);
        return cacheEntry.clips;
      } else {
        console.log(`⏰ Cache expired for "${movieTitle}"`);
        return null;
      }
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  /**
   * Save shorts to Firestore cache
   */
  private async cacheShorts(
    movieTitle: string,
    clips: YouTubeShort[]
  ): Promise<void> {
    if (!db) {
      console.warn('Firestore not initialized');
      return;
    }

    try {
      const cacheEntry: ClipCacheEntry = {
        id: `${movieTitle}-${Date.now()}`,
        movieTitle,
        clips,
        createdAt: serverTimestamp() as unknown as Timestamp,
        expiresAt: new Date(Date.now() + CACHE_TTL) as unknown as Timestamp,
        quotaUsed: SEARCH_QUOTA_PER_REQUEST,
      };

      const cacheRef = collection(db, 'youtubeCache');
      await setDoc(doc(cacheRef, cacheEntry.id), cacheEntry);
      console.log(`📦 Cached ${clips.length} shorts for "${movieTitle}"`);
    } catch (error) {
      console.error('Error caching shorts:', error);
      // Non-blocking error - cache failure shouldn't break functionality
    }
  }

  /**
   * Search for shorts on YouTube
   * Searches for movie title + "scene" or "trailer" to find relevant clips
   */
  async searchShorts(
    movieTitle: string,
    maxResults: number = 5,
    forceRefresh: boolean = false
  ): Promise<YouTubeShort[]> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCachedShorts(movieTitle);
        if (cached) {
          return cached.slice(0, maxResults);
        }
      }

      // Check quota
      if (!this.hasQuota(SEARCH_QUOTA_PER_REQUEST)) {
        console.warn('⚠️ YouTube API daily quota exceeded');
        return [];
      }

      // Build search query
      const searchQueries = [
        `${movieTitle} scene highlights`,
        `${movieTitle} best moment`,
        `${movieTitle} trailer clips`,
      ];

      console.log(`🔍 Searching YouTube for "${movieTitle}"`);

      // Try primary query first
      let results = await this.performSearch(
        searchQueries[0],
        maxResults
      );

      // If no results, try secondary queries
      if (results.length === 0 && maxResults > 0) {
        results = await this.performSearch(
          searchQueries[1],
          Math.ceil(maxResults / 2)
        );
      }

      // Cache successful results
      if (results.length > 0) {
        await this.cacheShorts(movieTitle, results);
      }

      return results;
    } catch (error) {
      console.error('Error searching YouTube shorts:', error);
      return [];
    }
  }

  /**
   * Perform actual YouTube search API call
   */
  private async performSearch(
    query: string,
    maxResults: number
  ): Promise<YouTubeShort[]> {
    try {
      const response = await this.api.get('/search', {
        params: {
          q: query,
          part: 'snippet',
          type: 'video',
          videoDuration: 'short', // Only short videos (<4 min)
          maxResults: Math.min(maxResults, 50), // API limit is 50
          key: YOUTUBE_API_KEY,
          order: 'relevance',
          safeSearch: 'moderate',
          relevanceLanguage: 'en',
        },
      });

      // Track quota usage
      this.quotaTracker.used += SEARCH_QUOTA_PER_REQUEST;
      console.log(
        `📊 YouTube quota used: ${this.quotaTracker.used}/${MAX_DAILY_QUOTA}`
      );

      // Transform YouTube API response to our format
      const shorts: YouTubeShort[] = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default.url,
        embeddableUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`,
      }));

      console.log(`✅ Found ${shorts.length} shorts`);
      return shorts;
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.error('❌ YouTube API key invalid or quota exceeded');
      } else {
        console.error('Error performing YouTube search:', error.message);
      }
      return [];
    }
  }

  /**
   * Get details about a specific YouTube video
   * Returns duration, view count, and other metadata
   */
  async getVideoDetails(videoId: string): Promise<any | null> {
    try {
      if (!this.hasQuota(1)) {
        console.warn('⚠️ Insufficient quota for video details');
        return null;
      }

      const response = await this.api.get('/videos', {
        params: {
          id: videoId,
          part: 'contentDetails,statistics',
          key: YOUTUBE_API_KEY,
        },
      });

      this.quotaTracker.used += 1;

      if (response.data.items.length === 0) {
        return null;
      }

      const video = response.data.items[0];
      return {
        videoId,
        duration: video.contentDetails.duration, // ISO 8601 format
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }

  /**
   * Get current quota usage
   */
  getQuotaStatus(): {used: number, available: number, percentage: number} {
    return {
      used: this.quotaTracker.used,
      available: MAX_DAILY_QUOTA - this.quotaTracker.used,
      percentage: (this.quotaTracker.used / MAX_DAILY_QUOTA) * 100,
    };
  }

  /**
   * Search for related videos (used in MovieDetailsScreen)
   */
  async searchRelated(
    movieTitle: string,
    genre?: string
  ): Promise<YouTubeShort[]> {
    const query = genre
      ? `${movieTitle} ${genre} scene`
      : `${movieTitle} highlights`;
    return this.performSearch(query, 3);
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();

/**
 * Hook-style usage in React components:
 * 
 * import { youtubeService } from '../services/youtube';
 * 
 * const [shorts, setShorts] = useState<YouTubeShort[]>([]);
 * 
 * useEffect(() => {
 *   youtubeService
 *     .searchShorts('The Matrix', 5)
 *     .then(setShorts)
 *     .catch(console.error);
 * }, []);
 * 
 * // Shorts now available in state
 */
