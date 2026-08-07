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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'customer', label: '🛒 Customer', desc: 'Shop healthy food & groceries' },
  { value: 'delivery_partner', label: '🛵 Delivery Partner', desc: 'Deliver orders & earn' },
  { value: 'store_owner', label: '🏪 Store Owner', desc: 'Register & manage your store' },
];

export default function RegisterScreen() {
  const [selectedRole, setSelectedRole] = useState<string>('customer');
  const [showPass, setShowPass] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await api.post('/auth/register', { ...payload, role: selectedRole });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);

      if (user.role === 'delivery_partner') {
        router.replace('/(delivery)');
      } else if (user.role === 'store_owner') {
        // Store owners go to web dashboard — show message
        router.replace('/(auth)/login');
      } else {
        router.replace('/(customer)');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError('email', { message: msg });
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join HealthyFood today</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionLabel}>I want to join as</Text>
          <View style={styles.roleGrid}>
            {roleOptions.map((role) => (
              <TouchableOpacity
                key={role.value}
                id={`role-${role.value}`}
                style={[
                  styles.roleCard,
                  selectedRole === role.value && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole(role.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>{role.label.split(' ')[0]}</Text>
                <Text style={[
                  styles.roleLabel,
                  selectedRole === role.value && styles.roleLabelActive,
                ]}>
                  {role.label.slice(3)}
                </Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  id="register-name"
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Rahul Sharma"
                  placeholderTextColor={Colors.neutral[400]}
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  id="register-email"
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number <Text style={styles.optional}>(optional)</Text></Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  id="register-phone"
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="9876543210"
                  placeholderTextColor={Colors.neutral[400]}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
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
                    id="register-password"
                    style={styles.inputInner}
                    placeholder="Min. 8 characters"
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

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  id="register-confirm-password"
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.neutral[400]}
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            id="register-submit"
            style={[styles.submitBtn, isSubmitting && styles.submitDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[8],
    gap: Spacing[6],
  },
  header: { alignItems: 'center' },
  logoEmoji: { fontSize: 40, marginBottom: Spacing[2] },
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
  roleSection: { gap: Spacing[3] },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  roleGrid: { flexDirection: 'row', gap: Spacing[2] },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing[3],
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  roleCardActive: {
    borderColor: Colors.brand[500],
    backgroundColor: Colors.brand[50],
  },
  roleEmoji: { fontSize: 22, marginBottom: Spacing[1] },
  roleLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  roleLabelActive: { color: Colors.brand[700] },
  roleDesc: {
    fontSize: 9,
    color: Colors.neutral[400],
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  form: { gap: Spacing[4] },
  field: { gap: Spacing[1] },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  optional: { fontWeight: '400', color: Colors.neutral[400] },
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
  },
  footerText: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500] },
  footerLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brand[600],
    fontWeight: '600',
  },
});
