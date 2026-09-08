import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useAppState } from '@/context/AppState';
import { Screen, Header, GlassCard, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';
import { ALARM_SOUNDS, ALARM_TONES, AlarmTone } from '@/lib/alarmSounds';

export default function ToneScreen() {
  const colors = useColors();
  const router = useRouter();
  const { alarmTone, setAlarmTone } = useAppState();
  const [selected, setSelected] = useState(alarmTone);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    try {
      const source = ALARM_SOUNDS[selected]?.source;
      if (source) {
        playerRef.current = createAudioPlayer(source);
      }
    } catch (e) {
      console.warn('AudioPlayer creation error:', e);
      playerRef.current = null;
    }
    return () => {
      try {
        if (playerRef.current && typeof playerRef.current.release === 'function') {
          playerRef.current.release();
        }
      } catch {}
    };
  }, [selected]);

  const preview = async (tone: AlarmTone) => {
    setSelected(tone);
    try {
      if (playerRef.current) {
        if (typeof playerRef.current.seekTo === 'function') {
          await playerRef.current.seekTo(0);
        }
        playerRef.current.play();
      } else {
        const source = ALARM_SOUNDS[tone]?.source;
        if (source) {
          const p = createAudioPlayer(source);
          playerRef.current = p;
          p.play();
        }
      }
    } catch (e) {
      console.warn('Tone preview error:', e);
    }
  };

  return (
    <Screen>
      <Header title="Select alarm tone" subtitle="Choose the reminder sound for your prayers" onBack={() => router.back()} />
      <GlassCard style={styles.card}>
        {ALARM_TONES.map((tone) => (
          <Pressable
            key={tone}
            onPress={() => setSelected(tone)}
            style={({ pressed }) => [
              styles.toneRow,
              selected === tone && { backgroundColor: colors.goldSoft },
              pressed && { opacity: 0.65 },
            ]}
          >
            <View style={[styles.radio, { borderColor: selected === tone ? colors.gold : colors.border }]}>
              {selected === tone ? <View style={[styles.radioDot, { backgroundColor: colors.gold }]} /> : null}
            </View>
            <Text style={[styles.toneName, { color: colors.foreground }]}>{tone}</Text>
            <Pressable onPress={() => void preview(tone)} hitSlop={10} style={styles.previewButton}>
              <Feather name="play-circle" size={19} color={selected === tone ? colors.gold : colors.mutedForeground} />
            </Pressable>
          </Pressable>
        ))}
      </GlassCard>
      <View style={{ marginTop: 20 }}>
        <PrimaryButton
          label="Save selected tone"
          onPress={async () => {
            await setAlarmTone(selected);
            router.back();
          }}
          icon="check"
        />
      </View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Tap the play button to preview the bundled sound. Your selected tone is saved for future prayer and test alarms.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 8 },
  toneRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 10, gap: 11 },
  radio: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  toneName: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  previewButton: { padding: 2 },
  note: { fontSize: 10, lineHeight: 16, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 13 },
});