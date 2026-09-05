import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { formatPrayerTime } from '@/lib/prayer';
import { useAppState, PrayerKey } from '@/context/AppState';
import { Screen, Header, GlassCard, Row, SectionTitle, Toggle, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';
import { ALARM_SOUNDS } from '@/lib/alarmSounds';

const prayerKeys: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function AlarmScreen() {
  const colors = useColors();
  const router = useRouter();
  const { alarms, toggleAlarm, alarmTone, vibrationEnabled, setVibrationEnabled, snoozeMinutes, setSnoozeMinutes, scheduleTestAlarm, prayerTimes, locationStatus, locationTimezoneOffsetMinutes } = useAppState();
  const [notice, setNotice] = useState('');
  const player = useAudioPlayer(ALARM_SOUNDS[alarmTone].source);
  const cycleSnooze = () => setSnoozeMinutes(snoozeMinutes === 5 ? 10 : snoozeMinutes === 10 ? 15 : 5);
  const testAlarm = async () => {
    const scheduled = await scheduleTestAlarm();
    if (scheduled) setNotice('Test alarm scheduled. It will ring in about 5 seconds.');
    else if (locationStatus === 'ready') setNotice('Allow notifications when prompted to schedule the test alarm.');
    else Alert.alert('Notifications unavailable', 'Open this app on a phone to test a real notification alarm.');
  };
  return <Screen>
    <Header title="Prayer Alarm" subtitle="Your phone will remind you at each prayer" />
    <GlassCard style={styles.card}>
      {prayerKeys.map((name) => <View key={name} style={styles.alarmRow}><View style={[styles.miniIcon, { backgroundColor: colors.goldSoft }]}><Feather name={name === 'Fajr' ? 'sunrise' : name === 'Isha' ? 'moon' : 'sun'} size={15} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.name, { color: colors.foreground }]}>{name}</Text><Text style={[styles.time, { color: colors.mutedForeground }]}>{prayerTimes ? formatPrayerTime(prayerTimes[name], locationTimezoneOffsetMinutes) : 'Waiting for location…'}</Text></View><Toggle value={alarms[name]} onChange={() => toggleAlarm(name)} /></View>)}
    </GlassCard>
    <SectionTitle title="Alarm preferences" />
    <GlassCard>
      <Row icon="volume-2" title="Alarm tone" detail={alarmTone} onPress={() => router.push('/tone' as never)} />
      <Pressable onPress={() => { void player.seekTo(0); player.play(); }} style={({ pressed }) => [styles.previewRow, { borderBottomColor: colors.border }, pressed && { opacity: 0.65 }]}><View style={[styles.prefIcon, { backgroundColor: colors.goldSoft }]}><Feather name="play" size={15} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.prefTitle, { color: colors.foreground }]}>Preview selected tone</Text><Text style={[styles.prefDetail, { color: colors.mutedForeground }]}>Hear the sound used for alarms</Text></View><Feather name="volume-2" size={17} color={colors.gold} /></Pressable>
      <Row icon="smartphone" title="Vibration" detail={vibrationEnabled ? 'On' : 'Off'} right={<Toggle value={vibrationEnabled} onChange={() => setVibrationEnabled(!vibrationEnabled)} />} />
      <Pressable onPress={cycleSnooze} style={({ pressed }) => [styles.snoozeRow, pressed && { opacity: 0.65 }]}><View style={[styles.prefIcon, { backgroundColor: colors.goldSoft }]}><Feather name="clock" size={16} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.prefTitle, { color: colors.foreground }]}>Snooze duration</Text><Text style={[styles.prefDetail, { color: colors.mutedForeground }]}>Tap to change</Text></View><Text style={[styles.snoozeValue, { color: colors.gold }]}>{snoozeMinutes} min</Text></Pressable>
    </GlassCard>
    <View style={{ marginTop: 22 }}><PrimaryButton label="Test selected alarm" onPress={testAlarm} icon="play" /></View>
    {notice ? <Text style={[styles.notice, { color: colors.success }]}>{notice}</Text> : null}
    <Text style={[styles.helper, { color: colors.mutedForeground }]}>Alarms are scheduled as local phone notifications using your current location's prayer times.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  card: { paddingVertical: 8 },
  alarmRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  miniIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  time: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12, borderBottomWidth: 1 },
  snoozeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  prefIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  prefTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  prefDetail: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 3 },
  snoozeValue: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  notice: { fontSize: 11, textAlign: 'center', lineHeight: 17, fontFamily: 'Inter_600SemiBold', marginTop: 12 },
  helper: { fontSize: 10, lineHeight: 16, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 12 },
});