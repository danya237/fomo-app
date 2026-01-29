import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
} from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { clipService, userService, type Clip } from '../services/firestore';
import { VideoMomentCard } from '../components/VideoMomentCard';
import { youtubeService } from '../services/youtube';
import { contentFinder } from '../services/contentFinder';

const { width, height } = Dimensions.get('window');

interface VideoFeedProps {
  navigation: any;
}

/**
 * VideoFeedScreen - TikTok-style vertical video feed
 * 
 * Features:
 * - Full-screen video cards with pagination
 * - Vertical scroll (FlatList with pagingEnabled)
 * - Like/unlike functionality
 * - Real-time view tracking
 * - Infinite scroll with load more
 * - Pull-to-refresh
 */
export const VideoFeedScreen: React.FC<VideoFeedProps> = ({navigation}) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [likedClipIds, setLikedClipIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Load clips from ContentFinder (multi-API source)
   */
  const loadClips = async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Get trending clips from ContentFinder (TikTok primary, YouTube fallback)
      let newClips: Clip[] = [];
      
      try {
        console.log('📡 Fetching trending clips from ContentFinder...');
        const trendingMovieClips = await contentFinder.getTrendingClips();
        
        // Convert MovieClip to Clip format
        newClips = trendingMovieClips.map((clip, idx) => ({
          id: clip.id || `trending-${page}-${idx}`,
          movieId: idx,
          title: clip.title || 'Movie Moment',
          description: clip.description || 'Amazing movie scene',
          videoId: clip.id || '', // Use clip ID as YouTube ID placeholder
          videoUrl: clip.url || clip.embedUrl || '',
          thumbnailUrl: clip.thumbnailUrl || 'https://via.placeholder.com/400x600',
          duration: clip.duration || 45,
          source: (clip.source || 'youtube') as 'youtube' | 'tiktok' | 'custom',
          likes: 0, // Real data would come from API
          views: clip.views || 0,
          createdAt: Timestamp.now(),
          genre: ['Movie Moment'],
        })) as Clip[];
        
        console.log(`✅ Loaded ${newClips.length} trending clips from ContentFinder`);
      } catch (contentFinderError) {
        console.warn('⚠️ ContentFinder error, falling back to Firestore:', contentFinderError);
        // Fallback to Firestore clips
        newClips = await clipService.getClipsFeed(pageSize);
      }
      
      if (refresh) {
        setClips(newClips);
      } else if (page === 1) {
        setClips(newClips);
      } else {
        setClips(prev => [...prev, ...newClips]);
      }

      setCurrentPage(page);

      // If no clips from either source, generate sample data for demo
      if (newClips.length === 0 && page === 1) {
        console.warn('No clips from any source, using sample data for demo');
        const sampleClips = generateSampleClips();
        setClips(sampleClips);
      }

      console.log(`✅ Loaded ${newClips.length} clips (page ${page})`);
    } catch (error) {
      console.error('Error loading clips:', error);
      Alert.alert(t('common.error'), t('video.errorLoading'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  /**
   * Load user's liked clips
   */
  const loadLikedClips = async () => {
    if (!currentUser) return;

    try {
      const userProfile = await userService.getProfile(currentUser.uid);
      if (userProfile?.likedClipIds) {
        setLikedClipIds(new Set(userProfile.likedClipIds));
        console.log(`✅ Loaded ${userProfile.likedClipIds.length} liked clips`);
      }
    } catch (error) {
      console.error('Error loading liked clips:', error);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    loadClips(1);
    loadLikedClips();
  }, [currentUser]);

  /**
   * Reload when screen is focused
   */
  useFocusEffect(
    React.useCallback(() => {
      console.log('VideoFeed focused');
      loadLikedClips();
    }, [currentUser])
  );

  /**
   * Handle scroll to end (infinite scroll)
   */
  const handleEndReached = () => {
    if (!isLoadingMore && clips.length >= pageSize) {
      console.log('Loading more clips...');
      loadClips(currentPage + 1);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = () => {
    loadClips(1, true);
  };

  /**
   * Handle like
   */
  const handleLike = (clipId: string) => {
    const newLiked = new Set(likedClipIds);
    if (newLiked.has(clipId)) {
      newLiked.delete(clipId);
    } else {
      newLiked.add(clipId);
    }
    setLikedClipIds(newLiked);
  };

  /**
   * Handle comment
   */
  const handleComment = (clipId: string) => {
    console.log('Comment on clip:', clipId);
    // TODO: Navigate to comments screen
    Alert.alert(t('common.comingSoon'), t('video.commentsComingSoon') || 'Comments feature coming in next update');
  };

  /**
   * Handle share
   */
  const handleShare = (clipId: string) => {
    console.log('Share clip:', clipId);
    Alert.alert(t('common.share'), t('video.shareComingSoon') || 'Share feature coming soon');
  };

  /**
   * Render individual clip
   */
  const renderClip = ({item, index}: {item: Clip; index: number}) => (
    <VideoMomentCard
      clip={item}
      isLiked={likedClipIds.has(item.id)}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
      onShare={() => handleShare(item.id)}
      onNavigateToComments={() => {
        // TODO: Create CommentsScreen
        Alert.alert(t('common.comingSoon'), t('video.commentsComingSoon') || 'Comments screen coming in next update');
      }}
      onPlayTrailer={(videoId) => {
        navigation.navigate('VideoPlayer', {videoKey: videoId});
      }}
    />
  );

  /**
   * Render footer (loading indicator)
   */
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <View style={[styles.centerContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          Loading amazing moments...
        </Text>
      </View>
    );
  }

  /**
   * Empty state
   */
  if (clips.length === 0) {
    return (
      <View style={[styles.centerContainer, {backgroundColor: colors.background}]}>
        <Text style={[styles.emptyText, {color: colors.text}]}>
          🎬 No videos available
        </Text>
        <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
          Check back later!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        ref={flatListRef}
        data={clips}
        renderItem={renderClip}
        keyExtractor={(item) => item.id}
        pagingEnabled
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
};

/**
 * Generate sample clips for demo purposes
 */
function generateSampleClips(): Clip[] {
  const movies = [
    {title: 'The Matrix', description: 'Neo takes the red pill', genre: 'Sci-Fi'},
    {title: 'Inception', description: 'Building dreams within dreams', genre: 'Thriller'},
    {title: 'Interstellar', description: 'Exploring the unknown', genre: 'Adventure'},
    {title: 'Dune', description: 'The sandworm awakens', genre: 'Sci-Fi'},
    {title: 'Oppenheimer', description: 'Now I am become Death', genre: 'Drama'},
  ];

  return movies.map((movie, idx) => ({
    id: `sample-${idx}`,
    movieId: idx,
    title: movie.title,
    description: movie.description,
    videoId: 'dQw4w9WgXcQ', // Placeholder YouTube ID
    videoUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1`,
    thumbnailUrl: 'https://via.placeholder.com/400x600?text=' + movie.title,
    duration: 45 + idx * 10,
    source: 'youtube' as const,
    likes: Math.floor(Math.random() * 5000),
    views: Math.floor(Math.random() * 50000),
    createdAt: Timestamp.now(),
    genre: [movie.genre],
  })) as Clip[];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
  },
  footerLoader: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoFeedScreen;
