import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/context/AppState';
import { AccentName, ThemeName } from '@/constants/colors';
import { Screen, Header, GlassCard, SectionTitle } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const themes: Array<[ThemeName, string, string]> = [['dark', 'Dark green', '#062B27'], ['light', 'Light', '#F5F0E6'], ['navy', 'Navy blue', '#101B32']];
const accents: Array<[AccentName, string]> = [['gold', '#D7B56D'], ['green', '#69B38C'], ['blue', '#68A9D6'], ['purple', '#AA8AC7'], ['red', '#D9877E']];

export default function ThemeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { theme, accent, setTheme, setAccent } = useAppState();
  return <Screen><Header title="Choose theme" subtitle="Make your companion feel personal" onBack={() => router.back()} /><SectionTitle title="Theme" /><View style={styles.themeGrid}>{themes.map(([key, label, color]) => <Pressable key={key} onPress={() => setTheme(key)} style={[styles.themeCard, { backgroundColor: color, borderColor: theme === key ? colors.gold : colors.border }]}><View style={[styles.previewTop, { backgroundColor: key === 'light' ? '#FFFDF8' : key === 'navy' ? '#172743' : '#0B3A33' }]} /><View style={[styles.previewLine, { backgroundColor: key === 'light' ? '#D7B56D' : '#D7B56D', width: '55%' }]} /><View style={[styles.previewLine, { backgroundColor: key === 'light' ? '#DED2BC' : '#1E584A', width: '75%' }]} /><Text style={[styles.themeLabel, { color: key === 'light' ? '#17352E' : '#F3EBD8' }]}>{label}</Text>{theme === key ? <View style={[styles.selected, { backgroundColor: colors.gold }]}><Text style={{ color: colors.primaryForeground, fontSize: 10 }}>✓</Text></View> : null}</Pressable>)}</View><SectionTitle title="Accent color" /><GlassCard><View style={styles.accents}>{accents.map(([key, color]) => <Pressable key={key} onPress={() => setAccent(key)} style={[styles.accentOption, accent === key && { borderColor: colors.foreground }]}><View style={[styles.swatch, { backgroundColor: color }]} />{accent === key ? <Text style={[styles.accentName, { color: colors.foreground }]}>{key}</Text> : null}</Pressable>)}</View></GlassCard><View style={[styles.note, { backgroundColor: colors.goldSoft }]}><Text style={[styles.noteText, { color: colors.foreground }]}>Your choice is saved automatically and applied throughout the app.</Text></View></Screen>;
}

const styles = StyleSheet.create({
  themeGrid: { flexDirection: 'row', gap: 9 },
  themeCard: { flex: 1, minHeight: 145, borderRadius: 17, borderWidth: 2, padding: 10, overflow: 'hidden' },
  previewTop: { height: 53, borderRadius: 9, marginBottom: 9 },
  previewLine: { height: 4, borderRadius: 3, marginBottom: 5 },
  themeLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 5 },
  selected: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  accents: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accentOption: { minWidth: 45, minHeight: 45, borderWidth: 2, borderColor: 'transparent', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4 },
  swatch: { width: 25, height: 25, borderRadius: 13 },
  accentName: { fontSize: 8, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  note: { padding: 13, borderRadius: 14, marginTop: 17 },
  noteText: { fontSize: 11, lineHeight: 17, fontFamily: 'Inter_500Medium' },
});