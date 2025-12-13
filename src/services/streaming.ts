/**
 * Streaming Platforms Service
 * 
 * Integrates with TMDb API to get where movies are available
 * Supports: Netflix, Disney+, HBO Max, Hulu, Prime Video, Apple TV, etc.
 * 
 * API: https://www.themoviedb.org/settings/api
 */

import axios, { AxiosInstance } from 'axios';

interface StreamingAvailability {
  movieId: number;
  movieTitle: string;
  providers: StreamingProvider[];
  linkToWatch: string; // URL to watch on platform
  buyUrl?: string;
  rentUrl?: string;
  availableInRegions: string[];
}

interface StreamingProvider {
  providerName: string; // "Netflix", "Disney Plus", "HBO Max", etc.
  providerLogo?: string;
  providerUrl: string;
  type: 'stream' | 'buy' | 'rent'; // How to access
  isAvailable: boolean;
  monthlyPrice?: number; // For subscription services
  purchasePrice?: number; // For purchase/rent
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

// Streaming provider IDs (from TMDb)
const STREAMING_PROVIDERS: {[key: number]: {name: string; url: string; icon: string}} = {
  8: {name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬'},
  118: {name: 'Disney Plus', url: 'https://www.disneyplus.com', icon: '✨'},
  3: {name: 'HBO Max', url: 'https://www.hbomax.com', icon: '🎭'},
  15: {name: 'Hulu', url: 'https://www.hulu.com', icon: '📺'},
  119: {name: 'Amazon Prime Video', url: 'https://www.primevideo.com', icon: '🎁'},
  2: {name: 'Apple TV', url: 'https://tv.apple.com', icon: '🍎'},
  1: {name: 'Amazon Prime Video', url: 'https://www.primevideo.com', icon: '🎁'},
  37: {name: 'The Roku Channel', url: 'https://therokuchannel.com', icon: '📱'},
  531: {name: 'Peacock', url: 'https://www.peacocktv.com', icon: '🦚'},
};

// Links for deep linking to streaming apps
const DEEP_LINKS: {[key: string]: string} = {
  'Netflix': 'nflx://www.netflix.com/watch',
  'Disney Plus': 'disneyplus://',
  'HBO Max': 'hbomax://',
  'Amazon Prime Video': 'primevideo://',
  'Apple TV': 'tv://',
};

class StreamingService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: TMDB_API_BASE,
      timeout: 10000,
    });
  }

  /**
   * Get where a movie is available to watch
   */
  async getStreamingAvailability(
    movieId: number,
    movieTitle: string,
    region: string = 'US'
  ): Promise<StreamingAvailability | null> {
    try {
      const response = await this.api.get(
        `/movie/${movieId}/watch/providers`,
        {
          params: {
            api_key: TMDB_API_KEY,
          },
        }
      );

      const regionData = response.data.results?.[region];

      if (!regionData) {
        console.warn(`No streaming data for ${region} in movie ${movieId}`);
        return null;
      }

      // Parse streaming providers
      const providers: StreamingProvider[] = [];

      // Streaming (subscription)
      if (regionData.flatrate) {
        for (const provider of regionData.flatrate) {
          const providerInfo = STREAMING_PROVIDERS[provider.provider_id];
          if (providerInfo) {
            providers.push({
              providerName: providerInfo.name,
              providerLogo: providerInfo.icon,
              providerUrl: providerInfo.url,
              type: 'stream',
              isAvailable: true,
            });
          }
        }
      }

      // Rent
      if (regionData.rent) {
        for (const provider of regionData.rent) {
          const providerInfo = STREAMING_PROVIDERS[provider.provider_id];
          if (providerInfo) {
            providers.push({
              providerName: providerInfo.name,
              providerLogo: providerInfo.icon,
              providerUrl: providerInfo.url,
              type: 'rent',
              isAvailable: true,
            });
          }
        }
      }

      // Buy
      if (regionData.buy) {
        for (const provider of regionData.buy) {
          const providerInfo = STREAMING_PROVIDERS[provider.provider_id];
          if (providerInfo) {
            providers.push({
              providerName: providerInfo.name,
              providerLogo: providerInfo.icon,
              providerUrl: providerInfo.url,
              type: 'buy',
              isAvailable: true,
            });
          }
        }
      }

      return {
        movieId,
        movieTitle,
        providers: providers.filter((p, i, arr) => arr.findIndex(a => a.providerName === p.providerName) === i), // Remove duplicates
        linkToWatch: regionData.link || '',
        availableInRegions: Object.keys(response.data.results || {}),
      };
    } catch (error) {
      console.error('Error fetching streaming availability:', error);
      return null;
    }
  }

  /**
   * Get deep link to watch movie on streaming platform
   */
  getDeepLink(providerName: string, movieId?: string): string | null {
    const baseLink = DEEP_LINKS[providerName];
    if (!baseLink) return null;

    if (movieId && providerName === 'Netflix') {
      return `${baseLink}/${movieId}`;
    }

    return baseLink;
  }

  /**
   * Get streaming availability for multiple movies
   */
  async getAvailabilityBatch(
    movieIds: number[],
    movieTitles: {[key: number]: string},
    region: string = 'US'
  ): Promise<StreamingAvailability[]> {
    const results = await Promise.all(
      movieIds.map(id =>
        this.getStreamingAvailability(id, movieTitles[id], region)
      )
    );

    return results.filter((r): r is StreamingAvailability => r !== null);
  }

  /**
   * Filter movies by streaming platform
   */
  async getMoviesByPlatform(
    movieIds: number[],
    movieTitles: {[key: number]: string},
    platform: string,
    region: string = 'US'
  ): Promise<StreamingAvailability[]> {
    const availabilities = await this.getAvailabilityBatch(movieIds, movieTitles, region);

    return availabilities.filter(av =>
      av.providers.some(p => p.providerName.toLowerCase() === platform.toLowerCase())
    );
  }

  /**
   * Format availability text for UI
   * Example: "Available on Netflix, Disney+ • Buy on Amazon Prime"
   */
  formatAvailability(availability: StreamingAvailability): string {
    const streaming = availability.providers
      .filter(p => p.type === 'stream')
      .map(p => p.providerName);

    const buying = availability.providers
      .filter(p => p.type === 'buy')
      .map(p => p.providerName);

    const rental = availability.providers
      .filter(p => p.type === 'rent')
      .map(p => p.providerName);

    const parts = [];

    if (streaming.length > 0) {
      parts.push(`Stream on ${streaming.join(', ')}`);
    }
    if (buying.length > 0) {
      parts.push(`Buy on ${buying.join(', ')}`);
    }
    if (rental.length > 0) {
      parts.push(`Rent on ${rental.join(', ')}`);
    }

    return parts.join(' • ');
  }

  /**
   * Get primary streaming option (prioritize subscription over buy/rent)
   */
  getPrimaryProvider(availability: StreamingAvailability): StreamingProvider | null {
    // First priority: subscription
    const stream = availability.providers.find(p => p.type === 'stream');
    if (stream) return stream;

    // Second priority: rent
    const rent = availability.providers.find(p => p.type === 'rent');
    if (rent) return rent;

    // Third priority: buy
    return availability.providers.find(p => p.type === 'buy') || null;
  }
}

export const streamingService = new StreamingService();

/**
 * Usage example:
 * 
 * const availability = await streamingService.getStreamingAvailability(
 *   550,
 *   'Fight Club',
 *   'US'
 * );
 * 
 * console.log(streamingService.formatAvailability(availability));
 * // Output: "Stream on Netflix, Disney+ • Buy on Amazon Prime"
 * 
 * const primary = streamingService.getPrimaryProvider(availability);
 * // Get best watching option
 */
