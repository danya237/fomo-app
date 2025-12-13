import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { clipService, type Clip } from '../services/firestore';

const { width, height } = Dimensions.get('window');

interface VideoMomentCardProps {
  clip: Clip;
  onLike?: (clipId: string) => void;
  onComment?: (clipId: string) => void;
  onShare?: (clipId: string) => void;
  onNavigateToComments?: (clipId: string) => void;
  onPlayTrailer?: (videoId: string) => void;
  isLiked?: boolean;
}

/**
 * VideoMomentCard - Full-screen video moment card with overlay UI
 * 
 * Displays:
 * - Full-screen YouTube embed (or placeholder for demo)
 * - Movie title & description
 * - Right-side action buttons (like, comment, share)
 * - Bottom info overlay
 */
export const VideoMomentCard: React.FC<VideoMomentCardProps> = ({
  clip,
  onLike,
  onComment,
  onShare,
  onNavigateToComments,
  onPlayTrailer,
  isLiked: initialIsLiked = false,
}) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      if (isLiked) {
        await clipService.unlikeClip(currentUser.uid, clip.id);
      } else {
        await clipService.likeClip(currentUser.uid, clip.id);
      }
      
      setIsLiked(!isLiked);
      onLike?.(clip.id);
    } catch (error) {
      console.error('Error liking clip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordView = async () => {
    try {
      await clipService.recordView(clip.id);
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  React.useEffect(() => {
    // Record view when clip is displayed
    handleRecordView();
  }, [clip.id]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Video Area */}
      <View style={styles.videoContainer}>
        {/* YouTube Embed (Placeholder for web/mock) */}
        <View style={[styles.videoPlaceholder, {backgroundColor: colors.card}]}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlayTrailer?.(clip.videoId)}
          >
            <Ionicons name="play" size={64} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.videoPlaceholderText}>
            {clip.title}
          </Text>
          
          {/* YouTube embed would go here on mobile */}
          {/* <YouTube
            videoId={clip.videoId}
            height={height * 0.85}
            width={width}
            play={true}
          /> */}
        </View>

        {/* Overlay: Bottom Info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomOverlay}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
        >
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              🎬 {clip.title}
            </Text>
            <Text style={styles.movieDescription} numberOfLines={2}>
              {clip.description}
            </Text>
            
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="heart" size={16} color="#ff6b6b" />
                <Text style={styles.statText}>{clip.likes}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="chatbubble" size={16} color="#4dabf7" />
                <Text style={styles.statText}>0</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="eye" size={16} color="#adb5bd" />
                <Text style={styles.statText}>{clip.views}</Text>
              </View>
            </View>

            {/* Watch Trailer Button */}
            <TouchableOpacity
              style={styles.trailerButton}
              onPress={() => onPlayTrailer?.(clip.videoId)}
            >
              <Ionicons name="play-circle" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.trailerButtonText}>Watch Trailer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Overlay: Right-side Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Like Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            disabled={isLoading}
          >
            <View
              style={[
                styles.actionButtonInner,
                isLiked && styles.actionButtonActive,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={32}
                    color={isLiked ? '#ff6b6b' : 'white'}
                  />
                  <Text style={styles.actionLabel}>
                    {clip.likes + (isLiked ? 1 : 0)}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onNavigateToComments?.(clip.id) || onComment?.(clip.id)}
          >
            <View style={styles.actionButtonInner}>
              <Ionicons name="chatbubble-outline" size={32} color="white" />
              <Text style={styles.actionLabel}>0</Text>
            </View>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare?.(clip.id)}
          >
            <View style={styles.actionButtonInner}>
              <Ionicons name="share-social-outline" size={32} color="white" />
            </View>
          </TouchableOpacity>

          {/* More Options */}
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonInner}>
              <Ionicons name="ellipsis-vertical" size={32} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom indicator: swipe up for next */}
      <View style={styles.swipeHint}>
        <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
        <Text style={[styles.swipeHintText, {color: colors.textSecondary}]}>
          Swipe up
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoPlaceholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 32,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    paddingBottom: 60,
    paddingHorizontal: 16,
    paddingTop: 40,
    justifyContent: 'flex-end',
    zIndex: 5,
  },
  movieInfo: {
    marginBottom: 16,
  },
  movieTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  movieDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{translateY: -60}],
    zIndex: 10,
    gap: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    borderColor: 'rgba(255, 107, 107, 0.8)',
  },
  actionLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.5)',
  },
  trailerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VideoMomentCard;
