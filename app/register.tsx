import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, error, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入姓名');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('错误', '请输入邮箱地址');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('错误', '请输入密码');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('错误', '密码长度至少为 6 个字符');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await signUp(email, password, name);
      // 注册成功后跳转到主页
      console.log('[Register] 注册成功，跳转到主页');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('注册失败:', err);
      Alert.alert('注册失败', error || '请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join us today
          </Text>
        </View>

        {/* 错误提示 */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#FFE5E5' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="John Doe"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="example@email.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.passwordInput,
                { color: colors.text },
              ]}
              placeholder="••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 20, color: colors.textSecondary }}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            至少 6 个字符
          </Text>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.passwordInput,
                { color: colors.text },
              ]}
              placeholder="••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 20, color: colors.textSecondary }}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.signUpButton,
            {
              backgroundColor: '#000000',
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.signInLink, { color: colors.text }]}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={{ color: colors.textSecondary }}>or</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthContainer}>
          <TouchableOpacity
            style={[
              styles.oauthButton,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
            disabled={isLoading}
          >
            <Text style={styles.oauthIcon}>🐙</Text>
            <Text style={[styles.oauthButtonText, { color: colors.text }]}>GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.oauthButton,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
            disabled={isLoading}
          >
            <Text style={styles.oauthIcon}>🔵</Text>
            <Text style={[styles.oauthButtonText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Secured by{' '}
            <Text style={[styles.footerBrand, { color: colors.primary }]}>InsForge</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const lightColors = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#808080',
  border: '#E8E8E8',
  primary: '#007AFF',
  inputBg: '#F5F5F5',
  cardBg: '#FFFFFF',
};

const darkColors = {
  background: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#333333',
  primary: '#0A84FF',
  inputBg: '#2A2A2A',
  cardBg: '#2A2A2A',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  signUpButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signInLink: {
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  oauthIcon: {
    fontSize: 18,
  },
  oauthButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
  },
  footerBrand: {
    fontWeight: '600',
  },
});
