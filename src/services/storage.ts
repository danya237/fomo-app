import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Movie, LikedMovie } from '../types/movie';

const LIKED_MOVIES_KEY = 'liked_movies';
const DISLIKED_MOVIES_KEY = 'disliked_movies';

export const likeMovie = async (movie: Movie): Promise<void> => {
  try {
    const likedMovies = await getLikedMovies();
    const likedMovie: LikedMovie = {
      ...movie,
      likedAt: new Date().toISOString(),
    };
    
    const updatedLikes = [likedMovie, ...likedMovies.filter(m => m.id !== movie.id)];
    await AsyncStorage.setItem(LIKED_MOVIES_KEY, JSON.stringify(updatedLikes));
  } catch (error) {
    console.error('Error liking movie:', error);
    throw error;
  }
};

export const dislikeMovie = async (movieId: number): Promise<void> => {
  try {
    const dislikedMovies = await getDislikedMovies();
    const updatedDislikes = [...new Set([...dislikedMovies, movieId])];
    await AsyncStorage.setItem(DISLIKED_MOVIES_KEY, JSON.stringify(updatedDislikes));
  } catch (error) {
    console.error('Error disliking movie:', error);
    throw error;
  }
};

export const unlikeMovie = async (movieId: number): Promise<void> => {
  try {
    const likedMovies = await getLikedMovies();
    const updatedLikes = likedMovies.filter(movie => movie.id !== movieId);
    await AsyncStorage.setItem(LIKED_MOVIES_KEY, JSON.stringify(updatedLikes));
  } catch (error) {
    console.error('Error unliking movie:', error);
    throw error;
  }
};

export const getLikedMovies = async (): Promise<LikedMovie[]> => {
  try {
    const data = await AsyncStorage.getItem(LIKED_MOVIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting liked movies:', error);
    return [];
  }
};

export const getDislikedMovies = async (): Promise<number[]> => {
  try {
    const data = await AsyncStorage.getItem(DISLIKED_MOVIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting disliked movies:', error);
    return [];
  }
};

export const isMovieLiked = async (movieId: number): Promise<boolean> => {
  const likedMovies = await getLikedMovies();
  return likedMovies.some(movie => movie.id === movieId);
};

export const isMovieDisliked = async (movieId: number): Promise<boolean> => {
  const dislikedMovies = await getDislikedMovies();
  return dislikedMovies.includes(movieId);
};

export const addNoteToMovie = async (movieId: number, note: string): Promise<void> => {
  try {
    const likedMovies = await getLikedMovies();
    const updatedLikes = likedMovies.map(movie =>
      movie.id === movieId ? { ...movie, userNotes: note } : movie
    );
    await AsyncStorage.setItem(LIKED_MOVIES_KEY, JSON.stringify(updatedLikes));
  } catch (error) {
    console.error('Error adding note to movie:', error);
    throw error;
  }
};

export const clearAllLikes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LIKED_MOVIES_KEY);
  } catch (error) {
    console.error('Error clearing likes:', error);
    throw error;
  }
};

export const clearAllDislikes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DISLIKED_MOVIES_KEY);
  } catch (error) {
    console.error('Error clearing dislikes:', error);
    throw error;
  }
};
