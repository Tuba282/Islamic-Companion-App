import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, GlassCard, SectionTitle } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';
import { eventsForHijriMonth, gregorianToHijri, hijriMonthNames } from '@/lib/islamic';

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const month = useMemo(() => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1), [monthOffset, today.getFullYear(), today.getMonth()]);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const start = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const firstDayHijri = gregorianToHijri(month);
  const monthEvents = useMemo(() => eventsForHijriMonth(firstDayHijri.year, firstDayHijri.month), [firstDayHijri.month, firstDayHijri.year]);
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return <Screen>
    <Header title="Islamic Calendar" subtitle={`${hijriMonthNames[firstDayHijri.month - 1]} ${firstDayHijri.year} AH`} onBack={() => router.back()} />
    <View style={styles.monthHead}>
      <Pressable onPress={() => setMonthOffset((value) => value - 1)}><Feather name="chevron-left" size={19} color={colors.foreground} /></Pressable>
      <Text style={[styles.month, { color: colors.foreground }]}>{month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</Text>
      <Pressable onPress={() => setMonthOffset((value) => value + 1)}><Feather name="chevron-right" size={19} color={colors.foreground} /></Pressable>
    </View>
    <GlassCard style={styles.calendar}>
      <View style={styles.week}>{weekdays.map((day) => <Text key={day} style={[styles.weekday, { color: colors.mutedForeground }]}>{day}</Text>)}</View>
      <View style={styles.grid}>
        {Array.from({ length: start }).map((_, index) => <View key={`empty-${index}`} style={styles.day} />)}
        {Array.from({ length: days }).map((_, index) => {
          const day = index + 1;
          const active = `${month.getFullYear()}-${month.getMonth()}-${day}` === todayKey;
          const dayHijri = gregorianToHijri(new Date(month.getFullYear(), month.getMonth(), day));
          const hasEvent = Boolean(monthEvents.find((event) => event.gregorianDate.getFullYear() === month.getFullYear() && event.gregorianDate.getMonth() === month.getMonth() && event.gregorianDate.getDate() === day));
          return <View key={day} style={styles.day}>
            <View style={[styles.dayCircle, active && { backgroundColor: colors.gold }]}>
              <Text style={[styles.dayText, { color: active ? colors.primaryForeground : colors.foreground }]}>{day}</Text>
            </View>
            <View style={[styles.hijriDot, { backgroundColor: hasEvent ? colors.gold : colors.border }]} />
            {dayHijri.day === 1 ? <Text style={[styles.hijriDay, { color: colors.mutedForeground }]}>1</Text> : null}
          </View>;
        })}
      </View>
    </GlassCard>
    <SectionTitle title="Important events this month" />
    <GlassCard>
      {monthEvents.length ? monthEvents.map((event) => <View key={event.name} style={styles.event}>
        <View style={[styles.eventDot, { backgroundColor: colors.gold }]} />
        <View style={styles.eventCopy}>
          <Text style={[styles.eventName, { color: colors.foreground }]}>{event.name}</Text>
          <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{event.gregorianDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} · {event.hijriLabel}</Text>
        </View>
      </View>) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>No major listed events fall in this Gregorian month.</Text>}
    </GlassCard>
    <Text style={[styles.note, { color: colors.mutedForeground }]}>Islamic dates are calculated locally and may vary by one day according to local moon sighting.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  monthHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 8 },
  month: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  calendar: { padding: 13 },
  week: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 9 },
  weekday: { width: '14.2%', textAlign: 'center', fontSize: 9, fontFamily: 'Inter_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.2%', height: 43, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  hijriDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 2 },
  hijriDay: { position: 'absolute', top: 0, right: 5, fontSize: 7, fontFamily: 'Inter_400Regular' },
  event: { flexDirection: 'row', alignItems: 'center', minHeight: 51, gap: 10 },
  eventDot: { width: 7, height: 7, borderRadius: 4 },
  eventCopy: { flex: 1 },
  eventName: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  eventDate: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 3 },
  empty: { fontSize: 12, lineHeight: 18, paddingVertical: 8 },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 12, paddingHorizontal: 8 },
});