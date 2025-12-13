import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { getLikedMovies, unlikeMovie } from '../services/storage';
import { getImageUrl, getMovieTrailer } from '../services/tmdb';
import type { LikedMovie } from '../types/movie';
import { useTranslation } from 'react-i18next';

export const LikedScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [likedMovies, setLikedMovies] = useState<LikedMovie[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadLikedMovies();
    }, [])
  );

  const loadLikedMovies = async () => {
    try {
      const movies = await getLikedMovies();
      setLikedMovies(movies);
    } catch (error) {
      console.error('Error loading liked movies:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLikedMovies();
    setRefreshing(false);
  };

  const handleUnlike = async (movieId: number) => {
    try {
      console.log('🗑️ Starting to unlike movie:', movieId);
      
      // First update UI immediately - hide the movie
      setLikedMovies(prev => {
        const filtered = prev.filter(m => m.id !== movieId);
        console.log('✅ UI updated! Removed movie. New count:', filtered.length);
        return filtered;
      });
      
      // Then update storage in background
      await unlikeMovie(movieId);
      console.log('✅ Storage updated successfully!');
      
    } catch (error) {
      console.error('❌ Error unliking movie:', error);
      // On error, reload to restore correct state
      await loadLikedMovies();
      Alert.alert(t('common.error'), 'Could not remove movie');
    }
  };

  const handleWatchTrailer = async (movieId: number) => {
    try {
      const trailer = await getMovieTrailer(movieId);
      if (trailer) {
        navigation.navigate('VideoPlayer', { videoKey: trailer.key });
      } else {
        Alert.alert(t('common.error'), 'Trailer not available');
      }
    } catch (error) {
      console.error('Error opening trailer:', error);
      Alert.alert(t('common.error'), 'Could not open trailer');
    }
  };

  const renderMovie = React.useCallback(({ item }: { item: LikedMovie }) => {
    const posterUrl = getImageUrl(item.poster_path, 'w500');
    const year = item.release_date ? new Date(item.release_date).getFullYear() : 'N/A';

    return (
      <View style={[styles.movieItem, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.posterTouchable}
          onPress={() => {
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate('MovieDetails', { movie: item });
            } else {
              navigation.navigate('MovieDetails', { movie: item });
            }
          }}
        >
          <Image
            source={{ uri: posterUrl || undefined }}
            style={styles.poster}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
        <View style={styles.movieInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
            <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleWatchTrailer(item.id)}
            >
              <Ionicons name="play" size={16} color="white" />
              <Text style={styles.actionText}>{t('home.watchTrailer')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.error }]}
              onPress={() => {
                console.log('DELETE BUTTON PRESSED for movie:', item.id, item.title);
                handleUnlike(item.id);
              }}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [colors, navigation, t]);

  if (likedMovies.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('liked.empty')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={likedMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posterTouchable: {
    marginRight: 0,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  year: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});
