import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccentName, ColorTokens, createPalette, ThemeName } from '@/constants/colors';

type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
type AppStateValue = {
  ready: boolean;
  onboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  theme: ThemeName;
  accent: AccentName;
  setTheme: (value: ThemeName) => Promise<void>;
  setAccent: (value: AccentName) => Promise<void>;
  colors: ColorTokens;
  completedPrayers: Record<PrayerKey, boolean>;
  togglePrayer: (key: PrayerKey) => Promise<void>;
  tasbeehCount: number;
  setTasbeehCount: (value: number) => Promise<void>;
  alarms: Record<PrayerKey, boolean>;
  toggleAlarm: (key: PrayerKey) => Promise<void>;
  alarmTone: string;
  setAlarmTone: (tone: string) => Promise<void>;
};

const defaultPrayers: Record<PrayerKey, boolean> = {
  Fajr: true,
  Dhuhr: true,
  Asr: true,
  Maghrib: false,
  Isha: false,
};

const AppStateContext = createContext<AppStateValue | null>(null);
const STORAGE_KEY = '@islamic-companion-state';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [theme, setThemeState] = useState<ThemeName>('dark');
  const [accent, setAccentState] = useState<AccentName>('gold');
  const [completedPrayers, setCompletedPrayers] = useState(defaultPrayers);
  const [tasbeehCount, setTasbeehCountState] = useState(33);
  const [alarms, setAlarms] = useState<Record<PrayerKey, boolean>>({
    Fajr: true,
    Dhuhr: false,
    Asr: true,
    Maghrib: true,
    Isha: false,
  });
  const [alarmTone, setAlarmToneState] = useState('Adhan 1');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const data = JSON.parse(stored) as Partial<AppStateValue>;
          setOnboardingComplete(Boolean(data.onboardingComplete));
          if (data.theme) setThemeState(data.theme);
          if (data.accent) setAccentState(data.accent);
          if (data.completedPrayers) setCompletedPrayers(data.completedPrayers);
          if (typeof data.tasbeehCount === 'number') setTasbeehCountState(data.tasbeehCount);
          if (data.alarms) setAlarms(data.alarms);
          if (data.alarmTone) setAlarmToneState(data.alarmTone);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const persist = async (patch: Record<string, unknown>) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  };

  const value = useMemo<AppStateValue>(() => ({
    ready,
    onboardingComplete,
    completeOnboarding: async () => {
      setOnboardingComplete(true);
      await persist({ onboardingComplete: true });
    },
    theme,
    accent,
    setTheme: async (value) => {
      setThemeState(value);
      await persist({ theme: value });
    },
    setAccent: async (value) => {
      setAccentState(value);
      await persist({ accent: value });
    },
    colors: createPalette(theme, accent),
    completedPrayers,
    togglePrayer: async (key) => {
      const next = { ...completedPrayers, [key]: !completedPrayers[key] };
      setCompletedPrayers(next);
      await persist({ completedPrayers: next });
    },
    tasbeehCount,
    setTasbeehCount: async (value) => {
      const next = Math.max(0, value);
      setTasbeehCountState(next);
      await persist({ tasbeehCount: next });
    },
    alarms,
    toggleAlarm: async (key) => {
      const next = { ...alarms, [key]: !alarms[key] };
      setAlarms(next);
      await persist({ alarms: next });
    },
    alarmTone,
    setAlarmTone: async (tone) => {
      setAlarmToneState(tone);
      await persist({ alarmTone: tone });
    },
  }), [ready, onboardingComplete, theme, accent, completedPrayers, tasbeehCount, alarms, alarmTone]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}

export type { PrayerKey };