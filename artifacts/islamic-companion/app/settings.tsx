import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen, Header, GlassCard, Row, SectionTitle, Toggle } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  return <Screen><Header title="Settings" subtitle="Make the app feel like yours" onBack={() => router.back()} /><SectionTitle title="Prayer settings" /><GlassCard><Row icon="map-pin" title="Location" detail="Karachi, Pakistan" /><Row icon="sliders" title="Calculation method" detail="Muslim World League" /><Row icon="sun" title="Asr method" detail="Shafi (standard)" /><Row icon="bell" title="Notifications" right={<Toggle value onChange={() => Alert.alert('Notifications', 'Prayer reminders are enabled.')} />} /><Row icon="clock" title="Prayer alarm" detail="3 alarms active" onPress={() => router.push('/(tabs)/alarm' as never)} /></GlassCard><SectionTitle title="Appearance" /><GlassCard><Row icon="droplet" title="Theme" detail="Dark green" onPress={() => router.push('/theme')} /><Row icon="globe" title="Language" detail="English" /><Row icon="calendar" title="Hijri date adjustment" detail="+0 days" /></GlassCard><SectionTitle title="About" /><GlassCard><Row icon="info" title="About Islamic Companion" detail="Version 1.0.0" /><Row icon="star" title="Rate the app" /><Row icon="heart" title="Made with intention" /></GlassCard></Screen>;
}

const styles = StyleSheet.create({});