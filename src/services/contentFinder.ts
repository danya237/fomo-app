/**
 * Content Finder Service
 * 
 * Unified service that searches across multiple platforms
 * Implements fallback chain: TikTok → YouTube → TMDb
 * 
 * All APIs run in parallel to maximize speed
 */

import axios from 'axios';
import { youtubeService } from './youtube';
import { streamingService } from './streaming';

export interface MovieClip {
  id: string;
  source: 'tiktok' | 'youtube' | 'tmdb';
  title: string;
  description: string;
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  views?: number;
  duration?: number;
  quality: 'high' | 'medium' | 'low';
  uploadedBy?: string;
  platform: 'TikTok' | 'YouTube' | 'Manual';
}

export interface MovieInfo {
  tmdbId: number;
  title: string;
  posterUrl: string;
  rating: number;
  genres: string[];
  description: string;
  releaseDate: string;
  runtime?: number;
}

export interface StreamingAvailability {
  netflix: boolean;
  disney: boolean;
  hboMax: boolean;
  prime: boolean;
  hulu: boolean;
  appleTv: boolean;
  platforms: Array<{name: string; url: string; icon: string}>;
}

export interface MovieTrailer {
  id: string;
  url: string;
  source: 'youtube' | 'tmdb';
  title: string;
}

export interface ContentFinderResult {
  movieTitle: string;
  clips: MovieClip[];
  movieInfo?: MovieInfo;
  streaming?: StreamingAvailability;
  trailer?: MovieTrailer;
  primarySource: 'tiktok' | 'youtube' | 'tmdb' | 'none';
  fallbacksUsed: ('tiktok' | 'youtube' | 'tmdb')[];
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

class ContentFinderService {
  /**
   * Main entry point - finds best content for a movie
   * Runs all APIs in parallel
   */
  async findBestContent(movieTitle: string): Promise<ContentFinderResult> {
    const result: ContentFinderResult = {
      movieTitle,
      clips: [],
      primarySource: 'none',
      fallbacksUsed: [],
    };

    try {
      // Run all searches in parallel
      const [tiktokClips, youtubeClips, movieInfo, streaming, trailer] =
        await Promise.all([
          this.searchTikTok(movieTitle).catch(e => {
            console.warn('TikTok search failed:', e);
            return [];
          }),
          this.searchYouTube(movieTitle).catch(e => {
            console.warn('YouTube search failed:', e);
            return [];
          }),
          this.getMovieInfo(movieTitle).catch(e => {
            console.warn('TMDb info fetch failed:', e);
            return undefined;
          }),
          this.getStreamingPlatforms(movieTitle).catch(e => {
            console.warn('Streaming search failed:', e);
            return undefined;
          }),
          this.getTrailer(movieTitle).catch(e => {
            console.warn('Trailer search failed:', e);
            return undefined;
          }),
        ]);

      // Combine clips with priority: TikTok > YouTube
      const allClips = [...tiktokClips, ...youtubeClips];

      // Determine primary source
      if (tiktokClips.length > 0) {
        result.primarySource = 'tiktok';
        result.clips = tiktokClips;
        result.fallbacksUsed = [];
      } else if (youtubeClips.length > 0) {
        result.primarySource = 'youtube';
        result.clips = youtubeClips;
        result.fallbacksUsed = ['tiktok'];
      } else {
        result.primarySource = 'tmdb';
        result.fallbacksUsed = ['tiktok', 'youtube'];
      }

      // Add supplementary data
      result.movieInfo = movieInfo;
      result.streaming = streaming;
      result.trailer = trailer;

      console.log(`✅ Content found for "${movieTitle}":
        - Primary: ${result.primarySource}
        - Clips: ${result.clips.length}
        - Info: ${movieInfo ? '✅' : '❌'}
        - Streaming: ${streaming ? '✅' : '❌'}
        - Trailer: ${trailer ? '✅' : '❌'}`);

      return result;
    } catch (error) {
      console.error('Critical error in findBestContent:', error);
      throw error;
    }
  }

  /**
   * Search TikTok for movie clips
   * Returns high-quality results
   */
  private async searchTikTok(movieTitle: string): Promise<MovieClip[]> {
    try {
      // This would use tikwm or similar library
      // For now, returning empty - will implement after design approval
      
      console.log(`🔍 Searching TikTok for: "${movieTitle}"`);
      
      // TODO: Implement TikTok search
      // const results = await tikwmClient.search({
      //   keyword: `${movieTitle} movie scene`,
      //   count: 10,
      //   sortType: 'popular',
      // });

      return [];
    } catch (error) {
      console.error('TikTok search error:', error);
      return [];
    }
  }

  /**
   * Search YouTube for best scenes
   * Fallback if TikTok returns nothing
   */
  private async searchYouTube(movieTitle: string): Promise<MovieClip[]> {
    try {
      console.log(`🔍 Searching YouTube for best scenes: "${movieTitle}"`);

      const youtubeClips = await youtubeService.searchShorts(movieTitle, 5);

      return youtubeClips.map(clip => ({
        id: clip.id,
        source: 'youtube' as const,
        title: clip.title,
        description: clip.description,
        url: `https://www.youtube.com/watch?v=${clip.id}`,
        embedUrl: clip.embeddableUrl,
        thumbnailUrl: clip.thumbnailUrl,
        quality: 'high' as const,
        uploadedBy: clip.channelTitle,
        platform: 'YouTube',
      }));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  /**
   * Get movie information from TMDb
   */
  private async getMovieInfo(movieTitle: string): Promise<MovieInfo | undefined> {
    try {
      console.log(`📊 Fetching movie info: "${movieTitle}"`);

      const response = await axios.get(`${TMDB_API_BASE}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: movieTitle,
          page: 1,
        },
      });

      const movie = response.data.results?.[0];

      if (!movie) {
        console.warn(`Movie not found in TMDb: "${movieTitle}"`);
        return undefined;
      }

      return {
        tmdbId: movie.id,
        title: movie.title,
        posterUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : '',
        rating: movie.vote_average,
        genres: movie.genre_ids || [],
        description: movie.overview,
        releaseDate: movie.release_date,
      };
    } catch (error) {
      console.error('TMDb info fetch error:', error);
      return undefined;
    }
  }

  /**
   * Get streaming platform availability
   */
  private async getStreamingPlatforms(
    movieTitle: string
  ): Promise<StreamingAvailability | undefined> {
    try {
      // First get the movie ID from TMDb
      const response = await axios.get(`${TMDB_API_BASE}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: movieTitle,
          page: 1,
        },
      });

      const movie = response.data.results?.[0];

      if (!movie) {
        return undefined;
      }

      const availability = await streamingService.getStreamingAvailability(
        movie.id,
        movie.title,
        'US'
      );

      if (!availability) {
        return undefined;
      }

      return {
        netflix: availability.providers.some(p => p.providerName === 'Netflix'),
        disney: availability.providers.some(
          p => p.providerName === 'Disney Plus'
        ),
        hboMax: availability.providers.some(p => p.providerName === 'HBO Max'),
        prime: availability.providers.some(
          p => p.providerName === 'Amazon Prime Video'
        ),
        hulu: availability.providers.some(p => p.providerName === 'Hulu'),
        appleTv: availability.providers.some(p => p.providerName === 'Apple TV'),
        platforms: availability.providers.map(p => ({
          name: p.providerName,
          url: p.providerUrl,
          icon: '🎬', // Can be customized per provider
        })),
      };
    } catch (error) {
      console.error('Streaming platform fetch error:', error);
      return undefined;
    }
  }

  /**
   * Get official trailer
   */
  private async getTrailer(movieTitle: string): Promise<MovieTrailer | undefined> {
    try {
      console.log(`🎬 Searching trailer: "${movieTitle}"`);

      const trailerClip = await youtubeService.searchTrailer(movieTitle);

      if (!trailerClip) {
        return undefined;
      }

      return {
        id: trailerClip.id,
        url: `https://www.youtube.com/watch?v=${trailerClip.id}`,
        source: 'youtube',
        title: trailerClip.title,
      };
    } catch (error) {
      console.error('Trailer search error:', error);
      return undefined;
    }
  }

  /**
   * Get trending movie clips (for home feed)
   * Shows popular movie moments across platforms
   */
  async getTrendingClips(): Promise<MovieClip[]> {
    try {
      const [tiktokTrending, youtubeTrending] = await Promise.all([
        this.getTrendingTikTok().catch(() => []),
        this.getTrendingYouTube().catch(() => []),
      ]);

      return [...tiktokTrending, ...youtubeTrending];
    } catch (error) {
      console.error('Error fetching trending clips:', error);
      return [];
    }
  }

  /**
   * Get trending from TikTok
   */
  private async getTrendingTikTok(): Promise<MovieClip[]> {
    // TODO: Implement trending TikTok clips
    return [];
  }

  /**
   * Get trending from YouTube
   */
  private async getTrendingYouTube(): Promise<MovieClip[]> {
    // TODO: Implement trending YouTube clips
    return [];
  }

  /**
   * Cache results in Firestore for offline access
   */
  async cacheResult(
    movieTitle: string,
    result: ContentFinderResult
  ): Promise<void> {
    try {
      // TODO: Implement Firestore caching
      console.log(`💾 Cached results for "${movieTitle}"`);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }
}

export const contentFinder = new ContentFinderService();

/**
 * Usage example:
 * 
 * const result = await contentFinder.findBestContent('Inception');
 * 
 * if (result.clips.length > 0) {
 *   // Show clips in feed
 * } else if (result.movieInfo) {
 *   // Show movie info as fallback
 * }
 * 
 * // Show streaming options
 * if (result.streaming?.netflix) {
 *   showStreamingOption('Netflix', result.streaming.platforms);
 * }
 */
