import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../types/navigation';
import type { MovieDetails, Cast, Review, Video, Movie } from '../types/movie';
import {
  getMovieDetails,
  getMovieCredits,
  getMovieReviews,
  getMovieTrailer,
  getSimilarMovies,
  getImageUrl,
} from '../services/tmdb';

const { width } = Dimensions.get('window');

type MovieDetailsScreenRouteProp = RouteProp<RootStackParamList, 'MovieDetails'>;
type MovieDetailsScreenNavigationProp = NavigationProp<RootStackParamList>;

export const MovieDetailsScreen: React.FC = () => {
  const route = useRoute<MovieDetailsScreenRouteProp>();
  const navigation = useNavigation<MovieDetailsScreenNavigationProp>();
  const { theme, colors } = useTheme();
  const { t } = useTranslation();
  const { movie } = route.params;

  const scrollY = useRef(new Animated.Value(0)).current;
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MovieDetailsScreen mounted with movie:', movie.title);
    loadMovieData();
  }, [movie.id]);

  const loadMovieData = async () => {
    try {
      console.log('Loading data for movie ID:', movie.id);
      setLoading(true);
      // Завантажуємо всі дані паралельно, але обробляємо помилки окремо
      const [detailsData, creditsData, reviewsData, trailerData, similarData] = await Promise.allSettled([
        getMovieDetails(movie.id),
        getMovieCredits(movie.id),
        getMovieReviews(movie.id),
        getMovieTrailer(movie.id),
        getSimilarMovies(movie.id),
      ]);

      console.log('Details loaded:', detailsData.status);
      console.log('Credits loaded:', creditsData.status);
      console.log('Reviews loaded:', reviewsData.status);
      console.log('Trailer loaded:', trailerData.status);
      console.log('Similar loaded:', similarData.status);

      if (detailsData.status === 'fulfilled') {
        console.log('Setting details:', detailsData.value.title);
        setDetails(detailsData.value);
      }
      if (creditsData.status === 'fulfilled') setCast(creditsData.value.cast.slice(0, 10));
      if (reviewsData.status === 'fulfilled') setReviews(reviewsData.value.slice(0, 3));
      if (trailerData.status === 'fulfilled') setTrailer(trailerData.value);
      if (similarData.status === 'fulfilled') setSimilarMovies(similarData.value.slice(0, 10));
      
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const openTrailer = () => {
    if (trailer) {
      navigation.navigate('VideoPlayer', { videoKey: trailer.key });
    }
  };

  const navigateToMovie = (selectedMovie: Movie) => {
    navigation.navigate('MovieDetails', { movie: selectedMovie });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading movie details...
        </Text>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 150],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Parallax Header */}
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity, backgroundColor: colors.card }]} />
      
      <Animated.ScrollView 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Backdrop Image with Parallax */}
        {movie.backdrop_path && (
          <Animated.View style={[styles.backdropContainer, { transform: [{ translateY: imageTranslateY }] }]}>
            <Animated.Image
              source={{ uri: getImageUrl(movie.backdrop_path, 'original') || '' }}
              style={[styles.backdrop, { transform: [{ scale: imageScale }] }]}
            />
            <LinearGradient
              colors={['transparent', 'transparent', colors.background]}
              style={styles.backdropGradient}
            />
          </Animated.View>
        )}

      {/* Movie Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{movie.title}</Text>
        
        {details?.tagline && (
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            "{details.tagline}"
          </Text>
        )}

        {/* Rating and Release Date */}
        <View style={styles.metaRow}>
          <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.ratingText}>⭐ {movie.vote_average.toFixed(1)}</Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
          {details?.runtime && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
            </Text>
          )}
        </View>

        {/* Genres */}
        {details?.genres && (
          <View style={styles.genresContainer}>
            {details.genres.map((genre) => (
              <View key={genre.id} style={[styles.genreBadge, { backgroundColor: colors.card }]}>
                <Text style={[styles.genreText, { color: colors.text }]}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Overview */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('movieDetails.overview')}
        </Text>
        <Text style={[styles.overview, { color: colors.textSecondary }]}>
          {movie.overview}
        </Text>

        {/* Trailer Button */}
        {trailer && (
          <TouchableOpacity
            style={[styles.trailerButton, { backgroundColor: colors.primary }]}
            onPress={openTrailer}
          >
            <Text style={styles.trailerButtonText}>▶ {t('movieDetails.watchTrailer')}</Text>
          </TouchableOpacity>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('movieDetails.cast')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castContainer}>
              {cast.map((actor) => (
                <View key={actor.id} style={styles.castItem}>
                  {actor.profile_path ? (
                    <Image
                      source={{ uri: getImageUrl(actor.profile_path, 'w200') || '' }}
                      style={styles.castImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.castImage, styles.castPlaceholder, { backgroundColor: colors.card }]}>
                      <Text style={{ fontSize: 32 }}>👤</Text>
                    </View>
                  )}
                  <Text style={[styles.castName, { color: colors.text }]} numberOfLines={2}>
                    {actor.name}
                  </Text>
                  <Text style={[styles.castCharacter, { color: colors.textSecondary }]} numberOfLines={2}>
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('movieDetails.reviews')}
            </Text>
            {reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                    {review.author_details.name || review.author}
                  </Text>
                  {review.author_details.rating && (
                    <View style={[styles.reviewRating, { backgroundColor: colors.primary }]}>
                      <Text style={styles.reviewRatingText}>⭐ {review.author_details.rating}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.reviewContent, { color: colors.textSecondary }]}
                  numberOfLines={5}
                >
                  {review.content}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('movieDetails.similarMovies')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarContainer}>
              {similarMovies.map((similarMovie) => (
                <TouchableOpacity
                  key={similarMovie.id}
                  style={styles.similarItem}
                  onPress={() => navigateToMovie(similarMovie)}
                >
                  {similarMovie.poster_path ? (
                    <Image
                      source={{ uri: getImageUrl(similarMovie.poster_path, 'w200') || '' }}
                      style={styles.similarPoster}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.similarPoster, styles.posterPlaceholder, { backgroundColor: colors.card }]}>
                      <Text style={{ fontSize: 32 }}>🎬</Text>
                    </View>
                  )}
                  <Text style={[styles.similarTitle, { color: colors.text }]} numberOfLines={2}>
                    {similarMovie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    width: width,
    height: 400,
    overflow: 'hidden',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backdrop: {
    width: width,
    height: width * 0.6,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
  },
  trailerButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  trailerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  castContainer: {
    marginBottom: 8,
  },
  castItem: {
    width: 100,
    marginRight: 16,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  castPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  castCharacter: {
    fontSize: 11,
    textAlign: 'center',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewRating: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewRatingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  similarContainer: {
    marginBottom: 20,
  },
  similarItem: {
    width: 120,
    marginRight: 12,
  },
  similarPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
