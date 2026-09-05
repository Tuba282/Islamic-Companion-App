import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Header, GlassCard } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';
import { gregorianToHijri, nextRamadanStart } from '@/lib/islamic';

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    clock: [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(' : '),
  };
}

export default function RamadanScreen() {
  const colors = useColors();
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const target = useMemo(() => nextRamadanStart(now), [now.getFullYear(), now.getMonth(), now.getDate()]);
  const remaining = formatRemaining(target.getTime() - now.getTime());
  const targetHijri = gregorianToHijri(target);
  const todayHijri = gregorianToHijri(now);
  const isRamadan = todayHijri.month === 9;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <Screen>
    <Header title="Ramadan" subtitle="A month of mercy and reflection" onBack={() => router.back()} />
    <LinearGradient colors={[colors.gold, '#B8914B']} style={styles.hero}>
      <View style={styles.moon}><Feather name="moon" size={22} color={colors.primaryForeground} /></View>
      <Text style={[styles.label, { color: colors.primaryForeground }]}>{isRamadan ? 'RAMADAN IS HERE' : 'NEXT RAMADAN'}</Text>
      <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>{isRamadan ? `Day ${todayHijri.day}` : `Ramadan ${targetHijri.year} AH`}</Text>
      <Text style={[styles.heroDate, { color: colors.primaryForeground }]}>{isRamadan ? 'May Allah accept your fasting and prayers' : target.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
    </LinearGradient>
    <GlassCard style={styles.countdown}>
      <View style={styles.countdownCopy}>
        <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>{isRamadan ? 'TIME UNTIL THE NEXT RAMADAN' : 'TIME UNTIL RAMADAN'}</Text>
        <Text style={[styles.days, { color: colors.foreground }]}>{remaining.days} <Text style={styles.daysUnit}>days</Text></Text>
        <Text style={[styles.clock, { color: colors.gold }]}>{remaining.clock}</Text>
        <Text style={[styles.units, { color: colors.mutedForeground }]}>hours     minutes     seconds</Text>
      </View>
      <Feather name="sunrise" size={28} color={colors.gold} />
    </GlassCard>
    <View style={styles.infoRow}>
      <GlassCard style={styles.infoCard}><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>START DATE</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{target.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text></GlassCard>
      <GlassCard style={styles.infoCard}><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>HIJRI DATE</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{targetHijri.day} Ramadan</Text></GlassCard>
    </View>
    <Text style={[styles.note, { color: colors.mutedForeground }]}>The start date is calculated locally and may vary by one day according to local moon sighting.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, padding: 20, alignItems: 'center', minHeight: 182 },
  moon: { width: 45, height: 45, borderRadius: 16, backgroundColor: 'rgba(23,53,46,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  label: { fontSize: 10, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  heroTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', marginTop: 7 },
  heroDate: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 7, textAlign: 'center' },
  countdown: { marginTop: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countdownCopy: { flex: 1 },
  countdownLabel: { fontSize: 9, letterSpacing: 1.2, fontFamily: 'Inter_700Bold' },
  days: { fontSize: 28, fontFamily: 'Inter_700Bold', marginTop: 5 },
  daysUnit: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  clock: { fontSize: 19, fontFamily: 'Inter_700Bold', marginTop: 5 },
  units: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 2 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  infoCard: { flex: 1, padding: 13 },
  infoLabel: { fontSize: 9, letterSpacing: 1, fontFamily: 'Inter_700Bold' },
  infoValue: { fontSize: 15, fontFamily: 'Inter_700Bold', marginTop: 7 },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 12, paddingHorizontal: 8 },
});