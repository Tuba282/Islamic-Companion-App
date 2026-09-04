import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, GlassCard, SectionTitle, ProgressBar } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const categories: Array<[keyof typeof Feather.glyphMap, string]> = [['sunrise', 'Morning Azkar'], ['moon', 'Evening Azkar'], ['heart', 'After Salah'], ['moon', 'Before Sleep'], ['navigation', 'Travel Duas'], ['shield', 'Protection']];

export default function AzkarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selected, setSelected] = useState('Morning Azkar');
  const [bookmarked, setBookmarked] = useState(false);
  return <Screen><Header title="Azkar & Duas" subtitle="Remember Allah throughout your day" onBack={() => router.back()} /><View style={styles.categories}>{categories.map(([icon, name]) => <Pressable key={name} onPress={() => setSelected(name)} style={[styles.category, { backgroundColor: selected === name ? colors.gold : colors.card, borderColor: colors.border }]}><Feather name={icon} size={17} color={selected === name ? colors.primaryForeground : colors.gold} /><Text style={[styles.categoryText, { color: selected === name ? colors.primaryForeground : colors.foreground }]}>{name}</Text></Pressable>)}</View><SectionTitle title="Daily remembrance" action="1 of 5" /><GlassCard accent style={styles.verse}><View style={styles.verseTop}><Text style={[styles.verseLabel, { color: colors.gold }]}>MORNING AZKAR</Text><Pressable onPress={() => setBookmarked((v) => !v)}><Feather name="bookmark" size={18} color={bookmarked ? colors.gold : colors.mutedForeground} fill={bookmarked ? colors.gold : 'transparent'} /></Pressable></View><Text style={[styles.arabic, { color: colors.foreground }]}>وَاذْكُرِ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا</Text><Text style={[styles.translit, { color: colors.mutedForeground }]}>Wadhkur isma rabbika wa tabattal ilayhi tabteela</Text><Text style={[styles.translation, { color: colors.foreground }]}>“And remember the name of your Lord and devote yourself to Him with complete devotion.”</Text><Text style={[styles.source, { color: colors.mutedForeground }]}>Surah Al-Muzzammil, 73:8</Text></GlassCard><View style={styles.reading}><Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>TODAY'S READING</Text><ProgressBar value={20} /><Text style={[styles.progressValue, { color: colors.gold }]}>20% complete</Text></View></Screen>;
}

const styles = StyleSheet.create({
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  category: { width: '31.8%', minHeight: 77, borderWidth: 1, borderRadius: 16, padding: 10, justifyContent: 'space-between' },
  categoryText: { fontSize: 10, lineHeight: 13, fontFamily: 'Inter_600SemiBold' },
  verse: { padding: 18 },
  verseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verseLabel: { fontSize: 9, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  arabic: { fontSize: 22, lineHeight: 38, textAlign: 'right', marginTop: 22 },
  translit: { fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginTop: 17 },
  translation: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_500Medium', marginTop: 13 },
  source: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 12 },
  reading: { marginTop: 24, gap: 9 },
  progressLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  progressValue: { fontSize: 11, fontFamily: 'Inter_600SemiBold', alignSelf: 'flex-end' },
});