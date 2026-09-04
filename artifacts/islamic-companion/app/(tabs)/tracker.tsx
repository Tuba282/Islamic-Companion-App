import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState, PrayerKey } from '@/context/AppState';
import { Screen, Header, GlassCard, SectionTitle, ProgressBar } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const prayers: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const dayKey = (offset: number) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };

export default function TrackerScreen() {
  const colors = useColors();
  const { completedPrayers, prayerHistory, togglePrayer } = useAppState();
  const completed = prayers.filter((key) => completedPrayers[key]).length;
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => { const offset = index - 6; const key = dayKey(offset); const record = offset === 0 ? completedPrayers : prayerHistory[key]; return { key, offset, completed: record ? prayers.filter((prayer) => record[prayer]).length : 0 }; }), [completedPrayers, prayerHistory]);
  return <Screen>
    <Header title="Salah Tracker" subtitle="A clear view of your prayer consistency" />
    <GlassCard accent style={styles.summary}><View><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>TODAY'S PROGRESS</Text><Text style={[styles.summaryCount, { color: colors.foreground }]}>{completed}<Text style={{ color: colors.mutedForeground }}> / 5</Text></Text><Text style={[styles.summaryHint, { color: colors.gold }]}>{completed === 5 ? 'All prayers completed today' : 'Tap a prayer below to update it'}</Text></View><View style={[styles.progressCircle, { borderColor: colors.gold }]}><Text style={[styles.circleText, { color: colors.gold }]}>{completed * 20}%</Text></View></GlassCard>
    <SectionTitle title="Today's prayers" />
    <GlassCard style={styles.list}>{prayers.map((name) => <Pressable key={name} onPress={() => togglePrayer(name)} style={({ pressed }) => [styles.prayerRow, pressed && { opacity: 0.7 }]}><View style={[styles.check, { borderColor: completedPrayers[name] ? colors.success : colors.border, backgroundColor: completedPrayers[name] ? colors.success : 'transparent' }]}>{completedPrayers[name] ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}</View><View style={styles.prayerInfo}><Text style={[styles.prayerName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.status, { color: completedPrayers[name] ? colors.success : colors.mutedForeground }]}>{completedPrayers[name] ? 'Completed' : 'Tap to mark as completed'}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>)}</GlassCard>
    <SectionTitle title="Last 7 days" action={`${week.reduce((sum, day) => sum + day.completed, 0)} / 35 prayers`} />
    <GlassCard><View style={styles.chart}>{week.map((day) => <View key={day.key} style={styles.barGroup}><View style={[styles.barTrack, { backgroundColor: colors.muted }]}><View style={[styles.bar, { height: `${Math.max(day.completed === 0 ? 4 : day.completed * 20, 8)}%`, backgroundColor: day.offset === 0 ? colors.gold : colors.success }]} /></View><Text style={[styles.day, { color: day.offset === 0 ? colors.gold : colors.mutedForeground }]}>{day.offset === 0 ? 'Today' : new Date(`${day.key}T12:00:00`).toLocaleDateString([], { weekday: 'short' }).slice(0, 2)}</Text><Text style={[styles.dayCount, { color: colors.mutedForeground }]}>{day.completed}</Text></View>)}</View><ProgressBar value={completed * 20} /><Text style={[styles.chartHint, { color: colors.mutedForeground }]}>Your progress is saved on this device and resets into a new day automatically.</Text></GlassCard>
  </Screen>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  summaryLabel: { fontSize: 9, letterSpacing: 1.1, fontFamily: 'Inter_700Bold' },
  summaryCount: { fontSize: 37, fontFamily: 'Inter_700Bold', marginTop: 5 },
  summaryHint: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_500Medium', marginTop: 4, maxWidth: 180 },
  progressCircle: { width: 83, height: 83, borderRadius: 42, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  circleText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  list: { paddingVertical: 5 },
  prayerRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 25, height: 25, borderWidth: 1.5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  prayerInfo: { flex: 1 },
  prayerName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  status: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 4 },
  chart: { height: 145, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 3, marginBottom: 15 },
  barGroup: { height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4, minWidth: 30 },
  barTrack: { height: 105, width: 19, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: 19, borderRadius: 8, minHeight: 5 },
  day: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
  dayCount: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  chartHint: { fontSize: 10, lineHeight: 16, fontFamily: 'Inter_400Regular', marginTop: 11 },
});