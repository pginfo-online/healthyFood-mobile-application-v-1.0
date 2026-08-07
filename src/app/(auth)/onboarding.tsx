/* eslint-disable import/no-unresolved */
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, Easing,
  FadeIn, SlideInDown,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const features = [
  { emoji: '🥗', title: 'Shop Healthy', desc: 'Browse curated healthy foods & groceries' },
  { emoji: '🏷️', title: 'Full Nutrition Info', desc: 'Calories, macros & dietary tags on every product' },
  { emoji: '🚀', title: 'Fast Delivery', desc: 'Fresh food delivered right to your door' },
  { emoji: '🌿', title: 'Zero Dark Patterns', desc: 'Transparent pricing, no hidden fees' },
];

export default function OnboardingScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#052e16', '#14532d', '#15803d']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.logoText}>HealthyFood</Text>
          <Text style={styles.tagline}>Your healthy food marketplace</Text>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {features.map((f, i) => (
            <Animated.View
              key={f.title}
              entering={FadeIn.delay(300 + i * 100)}
              style={styles.featureRow}
            >
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* CTA Buttons */}
        <Animated.View entering={SlideInDown.delay(700)} style={styles.buttons}>
          <TouchableOpacity
            id="onboarding-get-started"
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            id="onboarding-login"
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: { width: 300, height: 300, top: -100, right: -100 },
  circle2: { width: 200, height: 200, bottom: 200, left: -80 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: height * 0.12,
    paddingBottom: Spacing[8],
    justifyContent: 'space-between',
  },
  logoContainer: { alignItems: 'center' },
  logoEmoji: { fontSize: 64, marginBottom: Spacing[2] },
  logoText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brand[300],
    marginTop: Spacing[1],
  },
  features: { gap: Spacing[4] },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  featureEmoji: { fontSize: 28, lineHeight: 36 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.white,
  },
  featureDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.brand[300],
    marginTop: 2,
    lineHeight: 20,
  },
  buttons: { gap: Spacing[3] },
  primaryBtn: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.brand[700],
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  secondaryBtn: { alignItems: 'center', paddingVertical: Spacing[2] },
  secondaryBtnText: {
    color: Colors.brand[300],
    fontSize: Typography.fontSize.sm,
  },
});
