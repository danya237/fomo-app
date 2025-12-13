import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

export const MovieCardSkeleton = () => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.border,
            opacity,
          },
        ]}
      />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.title,
            { backgroundColor: colors.border, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.subtitle,
            { backgroundColor: colors.border, opacity },
          ]}
        />
        <View style={styles.detailsRow}>
          <Animated.View
            style={[
              styles.detail,
              { backgroundColor: colors.border, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.detail,
              { backgroundColor: colors.border, opacity },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.description,
            { backgroundColor: colors.border, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.description,
            { backgroundColor: colors.border, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.button,
            { backgroundColor: colors.border, opacity },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    height: 28,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
  },
  subtitle: {
    height: 16,
    borderRadius: 6,
    marginBottom: 8,
    width: '40%',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  detail: {
    height: 20,
    borderRadius: 6,
    width: 60,
  },
  description: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  button: {
    height: 44,
    borderRadius: 22,
    marginTop: 12,
    width: '60%',
    alignSelf: 'center',
  },
});
