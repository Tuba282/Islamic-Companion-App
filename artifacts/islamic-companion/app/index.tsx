import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppState } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';
import { PrimaryButton } from '@/components/Primitives';

export default function OnboardingScreen() {
  const router = useRouter();
  const { ready, onboardingComplete, completeOnboarding } = useAppState();
  const colors = useColors();

  React.useEffect(() => {
    if (ready && onboardingComplete) router.replace('/(tabs)');
  }, [ready, onboardingComplete, router]);

  if (!ready || onboardingComplete) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.gold} /></View>;

  return (
    <LinearGradient colors={[colors.background, colors.surfaceRaised, colors.background]} style={styles.container}>
      <View style={styles.stars}><Text style={[styles.star, { color: colors.gold }]}>✦</Text><Text style={[styles.starSmall, { color: colors.gold }]}>✧</Text><Text style={[styles.star, { color: colors.gold }]}>✦</Text></View>
      <View style={styles.brand}>
        <View style={[styles.logoRing, { borderColor: colors.gold }]}><Image source={require('@/assets/images/icon.png')} style={styles.logo} /></View>
        <Text style={[styles.kicker, { color: colors.gold }]}>ISLAMIC COMPANION</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your daily{'\n'}companion to worship.</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>Stay connected with your Deen through prayer, remembrance, and mindful moments.</Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.dots}><View style={[styles.dot, { backgroundColor: colors.gold, width: 22 }]} /><View style={[styles.dot, { backgroundColor: colors.border }]} /><View style={[styles.dot, { backgroundColor: colors.border }]} /></View>
        <PrimaryButton label="Get started" onPress={async () => { await completeOnboarding(); router.replace('/(tabs)'); }} icon="arrow-right" />
        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>Made for moments of reflection</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingTop: 90, paddingBottom: 35 },
  stars: { position: 'absolute', top: 80, right: 34, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  star: { fontSize: 20 },
  starSmall: { fontSize: 12, marginTop: 8 },
  brand: { alignItems: 'center', marginTop: 65 },
  logoRing: { borderWidth: 1, width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  kicker: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 2.6, marginBottom: 16 },
  title: { fontSize: 34, lineHeight: 42, fontFamily: 'Inter_700Bold', textAlign: 'center', letterSpacing: -0.8 },
  description: { maxWidth: 285, fontSize: 14, lineHeight: 22, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 18 },
  bottom: { gap: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  dot: { height: 4, width: 6, borderRadius: 4 },
  footnote: { fontSize: 11, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});