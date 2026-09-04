import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppState, PrayerKey } from '@/context/AppState';
import { Screen, Header, GlassCard, Row, SectionTitle, Toggle, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const prayerTimes: Array<[PrayerKey, string]> = [['Fajr', '04:58 AM'], ['Dhuhr', '01:30 PM'], ['Asr', '03:55 PM'], ['Maghrib', '06:47 PM'], ['Isha', '08:15 PM']];

export default function AlarmScreen() {
  const colors = useColors();
  const router = useRouter();
  const { alarms, toggleAlarm, alarmTone } = useAppState();
  return <Screen><Header title="Prayer Alarm" subtitle="Never miss a moment of Salah" /><GlassCard style={styles.card}>{prayerTimes.map(([name, time]) => <View key={name} style={styles.alarmRow}><View style={[styles.miniIcon, { backgroundColor: colors.goldSoft }]}><Feather name={name === 'Fajr' ? 'sunrise' : name === 'Isha' ? 'moon' : 'sun'} size={15} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.name, { color: colors.foreground }]}>{name}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text></View><Toggle value={alarms[name]} onChange={() => toggleAlarm(name)} /></View>)}</GlassCard><SectionTitle title="Alarm preferences" /><GlassCard><Row icon="volume-2" title="Alarm tone" detail={alarmTone} onPress={() => router.push('/tone' as never)} /><Row icon="smartphone" title="Vibration" detail="On" right={<Toggle value onChange={() => undefined} />} /><Row icon="clock" title="Snooze duration" detail="5 minutes" /></GlassCard><View style={{ marginTop: 22 }}><PrimaryButton label="Test alarm" onPress={() => undefined} icon="play" /></View></Screen>;
}

const styles = StyleSheet.create({
  card: { paddingVertical: 8 },
  alarmRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  miniIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
});