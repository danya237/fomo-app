import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'VideoPlayer'>;

export const VideoPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { videoKey } = route.params as { videoKey: string };

  useEffect(() => {
    // On web platform, just open YouTube in new tab
    if (Platform.OS === 'web') {
      const url = `https://www.youtube.com/watch?v=${videoKey}`;
      Linking.openURL(url);
      navigation.goBack();
    }
  }, [videoKey, navigation]);

  // For web, show nothing as we redirect
  if (Platform.OS === 'web') {
    return null;
  }

  // For mobile, use WebView (imported conditionally)
  const { WebView } = require('react-native-webview');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.card }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      <WebView
        style={styles.webview}
        source={{
          uri: `https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&modestbranding=1&rel=0`,
        }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
