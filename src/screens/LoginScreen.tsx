import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('common.validation.required'));
      return;
    }

    try {
      setError('');
      await login(email, password);
      // Navigation happens automatically via AuthContext listener
    } catch (err: any) {
      const errorCode = err.code || 'unknown';
      const errorMessages: {[key: string]: string} = {
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Wrong password',
        'auth/invalid-email': 'Invalid email',
        'auth/too-many-requests': 'Too many failed login attempts. Try again later.',
      };
      setError(errorMessages[errorCode] || err.message);
      Alert.alert('Login Failed', errorMessages[errorCode] || err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available in the next update');
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.logo, {color: colors.text}]}>🎬 FOMO</Text>
          <Text style={[styles.tagline, {color: colors.textSecondary}]}>
            {t('common.appName')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={[styles.inputGroup, {backgroundColor: colors.card}]}>
            <Text style={[styles.label, {color: colors.text}]}>Email</Text>
            <TextInput
              style={[styles.input, {color: colors.text}]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputGroup, {backgroundColor: colors.card}]}>
            <Text style={[styles.label, {color: colors.text}]}>Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, {color: colors.text, flex: 1}]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={isLoading}
            style={{marginTop: 24}}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={[styles.divider, {borderColor: colors.border}]}>
            <View style={{flex: 1, height: 1, backgroundColor: colors.border}} />
            <Text style={[styles.dividerText, {color: colors.textSecondary}]}>or</Text>
            <View style={{flex: 1, height: 1, backgroundColor: colors.border}} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={[styles.googleButton, {borderColor: colors.border}]}>
              <Text style={styles.googleIcon}>🔵</Text>
              <Text style={[styles.googleText, {color: colors.text}]}>
                Sign in with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footerSection}>
          <Text style={[styles.footerText, {color: colors.textSecondary}]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: -8,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  googleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});
