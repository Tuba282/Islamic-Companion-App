import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: ViewStyle }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 10, paddingBottom: insets.bottom + 88 }, style]}>{children}</View>;
  return scroll ? <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : <View style={{ flex: 1, backgroundColor: colors.background }}>{content}</View>;
}

export function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      {onBack ? <Pressable onPress={onBack} hitSlop={12} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}><Feather name="chevron-left" size={22} color={colors.foreground} /></Pressable> : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function GlassCard({ children, style, accent = false }: { children: React.ReactNode; style?: ViewStyle; accent?: boolean }) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: accent ? colors.surfaceRaised : colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.gold }, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}>{icon ? <Feather name={icon} size={16} color={colors.primaryForeground} /> : null}<Text style={[styles.primaryLabel, { color: colors.primaryForeground }]}>{label}</Text></Pressable>;
}

export function IconButton({ icon, onPress, filled = false }: { icon: keyof typeof Feather.glyphMap; onPress?: () => void; filled?: boolean }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: filled ? colors.gold : colors.surfaceRaised, borderColor: colors.border }, pressed && { opacity: 0.65 }]}><Feather name={icon} size={18} color={filled ? colors.primaryForeground : colors.foreground} /></Pressable>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionTitle}><Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>{action ? <Pressable onPress={onAction}><Text style={[styles.action, { color: colors.gold }]}>{action}</Text></Pressable> : null}</View>;
}

export function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  const colors = useColors();
  const offset = React.useRef(new Animated.Value(value ? 17 : 2)).current;
  React.useEffect(() => { Animated.spring(offset, { toValue: value ? 17 : 2, useNativeDriver: true, speed: 22, bounciness: 5 }).start(); }, [offset, value]);
  return <Pressable onPress={onChange} style={({ pressed }) => [styles.toggle, { backgroundColor: value ? colors.gold : colors.muted }, pressed && { opacity: 0.75 }]}><Animated.View style={[styles.toggleKnob, { backgroundColor: value ? colors.primaryForeground : colors.mutedForeground, transform: [{ translateX: offset }] }]} /></Pressable>;
}

export function Row({ icon, title, detail, onPress, right }: { icon: keyof typeof Feather.glyphMap; title: string; detail?: string; onPress?: () => void; right?: React.ReactNode }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border }, pressed && { opacity: 0.7 }]}><View style={[styles.rowIcon, { backgroundColor: colors.goldSoft }]}><Feather name={icon} size={16} color={colors.gold} /></View><View style={styles.rowText}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>{detail ? <Text style={[styles.rowDetail, { color: colors.mutedForeground }]}>{detail}</Text> : null}</View>{right ?? <Feather name="chevron-right" size={17} color={colors.mutedForeground} />}</Pressable>;
}

export function ProgressBar({ value }: { value: number }) {
  const colors = useColors();
  return <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: colors.gold }]} /></View>;
}

const styles = StyleSheet.create({
  screen: { minHeight: '100%', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  back: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  headerTitle: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  card: { borderRadius: 22, borderWidth: 1, padding: 16 },
  primaryButton: { borderRadius: 15, minHeight: 52, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryLabel: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  iconButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 22 },
  sectionHeading: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  action: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  toggle: { width: 40, height: 23, borderRadius: 15, paddingVertical: 2 },
  toggleKnob: { width: 19, height: 19, borderRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  rowDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
});