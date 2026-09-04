import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppState } from '@/context/AppState';
import { Screen, Header, GlassCard, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const tones = ['Adhan 1', 'Adhan 2', 'Adhan 3', 'Makkah Alarm', 'Madinah Alarm', 'Gentle Bell', 'Soft Reminder', 'Beep', 'Nature Sound'];

export default function ToneScreen() {
  const colors = useColors();
  const router = useRouter();
  const { alarmTone, setAlarmTone } = useAppState();
  const [selected, setSelected] = useState(alarmTone);
  return <Screen><Header title="Select alarm tone" subtitle="Choose the reminder sound for your prayers" onBack={() => router.back()} /><GlassCard style={styles.card}>{tones.map((tone) => <Pressable key={tone} onPress={() => setSelected(tone)} style={({ pressed }) => [styles.toneRow, selected === tone && { backgroundColor: colors.goldSoft }, pressed && { opacity: 0.65 }]}><View style={[styles.radio, { borderColor: selected === tone ? colors.gold : colors.border }]}>{selected === tone ? <View style={[styles.radioDot, { backgroundColor: colors.gold }]} /> : null}</View><Text style={[styles.toneName, { color: colors.foreground }]}>{tone}</Text><Feather name={selected === tone ? 'volume-2' : 'volume'} size={16} color={selected === tone ? colors.gold : colors.mutedForeground} /></Pressable>)}</GlassCard><View style={{ marginTop: 20 }}><PrimaryButton label="Save selected tone" onPress={async () => { await setAlarmTone(selected); router.back(); }} icon="check" /></View><Text style={[styles.note, { color: colors.mutedForeground }]}>The selected tone is saved with your alarm preferences. The phone uses its local notification sound for scheduled reminders.</Text></Screen>;
}

const styles = StyleSheet.create({
  card: { padding: 8 },
  toneRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 10, gap: 11 },
  radio: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  toneName: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  note: { fontSize: 10, lineHeight: 16, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 13 },
});