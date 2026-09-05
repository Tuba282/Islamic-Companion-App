import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAppState } from '@/context/AppState';
import { Screen, Header, GlassCard, SectionTitle, IconButton, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const presets: Array<[string, number]> = [['SubhanAllah', 33], ['Alhamdulillah', 33], ['Allahu Akbar', 34]];

export default function TasbeehScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasbeehCount, setTasbeehCount } = useAppState();
  const [selected, setSelected] = useState('SubhanAllah');
  const increment = async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await setTasbeehCount(tasbeehCount + 1); };
  return <Screen><Header title="Tasbeeh" subtitle="Keep your tongue moist with dhikr" onBack={() => router.back()} /><View style={styles.counterWrap}><Pressable onPress={increment} style={({ pressed }) => [styles.counter, { borderColor: colors.gold, backgroundColor: colors.surfaceRaised }, pressed && { transform: [{ scale: 0.97 }] }]}><View style={[styles.innerRing, { borderColor: colors.border }]}><Text style={[styles.count, { color: colors.foreground }]}>{tasbeehCount}</Text><Text style={[styles.countLabel, { color: colors.mutedForeground }]}>TAP TO COUNT</Text></View></Pressable></View><View style={styles.controls}><IconButton icon="minus" onPress={() => setTasbeehCount(tasbeehCount - 1)} /><Text style={[styles.selected, { color: colors.gold }]}>{selected}</Text><IconButton icon="plus" onPress={increment} /></View><PrimaryButton label="Reset count" onPress={() => setTasbeehCount(0)} icon="rotate-ccw" /><SectionTitle title="Presets" /><GlassCard>{presets.map(([name, count]) => <Pressable key={name} onPress={() => { setSelected(name); void setTasbeehCount(0); }} style={[styles.preset, selected === name && { backgroundColor: colors.goldSoft }]}><View style={[styles.presetIcon, { backgroundColor: colors.muted }]}><Feather name="circle" size={14} color={colors.gold} /></View><Text style={[styles.presetName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.presetCount, { color: colors.mutedForeground }]}>{count}</Text></Pressable>)}</GlassCard></Screen>;
}

const styles = StyleSheet.create({
  counterWrap: { alignItems: 'center', marginVertical: 12 },
  counter: { width: 250, height: 250, borderRadius: 130, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  innerRing: { width: 206, height: 206, borderRadius: 105, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 52, fontFamily: 'Inter_700Bold' },
  countLabel: { fontSize: 9, letterSpacing: 1.3, fontFamily: 'Inter_700Bold', marginTop: 7 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  selected: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  preset: { minHeight: 49, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 10 },
  presetIcon: { width: 27, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  presetName: { flex: 1, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  presetCount: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});