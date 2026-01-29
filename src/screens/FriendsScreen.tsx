import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  moviesLiked: number;
  commonMovies: number;
}

export const FriendsScreen = () => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: '1',
      name: 'John Doe',
      username: '@johndoe',
      avatar: '👨',
      moviesLiked: 127,
      commonMovies: 45,
    },
    {
      id: '2',
      name: 'Jane Smith',
      username: '@janesmith',
      avatar: '👩',
      moviesLiked: 89,
      commonMovies: 23,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      username: '@mikej',
      avatar: '🧑',
      moviesLiked: 156,
      commonMovies: 67,
    },
  ]);

  const handleAddFriend = () => {
    Alert.alert(
      '➕ ' + t('friends.addFriend'),
      t('friends.enterUsername') || 'Enter friend\'s username or email',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.add'), onPress: () => Alert.alert('✅', t('friends.requestSent')) },
      ]
    );
  };

  const handleRemoveFriend = (friendId: string) => {
    Alert.alert(
      '🗑️ ' + t('common.delete'),
      t('friends.removeConfirmation') || 'Are you sure?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFriends(prev => prev.filter(f => f.id !== friendId));
          },
        },
      ]
    );
  };

  const filteredFriends = friends.filter(
    friend =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <LinearGradient
        colors={theme === 'dark' ? ['#667eea', '#764ba2'] : ['#a8edea', '#fed6e3']}
        style={styles.heroHeader}
      >
        <View style={styles.heroContent}>
          <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="people" size={40} color="white" />
          </View>
          <Text style={styles.heroTitle}>Friends</Text>
          <Text style={styles.heroSubtitle}>Share your movie taste</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search friends..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="person-add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="people" size={24} color="#667eea" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{friends.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Friends</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="film" size={24} color="#f093fb" />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {friends.reduce((sum, f) => sum + f.commonMovies, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Matches</Text>
          </View>
        </View>

        {/* Friends List */}
        <View style={styles.friendsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Friends ({filteredFriends.length})
          </Text>

          {filteredFriends.map((friend) => (
            <View key={friend.id} style={[styles.friendCard, { backgroundColor: colors.card }]}>
              <View style={styles.friendInfo}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarEmoji}>{friend.avatar}</Text>
                </LinearGradient>
                <View style={styles.friendDetails}>
                  <Text style={[styles.friendName, { color: colors.text }]}>
                    {friend.name}
                  </Text>
                  <Text style={[styles.friendUsername, { color: colors.textSecondary }]}>
                    {friend.username}
                  </Text>
                  <View style={styles.friendStats}>
                    <Ionicons name="heart" size={12} color="#f093fb" />
                    <Text style={[styles.friendStatText, { color: colors.textSecondary }]}>
                      {friend.moviesLiked} movies
                    </Text>
                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" style={{ marginLeft: 10 }} />
                    <Text style={[styles.friendStatText, { color: colors.textSecondary }]}>
                      {friend.commonMovies} common
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.friendActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => Alert.alert('🎬', t('friends.seeMovies'))}
                >
                  <Ionicons name="film" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                  onPress={() => handleRemoveFriend(friend.id)}
                >
                  <Ionicons name="trash" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  friendsSection: {
    padding: 20,
    gap: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  friendDetails: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendUsername: {
    fontSize: 14,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  friendStatText: {
    fontSize: 12,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
