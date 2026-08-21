import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuthStore } from '../../store/auth.store';
import api from '../../services/api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [showPass, setShowPass] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);

      // Route based on role
      if (user.role === 'delivery_partner') {
        router.replace('/(delivery)');
      } else {
        router.replace('/(customer)');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const apiMsg = err.response?.data?.message;
      const networkMsg = err.message ? `(${err.message})` : '';
      const msg = apiMsg || (err.message ? `Connection error ${networkMsg}. Check if backend is reachable at ${api.defaults.baseURL}` : 'Login failed. Please try again.');
      setError('password', { message: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your HealthyFood account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  id="login-email"
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <TextInput
                    id="login-password"
                    style={styles.inputInner}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.neutral[400]}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{showPass ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            id="login-submit"
            style={[styles.submitBtn, isSubmitting && styles.submitDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[16],
    paddingBottom: Spacing[8],
  },
  header: { alignItems: 'center', marginBottom: Spacing[8] },
  logoEmoji: { fontSize: 48, marginBottom: Spacing[3] },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    marginTop: Spacing[1],
  },
  form: { gap: Spacing[5] },
  field: { gap: Spacing[1] },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: Spacing[4],
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
  },
  inputError: { borderColor: Colors.red[500] },
  eyeBtn: { paddingHorizontal: Spacing[3] },
  eyeText: { fontSize: 18 },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.red[500],
    marginTop: 2,
  },
  submitBtn: {
    height: 54,
    backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
  },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing[6],
  },
  footerText: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500] },
  footerLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brand[600],
    fontWeight: '600',
  },
  backBtn: { alignItems: 'center', marginTop: Spacing[4] },
  backText: { color: Colors.neutral[400], fontSize: Typography.fontSize.sm },
});
