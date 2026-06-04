import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../locales/i18n';
import { clearAllLikes, clearAllDislikes } from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, theme, toggleTheme } = useTheme();
  const { hapticsEnabled, toggleHaptics, notificationsEnabled, toggleNotifications } = useSettings();
  const { t, i18n } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguageChange = () => {
    setLanguageModalVisible(true);
  };

  const selectLanguage = (langCode: string) => {
    changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const getCurrentLanguageName = () => {
    const lang = i18n.language;
    const languageMap: { [key: string]: string } = {
      en: '🇬🇧 ' + t('languages.en'),
      uk: '🇺🇦 ' + t('languages.uk'),
      no: '🇳🇴 ' + t('languages.no'),
      de: '🇩🇪 ' + t('languages.de'),
      es: '🇪🇸 ' + t('languages.es'),
      it: '🇮🇹 ' + t('languages.it'),
    };
    return languageMap[lang] || languageMap.en;
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirmation') || 'This will delete all your likes and dislikes. Continue?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([clearAllLikes(), clearAllDislikes()]);
              Alert.alert('✅', t('settings.dataCleared'));
            } catch (error) {
              Alert.alert('❌', t('settings.clearError'));
            }
          },
        },
      ]
    );
  };

  const languages = [
    { code: 'en', name: 'English', emoji: '🇬🇧' },
    { code: 'uk', name: 'Українська', emoji: '🇺🇦' },
    { code: 'no', name: 'Norsk', emoji: '🇳🇴' },
    { code: 'de', name: 'Deutsch', emoji: '🇩🇪' },
    { code: 'es', name: 'Español', emoji: '🇪🇸' },
    { code: 'it', name: 'Italiano', emoji: '🇮🇹' },
  ];

  return (
    <>
      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                🌍 {t('settings.language')}
              </Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.languageList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    { 
                      backgroundColor: i18n.language === lang.code 
                        ? colors.primary + '20' 
                        : 'transparent' 
                    }
                  ]}
                  onPress={() => selectLanguage(lang.code)}
                >
                  <Text style={styles.languageEmoji}>{lang.emoji}</Text>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {lang.name}
                  </Text>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Hero Header */}
        <LinearGradient
          colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#f093fb', '#f5576c']}
          style={styles.heroHeader}
        >
        <View style={styles.heroContent}>
          <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="settings" size={40} color="white" />
          </View>
          <Text style={styles.heroTitle}>Settings</Text>
          <Text style={styles.heroSubtitle}>Customize your FOMO experience</Text>
        </View>
      </LinearGradient>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          🎨 APPEARANCE
        </Text>

        <SettingItem
          icon="language"
          title={t('settings.language')}
          subtitle={getCurrentLanguageName()}
          onPress={handleLanguageChange}
        />

        <SettingItem
          icon={theme === 'dark' ? 'moon' : 'sunny'}
          title={t('settings.theme')}
          subtitle={theme === 'dark' ? t('settings.darkTheme') : t('settings.lightTheme')}
          rightComponent={
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor="white"
              ios_backgroundColor="#e0e0e0"
            />
          }
        />
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ⚡️ EXPERIENCE
        </Text>

        <SettingItem
          icon="phone-portrait"
          title="Haptic Feedback"
          subtitle={hapticsEnabled ? '✅ Enabled' : '⛔️ Disabled'}
          rightComponent={
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
              thumbColor="white"
              ios_backgroundColor="#e0e0e0"
            />
          }
        />

        <SettingItem
          icon="notifications"
          title={t('settings.notifications')}
          subtitle={notificationsEnabled ? '🔔 Enabled' : '🔕 Disabled'}
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e0e0e0', true: '#FF9800' }}
              thumbColor="white"
              ios_backgroundColor="#e0e0e0"
            />
          }
        />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          👤 ACCOUNT
        </Text>

        <SettingItem
          icon="person-circle"
          title="Profile"
          subtitle="Manage your account details"
          onPress={() => {
            try {
              (navigation as any).navigate('Profile');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
        />

        <SettingItem
          icon="bar-chart"
          title="Statistics"
          subtitle="View your movie insights"
          onPress={() => {
            try {
              (navigation as any).navigate('Stats');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
        />
      </View>

      {/* About & Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ℹ️ ABOUT
        </Text>

        <SettingItem
          icon="information-circle"
          title="About FOMO"
          subtitle="v2.0.0 • Learn more"
          onPress={() => Alert.alert(
            '🎬 FOMO',
            'Find Outstanding Movie Options\n\nVersion 2.0.0\n\n✨ Features:\n• TikTok-style video feed\n• AI-powered movie recommendations\n• Multi-language support (UA, EN, NO, DE, ES, IT)\n• Dark/Light themes\n• Movie details with cast & reviews\n• Friends & social features\n\n❤️ Made with passion for movie lovers\n\n© 2025 FOMO\nPowered by TMDb & YouTube API'
          )}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#FF5252' }]}>
          ⚠️ DANGER ZONE
        </Text>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FF5252' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={22} color="white" />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.footerBadge, { backgroundColor: colors.card }]}>
          <Ionicons name="film" size={24} color={colors.primary} />
        </View>
        <Text style={[styles.footerTitle, { color: colors.text }]}>
          FOMO
        </Text>
        <Text style={[styles.footerSubtitle, { color: colors.textSecondary }]}>
          Find Outstanding Movie Options
        </Text>
        <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>
          v2.0.0 • © 2025
        </Text>
        <Text style={[styles.footerCredit, { color: colors.textSecondary }]}>
          Made with ❤️ by passionate developers
        </Text>
        <Text style={[styles.footerApi, { color: colors.textSecondary }]}>
          Powered by TMDb & YouTube API
        </Text>
      </View>
    </ScrollView>
    </>
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
    marginBottom: 10,
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
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 5,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 5,
  },
  footerSubtitle: {
    fontSize: 12,
    marginBottom: 15,
  },
  footerVersion: {
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.6,
  },
  footerCredit: {
    fontSize: 11,
    marginBottom: 5,
    opacity: 0.6,
  },
  footerApi: {
    fontSize: 10,
    opacity: 0.5,
  },
  footerText: {
    fontSize: 12,
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    gap: 15,
  },
  languageEmoji: {
    fontSize: 28,
  },
  languageName: {
    fontSize: 18,
    flex: 1,
  },
});
