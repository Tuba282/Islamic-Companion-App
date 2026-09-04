import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, GlassCard, SectionTitle } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const events = [['1 Dhul-Qadah', '11 May 2024'], ['Day of Arafah', '15 June 2024'], ['Eid al-Adha', '16 June 2024'], ['Islamic New Year', '07 July 2024']];

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const month = useMemo(() => new Date(2024, 4 + monthOffset, 1), [monthOffset]);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const start = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  return <Screen><Header title="Islamic Calendar" subtitle="Dhul-Qadah 1445 AH" onBack={() => router.back()} /><View style={styles.monthHead}><Pressable onPress={() => setMonthOffset((v) => v - 1)}><Feather name="chevron-left" size={19} color={colors.foreground} /></Pressable><Text style={[styles.month, { color: colors.foreground }]}>{month.toLocaleString([], { month: 'long', year: 'numeric' })}</Text><Pressable onPress={() => setMonthOffset((v) => v + 1)}><Feather name="chevron-right" size={19} color={colors.foreground} /></Pressable></View><GlassCard style={styles.calendar}><View style={styles.week}>{weekdays.map((day) => <Text key={day} style={[styles.weekday, { color: colors.mutedForeground }]}>{day}</Text>)}</View><View style={styles.grid}>{Array.from({ length: start }).map((_, i) => <View key={`empty-${i}`} style={styles.day} />)}{Array.from({ length: days }).map((_, i) => { const day = i + 1; const active = day === 11; return <View key={day} style={styles.day}>{<View style={[styles.dayCircle, active && { backgroundColor: colors.gold }]}><Text style={[styles.dayText, { color: active ? colors.primaryForeground : colors.foreground }]}>{day}</Text></View>}</View>; })}</View></GlassCard><SectionTitle title="Important events" /><GlassCard>{events.map(([event, date]) => <View key={event} style={styles.event}><View style={[styles.eventDot, { backgroundColor: colors.gold }]} /><Text style={[styles.eventName, { color: colors.foreground }]}>{event}</Text><Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{date}</Text></View>)}</GlassCard></Screen>;
}

const styles = StyleSheet.create({
  monthHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 8 },
  month: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  calendar: { padding: 13 },
  week: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 9 },
  weekday: { width: '14.2%', textAlign: 'center', fontSize: 9, fontFamily: 'Inter_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.2%', height: 39, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  event: { flexDirection: 'row', alignItems: 'center', minHeight: 43, gap: 10 },
  eventDot: { width: 7, height: 7, borderRadius: 4 },
  eventName: { flex: 1, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  eventDate: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});