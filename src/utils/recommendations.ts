import type { Movie, LikedMovie } from '../types/movie';
import { getLikedMovies } from '../services/storage';

export interface UserPreferences {
  favoriteGenres: { [genreId: number]: number }; // genre_id -> weight
  averageRating: number;
  totalLikes: number;
  preferredYears: number[]; // decades
}

/**
 * Аналізує лайкнуті фільми та створює профіль вподобань користувача
 */
export const analyzeUserPreferences = async (): Promise<UserPreferences> => {
  const likedMovies = await getLikedMovies();
  
  if (likedMovies.length === 0) {
    return {
      favoriteGenres: {},
      averageRating: 0,
      totalLikes: 0,
      preferredYears: [],
    };
  }

  // Аналіз жанрів
  const genreCount: { [key: number]: number } = {};
  let totalRating = 0;
  const years: number[] = [];

  likedMovies.forEach(movie => {
    // Рахуємо жанри
    movie.genre_ids.forEach(genreId => {
      genreCount[genreId] = (genreCount[genreId] || 0) + 1;
    });

    // Рахуємо середній рейтинг
    totalRating += movie.vote_average;

    // Збираємо роки
    if (movie.release_date) {
      const year = new Date(movie.release_date).getFullYear();
      years.push(Math.floor(year / 10) * 10); // Округляємо до десятиліття
    }
  });

  // Нормалізуємо ваги жанрів (0-1)
  const maxGenreCount = Math.max(...Object.values(genreCount));
  const favoriteGenres: { [key: number]: number } = {};
  Object.entries(genreCount).forEach(([genreId, count]) => {
    favoriteGenres[Number(genreId)] = count / maxGenreCount;
  });

  return {
    favoriteGenres,
    averageRating: totalRating / likedMovies.length,
    totalLikes: likedMovies.length,
    preferredYears: [...new Set(years)],
  };
};

/**
 * Розраховує score для фільму на основі вподобань користувача
 * Чим вище score - тим краще підходить фільм
 */
export const calculateMovieScore = (
  movie: Movie,
  preferences: UserPreferences
): number => {
  let score = 0;

  // 1. Перевірка жанрів (40% ваги)
  if (Object.keys(preferences.favoriteGenres).length > 0) {
    const genreScores = movie.genre_ids.map(
      genreId => preferences.favoriteGenres[genreId] || 0
    );
    const avgGenreScore = genreScores.length > 0
      ? genreScores.reduce((a, b) => a + b, 0) / genreScores.length
      : 0;
    score += avgGenreScore * 40;
  }

  // 2. Рейтинг фільму (30% ваги)
  // Якщо користувач лайкає високорейтингові фільми, показуємо такі
  if (preferences.averageRating > 0) {
    const ratingDiff = Math.abs(movie.vote_average - preferences.averageRating);
    const ratingScore = Math.max(0, 1 - (ratingDiff / 10));
    score += ratingScore * 30;
  }

  // 3. Популярність (20% ваги)
  // Нормалізуємо популярність (припускаємо макс 1000)
  const popularityScore = Math.min(movie.popularity / 1000, 1);
  score += popularityScore * 20;

  // 4. Рік випуску (10% ваги)
  if (movie.release_date && preferences.preferredYears.length > 0) {
    const movieYear = new Date(movie.release_date).getFullYear();
    const movieDecade = Math.floor(movieYear / 10) * 10;
    const yearMatch = preferences.preferredYears.includes(movieDecade);
    score += yearMatch ? 10 : 0;
  }

  return score;
};

/**
 * Сортує фільми за релевантністю для користувача
 */
export const sortMoviesByRelevance = async (
  movies: Movie[]
): Promise<Movie[]> => {
  const preferences = await analyzeUserPreferences();

  // Якщо немає лайків, повертаємо як є (за популярністю від TMDb)
  if (preferences.totalLikes === 0) {
    return movies;
  }

  // Додаємо score до кожного фільму і сортуємо
  const moviesWithScores = movies.map(movie => ({
    movie,
    score: calculateMovieScore(movie, preferences),
  }));

  moviesWithScores.sort((a, b) => b.score - a.score);

  return moviesWithScores.map(item => item.movie);
};

/**
 * Отримує рекомендовані жанри на основі лайків
 */
export const getRecommendedGenres = async (): Promise<number[]> => {
  const preferences = await analyzeUserPreferences();
  
  // Повертаємо топ-3 жанри
  const sortedGenres = Object.entries(preferences.favoriteGenres)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genreId]) => Number(genreId));

  return sortedGenres;
};

/**
 * Отримує статистику користувача для відображення
 */
export const getUserStats = async () => {
  const preferences = await analyzeUserPreferences();
  const likedMovies = await getLikedMovies();

  // Мапінг genre_id -> name
  const genreMap: { [key: number]: string } = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV',
    53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  // Топ жанри
  const topGenres = Object.entries(preferences.favoriteGenres)
    .sort(([, a], [, b]) => b - a)
    .map(([id, weight]) => ({ 
      genre: genreMap[Number(id)] || `Genre ${id}`,
      count: Math.round(weight * preferences.totalLikes)
    }));

  // Статистика по рокам
  const yearStats: { [year: string]: number } = {};
  likedMovies.forEach(movie => {
    if (movie.release_date) {
      const year = new Date(movie.release_date).getFullYear().toString();
      yearStats[year] = (yearStats[year] || 0) + 1;
    }
  });

  const yearDistribution = Object.entries(yearStats)
    .sort(([, a], [, b]) => b - a)
    .map(([year, count]) => ({ year, count }));

  return {
    totalLikes: preferences.totalLikes,
    averageRating: preferences.averageRating,
    topGenres,
    yearDistribution,
  };
};
