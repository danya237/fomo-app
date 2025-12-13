import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl } from '../services/tmdb';
import type { Movie } from '../types/movie';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.65;

interface MovieCardProps {
  movie: Movie;
  onInfoPress?: () => void;
}

const MovieCardComponent: React.FC<MovieCardProps> = ({ movie, onInfoPress }) => {
  const { colors } = useTheme();

  // Використовуємо backdrop для кращої якості та композиції
  const imageUrl = movie.backdrop_path 
    ? getImageUrl(movie.backdrop_path, 'original')
    : getImageUrl(movie.poster_path, 'w500');
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return '#4CAF50';
    if (rating >= 6) return '#FF9800';
    return '#F44336';
  };

  const getPopularityBadge = () => {
    if (movie.vote_count > 5000) return '🔥 Popular';
    if (movie.vote_count > 1000) return '👍 Trending';
    return null;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image
        source={{ uri: imageUrl || undefined }}
        style={styles.poster}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        priority="high"

      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />

      {/* Top Badges */}
      <View style={styles.topBadges}>
        {getPopularityBadge() && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>{getPopularityBadge()}</Text>
          </View>
        )}
      </View>
      
      {/* Bottom Info */}
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(movie.vote_average) }]}>
              <Ionicons name="star" size={14} color="white" />
              <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
            </View>
            <View style={styles.yearBadge}>
              <Ionicons name="calendar-outline" size={14} color="white" />
              <Text style={styles.year}>{year}</Text>
            </View>
            <View style={styles.votesBadge}>
              <Ionicons name="people-outline" size={14} color="white" />
              <Text style={styles.votes}>{(movie.vote_count / 1000).toFixed(1)}k</Text>
            </View>
          </View>
          
          {movie.overview ? (
            <Text style={styles.overview} numberOfLines={3}>
              {movie.overview}
            </Text>
          ) : null}
        </View>
        
        {onInfoPress && (
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={onInfoPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoButtonGradient}
            >
              <Ionicons name="information-circle-outline" size={20} color="white" />
              <Text style={styles.infoButtonText}>More Info</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  topBadges: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  popularBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 25,
  },
  infoContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  year: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  votesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  votes: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  overview: {
    fontSize: 13,
    color: 'white',
    opacity: 0.95,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  infoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});

// Мемоізація для оптимізації - не перерендерюємо якщо movie той самий
export const MovieCard = React.memo(MovieCardComponent, (prevProps, nextProps) => {
  return prevProps.movie.id === nextProps.movie.id;
});
