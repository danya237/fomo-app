import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { MovieCard } from '../components/MovieCard';
import * as Haptics from 'expo-haptics';
import { MovieCardSkeleton } from '../components/MovieCardSkeleton';
import { getPopularMovies } from '../services/tmdb';
import { likeMovie, dislikeMovie, getDislikedMovies, getLikedMovies } from '../services/storage';
import { sortMoviesByRelevance } from '../utils/recommendations';
import type { Movie } from '../types/movie';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { hapticsEnabled } = useSettings();
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [swiping, setSwiping] = useState(false);
  const [showHint, setShowHint] = useState(true);
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadMovies();
  }, [page]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      // Отримуємо і дизлайкнуті, і лайкнуті фільми
      const [dislikedIds, likedMovies] = await Promise.all([
        getDislikedMovies(),
        getLikedMovies()
      ]);
      const likedIds = likedMovies.map((m: { id: number }) => m.id);
      
      const newMovies = await getPopularMovies(page);
      
      if (newMovies.length === 0) {
        setLoading(false);
        return;
      }
      
      // Фільтруємо і дизлайкнуті, і лайкнуті фільми
      const filteredMovies = newMovies.filter(
        movie => !dislikedIds.includes(movie.id) && !likedIds.includes(movie.id)
      );
      
      // Якщо після фільтрації немає фільмів - завантажуємо наступну сторінку
      if (filteredMovies.length === 0) {
        setLoading(false);
        setPage(prev => prev + 1);
        return;
      }
      
      // 🎯 AI: Сортуємо фільми за релевантністю для користувача
      const sortedMovies = await sortMoviesByRelevance(filteredMovies);
      
      setMovies(prev => {
        // Унікальні фільми - не додаємо дублікати
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueMovies = sortedMovies.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueMovies];
      });
    } catch (error) {
      console.error('Error loading movies:', error);
      // Не кидаємо помилку - просто логуємо
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const movie = movies[currentIndex];
    if (!movie) return;

    // Приховуємо hint після першого свайпу
    if (showHint) {
      setShowHint(false);
    }

    // Одразу переходимо до наступного фільму
    setCurrentIndex(prev => prev + 1);
    position.setValue({ x: 0, y: 0 });

    // Асинхронно зберігаємо дані (не блокуємо UI)
    if (direction === 'right') {
      // 💚 Вібрація при лайку (якщо увімкнено)!
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      likeMovie(movie).catch(err => console.error('Error liking:', err));
    } else {
      dislikeMovie(movie.id).catch(err => console.error('Error disliking:', err));
    }

    // Load more movies when running low
    if (currentIndex >= movies.length - 3) {
      setPage(prev => prev + 1);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Швидка анімація замість Spring
          Animated.timing(position, {
            toValue: { x: width + 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => handleSwipeComplete('right'));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -width - 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => handleSwipeComplete('left'));
        } else {
          // Швидке повернення назад
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            speed: 20,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleLike = () => {
    if (swiping) return;
    setSwiping(true);
    // Швидка анімація 250ms замість Spring
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleSwipeComplete('right');
      setSwiping(false);
    });
  };

  const handleDislike = () => {
    if (swiping) return;
    setSwiping(true);
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleSwipeComplete('left');
      setSwiping(false);
    });
  };

  if (loading && movies.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.cardContainer}>
          <MovieCardSkeleton />
        </View>
        <View style={styles.buttonsContainer}>
          <View style={[styles.actionButton, { backgroundColor: colors.border, opacity: 0.5 }]} />
          <View style={[styles.actionButton, { backgroundColor: colors.border, opacity: 0.5 }]} />
        </View>
      </View>
    );
  }

  const currentMovie = movies[currentIndex];

  if (!currentMovie) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noMoviesText, { color: colors.text }]}>
          {t('home.noMoreMovies')}
        </Text>
        <TouchableOpacity
          style={[styles.reloadButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setCurrentIndex(0);
            setPage(1);
            setMovies([]);
            loadMovies();
          }}
        >
          <Text style={styles.reloadButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Progress Bar */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent']}
          style={styles.topGradient}
        />
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentIndex + 1) / Math.max(movies.length, 1)) * 100}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {movies.length}
          </Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {/* Swipe Hint for first time users */}
        {showHint && currentIndex === 0 && (
          <View style={styles.hintContainer}>
            <View style={styles.hintBubble}>
              <Ionicons name="hand-left" size={24} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.text }]}>
                Swipe left or right
              </Text>
              <Ionicons name="hand-right" size={24} color={colors.like} />
            </View>
          </View>
        )}

        {/* Next card (behind) */}
        {movies[currentIndex + 1] && (
          <View style={styles.nextCard}>
            <MovieCard movie={movies[currentIndex + 1]} />
          </View>
        )}

        {/* Current card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <MovieCard 
            movie={currentMovie}
            onInfoPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate('MovieDetails', { movie: currentMovie });
              } else {
                navigation.navigate('MovieDetails', { movie: currentMovie });
              }
            }}
          />
          
          {/* Like/Dislike overlays */}
          <Animated.View
            style={[
              styles.likeOverlay,
              { opacity: likeOpacity },
            ]}
          >
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.dislikeOverlay,
              { opacity: dislikeOpacity },
            ]}
          >
            <Text style={styles.dislikeText}>NOPE</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDislike}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF416C', '#FF4B2B']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="close" size={36} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.mainButton]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#56CCF2', '#2F80ED']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="heart" size={40} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
  },
  nextCard: {
    position: 'absolute',
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    paddingBottom: 40,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    right: 40,
    borderWidth: 4,
    borderColor: '#00E676',
    borderRadius: 10,
    padding: 10,
    transform: [{ rotate: '20deg' }],
  },
  likeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#00E676',
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 50,
    left: 40,
    borderWidth: 4,
    borderColor: '#FF1744',
    borderRadius: 10,
    padding: 10,
    transform: [{ rotate: '-20deg' }],
  },
  dislikeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF1744',
  },
  noMoviesText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  reloadButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
