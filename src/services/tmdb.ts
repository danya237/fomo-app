import axios from 'axios';
import type { Movie, MovieDetails, Video, Credits, Review } from '../types/movie';

// TMDb API Key - Working! ✅
const TMDB_API_KEY = '75d9423bc0ffb12337dfdfad7f61bf9a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 10000, // 10 секунд таймаут
});

export const getImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: { page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
};

export const getMovieTrailer = async (movieId: number): Promise<Video | null> => {
  try {
    const videos = await getMovieVideos(movieId);
    const trailer = videos.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer || videos[0] || null;
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return null;
  }
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

export const searchMovies = async (query: string, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: { query, page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getYouTubeVideoUrl = (videoKey: string) => {
  return `https://www.youtube.com/watch?v=${videoKey}`;
};

export const getMovieCredits = async (movieId: number): Promise<Credits> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

export const getMovieReviews = async (movieId: number): Promise<Review[]> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/reviews`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};
