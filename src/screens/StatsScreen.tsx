import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getUserStats } from '../utils/recommendations';
import { Ionicons } from '@expo/vector-icons';

export const StatsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalLikes: 0,
    topGenres: [] as { genre: string; count: number }[],
    averageRating: 0,
    yearDistribution: [] as { year: string; count: number }[],
  });

  // Перезавантажуємо статистику коли повертаємось на екран
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const userStats = await getUserStats();
    setStats(userStats);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View style={styles.content}>
        {/* Total Likes */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="heart" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t('stats.totalLikes')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {stats.totalLikes}
          </Text>
        </View>

        {/* Average Rating */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFD700' + '20' }]}>
            <Ionicons name="star" size={32} color="#FFD700" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t('stats.averageRating')}
          </Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
          </Text>
        </View>

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('stats.topGenres')}
            </Text>
            {stats.topGenres.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.genreItem}>
                <View style={styles.genreLeft}>
                  <Text style={[styles.genreRank, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                  <Text style={[styles.genreName, { color: colors.text }]}>
                    {item.genre}
                  </Text>
                </View>
                <View style={[styles.genreBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.genreCount, { color: colors.primary }]}>
                    {item.count}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Year Distribution */}
        {stats.yearDistribution.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('stats.yearDistribution')}
            </Text>
            {stats.yearDistribution.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.yearItem}>
                <Text style={[styles.yearText, { color: colors.text }]}>
                  {item.year}
                </Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: colors.secondary,
                        width: `${(item.count / stats.totalLikes) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.yearCount, { color: colors.textSecondary }]}>
                  {item.count}
                </Text>
              </View>
            ))}
          </View>
        )}

        {stats.totalLikes === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('stats.noData')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genreRank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  genreName: {
    fontSize: 16,
    fontWeight: '600',
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  genreCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    width: 50,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  yearCount: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
