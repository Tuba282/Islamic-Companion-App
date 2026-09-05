import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen, Header, GlassCard, SectionTitle, ProgressBar } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

type Dua = { id: string; arabic: string; transliteration: string; translation: string; source: string };
type Category = { icon: keyof typeof Feather.glyphMap; title: string; duas: Dua[] };

const categories: Category[] = [
  {
    icon: 'sunrise',
    title: 'Morning Azkar',
    duas: [
      { id: 'morning-1', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', transliteration: 'Allahumma bika asbahna wa bika amsayna', translation: 'O Allah, by You we enter the morning and by You we enter the evening.', source: 'Sunan Abi Dawud' },
      { id: 'morning-2', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', transliteration: 'Raditu billahi rabban wa bil-islami dinan wa bi-Muhammadin nabiyyan', translation: 'I am content with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet.', source: 'Sunan Abi Dawud' },
      { id: 'morning-3', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا', transliteration: 'Allahumma inni as’aluka ilman nafi’an wa rizqan tayyiban wa amalan mutaqabbalan', translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.', source: 'Sunan Ibn Majah' },
    ],
  },
  {
    icon: 'moon',
    title: 'Evening Azkar',
    duas: [
      { id: 'evening-1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Amsayna wa amsal-mulku lillahi rabbil-alamin', translation: 'We have entered the evening and the dominion belongs to Allah, Lord of the worlds.', source: 'Hisn al-Muslim' },
      { id: 'evening-2', arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ', transliteration: 'Allahumma ma amsa bi min nimatin fa minka wahdak', translation: 'O Allah, whatever blessing has come to me this evening is from You alone.', source: 'Sunan Abi Dawud' },
      { id: 'evening-3', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration: 'A’udhu bi kalimatillahit-tammati min sharri ma khalaq', translation: 'I seek refuge in the perfect words of Allah from the evil of what He created.', source: 'Sahih Muslim' },
    ],
  },
  {
    icon: 'heart',
    title: 'After Salah',
    duas: [
      { id: 'salah-1', arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah, astaghfirullah, astaghfirullah', translation: 'I seek forgiveness from Allah, three times.', source: 'Sahih Muslim' },
      { id: 'salah-2', arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ', transliteration: 'Allahumma antas-salam wa minkas-salam tabarakta ya dhal-jalali wal-ikram', translation: 'O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honor.', source: 'Sahih Muslim' },
      { id: 'salah-3', arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', transliteration: 'Allahumma a’inni ala dhikrika wa shukrika wa husni ibadatik', translation: 'O Allah, help me remember You, thank You, and worship You in the best manner.', source: 'Sunan Abi Dawud' },
    ],
  },
  {
    icon: 'moon',
    title: 'Before Sleep',
    duas: [
      { id: 'sleep-1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: 'Bismika Allahumma amutu wa ahya', translation: 'In Your name, O Allah, I die and I live.', source: 'Sahih al-Bukhari' },
      { id: 'sleep-2', arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', transliteration: 'Allahumma qini adhabbaka yawma tabathu ibadak', translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.', source: 'Jami at-Tirmidhi' },
      { id: 'sleep-3', arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ', transliteration: 'SubhanAllah, walhamdulillah, wallahu akbar', translation: 'Glory is to Allah, praise is to Allah, and Allah is the Greatest.', source: 'Sahih al-Bukhari' },
    ],
  },
  {
    icon: 'navigation',
    title: 'Travel Duas',
    duas: [
      { id: 'travel-1', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', transliteration: 'Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin', translation: 'Glory is to Him who made this vehicle subject to us, and we could not have controlled it ourselves.', source: 'Quran 43:13' },
      { id: 'travel-2', arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', transliteration: 'Allahumma inna nas’aluka fi safarina hadhal-birra wat-taqwa', translation: 'O Allah, we ask You for righteousness and piety in this journey of ours.', source: 'Sahih Muslim' },
      { id: 'travel-3', arabic: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الأَهْلِ', transliteration: 'Allahumma antas-sahibu fis-safari wal-khalifatu fil-ahl', translation: 'O Allah, You are the Companion on the journey and the Guardian of the family.', source: 'Sahih Muslim' },
    ],
  },
  {
    icon: 'shield',
    title: 'Protection',
    duas: [
      { id: 'protection-1', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ', transliteration: 'Qul huwallahu ahad, Allahus-samad', translation: 'Say: He is Allah, the One; Allah, the Eternal Refuge.', source: 'Surah Al-Ikhlas, 112:1-2' },
      { id: 'protection-2', arabic: 'أَعُوذُ بِرَبِّ الْفَلَقِ مِنْ شَرِّ مَا خَلَقَ', transliteration: 'A’udhu bi rabbil-falaq min sharri ma khalaq', translation: 'I seek refuge in the Lord of daybreak from the evil of what He created.', source: 'Surah Al-Falaq, 113:1-2' },
      { id: 'protection-3', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ', transliteration: 'Hasbiyallahu la ilaha illa huwa alayhi tawakkaltu', translation: 'Allah is sufficient for me; there is no god but Him. Upon Him I rely.', source: 'Quran 9:129' },
    ],
  },
];

export default function AzkarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selected, setSelected] = useState(categories[0].title);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const category = useMemo(() => categories.find((item) => item.title === selected) ?? categories[0], [selected]);

  return <Screen>
    <Header title="Azkar & Duas" subtitle="Remember Allah throughout your day" onBack={() => router.back()} />
    <View style={styles.categories}>{categories.map(({ icon, title }) => <Pressable key={title} onPress={() => setSelected(title)} style={[styles.category, { backgroundColor: selected === title ? colors.gold : colors.card, borderColor: colors.border }]}><Feather name={icon} size={17} color={selected === title ? colors.primaryForeground : colors.gold} /><Text style={[styles.categoryText, { color: selected === title ? colors.primaryForeground : colors.foreground }]}>{title}</Text></Pressable>)}</View>
    <SectionTitle title={category.title} action={`${category.duas.length} duas`} />
    {category.duas.map((dua, index) => <GlassCard key={dua.id} accent={index === 0} style={styles.verse}>
      <View style={styles.verseTop}><Text style={[styles.verseLabel, { color: colors.gold }]}>{category.title.toUpperCase()} · {index + 1}</Text><Pressable onPress={() => setBookmarked((value) => ({ ...value, [dua.id]: !value[dua.id] }))}><Feather name="bookmark" size={18} color={bookmarked[dua.id] ? colors.gold : colors.mutedForeground} fill={bookmarked[dua.id] ? colors.gold : 'transparent'} /></Pressable></View>
      <Text style={[styles.arabic, { color: colors.foreground }]}>{dua.arabic}</Text>
      <Text style={[styles.translit, { color: colors.mutedForeground }]}>{dua.transliteration}</Text>
      <Text style={[styles.translation, { color: colors.foreground }]}>“{dua.translation}”</Text>
      <Text style={[styles.source, { color: colors.mutedForeground }]}>{dua.source}</Text>
    </GlassCard>)}
    <View style={styles.reading}><Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>TODAY'S READING</Text><ProgressBar value={Math.round((Object.keys(bookmarked).filter((key) => bookmarked[key]).length / categories.reduce((total, item) => total + item.duas.length, 0)) * 100)} /><Text style={[styles.progressValue, { color: colors.gold }]}>{Object.keys(bookmarked).filter((key) => bookmarked[key]).length} saved duas</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  category: { width: '31.8%', minHeight: 77, borderWidth: 1, borderRadius: 16, padding: 10, justifyContent: 'space-between' },
  categoryText: { fontSize: 10, lineHeight: 13, fontFamily: 'Inter_600SemiBold' },
  verse: { padding: 18, marginBottom: 10 },
  verseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verseLabel: { fontSize: 9, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  arabic: { fontSize: 22, lineHeight: 38, textAlign: 'right', marginTop: 22 },
  translit: { fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginTop: 17 },
  translation: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_500Medium', marginTop: 13 },
  source: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 12 },
  reading: { marginTop: 14, gap: 9 },
  progressLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  progressValue: { fontSize: 11, fontFamily: 'Inter_600SemiBold', alignSelf: 'flex-end' },
});