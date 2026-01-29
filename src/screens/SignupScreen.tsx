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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const SignupScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const { colors } = useTheme();
  const { signup, isLoading } = useAuth();
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    // Validation
    if (!displayName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      await signup(email, password, displayName);
      Alert.alert(t('common.success'), t('auth.accountCreated') || 'Account created! Welcome to FOMO 🎉');
      // Navigation happens automatically via AuthContext listener
    } catch (err: any) {
      const errorCode = err.code || 'unknown';
      const errorMessages: {[key: string]: string} = {
        'auth/email-already-in-use': 'Email already in use',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak',
        'auth/operation-not-allowed': 'Email/password accounts not enabled',
      };
      const message = errorMessages[errorCode] || err.message;
      setError(message);
      Alert.alert(t('auth.signupFailed'), message);
    }
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
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, {color: colors.text}]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            Join FOMO and discover amazing moments
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Display Name */}
          <View style={[styles.inputGroup, {backgroundColor: colors.card}]}>
            <Text style={[styles.label, {color: colors.text}]}>Full Name</Text>
            <TextInput
              style={[styles.input, {color: colors.text}]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              editable={!isLoading}
            />
          </View>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <View style={[styles.inputGroup, {backgroundColor: colors.card}]}>
            <Text style={[styles.label, {color: colors.text}]}>Confirm Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[styles.input, {color: colors.text, flex: 1}]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Signup Button */}
          <TouchableOpacity 
            onPress={handleSignup} 
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
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.termsText, {color: colors.textSecondary}]}>
            By creating an account, you agree to our Terms & Conditions
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backButton: {
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '400',
  },
});
