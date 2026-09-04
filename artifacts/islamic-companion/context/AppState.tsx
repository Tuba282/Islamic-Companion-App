import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { AccentName, ColorTokens, createPalette, ThemeName } from '@/constants/colors';
import { calculatePrayerTimes, formatPrayerTime, PrayerTimes, prayerTimeForNotification } from '@/lib/prayer';

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
type LocationStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'error';
type DailyPrayerRecord = Record<PrayerKey, boolean>;

type AppStateValue = {
  ready: boolean;
  onboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
  theme: ThemeName;
  accent: AccentName;
  setTheme: (value: ThemeName) => Promise<void>;
  setAccent: (value: AccentName) => Promise<void>;
  colors: ColorTokens;
  completedPrayers: DailyPrayerRecord;
  prayerHistory: Record<string, DailyPrayerRecord>;
  togglePrayer: (key: PrayerKey) => Promise<void>;
  tasbeehCount: number;
  setTasbeehCount: (value: number) => Promise<void>;
  alarms: Record<PrayerKey, boolean>;
  toggleAlarm: (key: PrayerKey) => Promise<void>;
  alarmTone: string;
  setAlarmTone: (tone: string) => Promise<void>;
  vibrationEnabled: boolean;
  setVibrationEnabled: (value: boolean) => Promise<void>;
  snoozeMinutes: number;
  setSnoozeMinutes: (value: number) => Promise<void>;
  scheduleTestAlarm: () => Promise<boolean>;
  locationStatus: LocationStatus;
  locationLabel: string;
  coordinates: { latitude: number; longitude: number } | null;
  prayerTimes: PrayerTimes | null;
  refreshLocation: () => Promise<void>;
};

const defaultPrayers: DailyPrayerRecord = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
const defaultAlarms: Record<PrayerKey, boolean> = { Fajr: true, Dhuhr: false, Asr: true, Maghrib: true, Isha: false };
const STORAGE_KEY = '@islamic-companion-state';
const todayKey = () => new Date().toISOString().slice(0, 10);

const AppStateContext = createContext<AppStateValue | null>(null);

async function ensureNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [theme, setThemeState] = useState<ThemeName>('dark');
  const [accent, setAccentState] = useState<AccentName>('gold');
  const [completedPrayers, setCompletedPrayers] = useState(defaultPrayers);
  const [prayerHistory, setPrayerHistory] = useState<Record<string, DailyPrayerRecord>>({});
  const [tasbeehCount, setTasbeehCountState] = useState(0);
  const [alarms, setAlarms] = useState(defaultAlarms);
  const [alarmTone, setAlarmToneState] = useState('Adhan 1');
  const [vibrationEnabled, setVibrationState] = useState(true);
  const [snoozeMinutes, setSnoozeState] = useState(5);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationLabel, setLocationLabel] = useState('Location not set');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const data = JSON.parse(stored) as Partial<AppStateValue> & { prayerHistory?: Record<string, DailyPrayerRecord> };
        setOnboardingComplete(Boolean(data.onboardingComplete));
        if (data.theme) setThemeState(data.theme);
        if (data.accent) setAccentState(data.accent);
        const history = data.prayerHistory ?? {};
        setPrayerHistory(history);
        setCompletedPrayers(history[todayKey()] ?? defaultPrayers);
        if (typeof data.tasbeehCount === 'number') setTasbeehCountState(data.tasbeehCount);
        if (data.alarms) setAlarms(data.alarms);
        if (data.alarmTone) setAlarmToneState(data.alarmTone);
        if (typeof data.vibrationEnabled === 'boolean') setVibrationState(data.vibrationEnabled);
        if (typeof data.snoozeMinutes === 'number') setSnoozeState(data.snoozeMinutes);
      }
    }).catch(() => undefined).finally(() => setReady(true));
  }, []);

  const persist = async (patch: Record<string, unknown>) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  };

  const refreshLocation = useCallback(async () => {
    setLocationStatus('loading');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationStatus('denied');
        setLocationLabel('Location permission denied');
        setPrayerTimes(null);
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const nextCoordinates = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setCoordinates(nextCoordinates);
      setPrayerTimes(calculatePrayerTimes(new Date(), nextCoordinates.latitude, nextCoordinates.longitude));
      const places = await Location.reverseGeocodeAsync(nextCoordinates).catch(() => []);
      const place = places[0];
      setLocationLabel([place?.city, place?.region, place?.country].filter(Boolean).join(', ') || `${nextCoordinates.latitude.toFixed(2)}°, ${nextCoordinates.longitude.toFixed(2)}°`);
      setLocationStatus('ready');
    } catch {
      setLocationStatus('error');
      setLocationLabel('Unable to detect location');
      setPrayerTimes(null);
    }
  }, []);

  const schedulePrayerAlarm = async (key: PrayerKey, enabled: boolean, times: PrayerTimes | null) => {
    if (Platform.OS === 'web' || !times) return;
    const allowed = await ensureNotificationPermission();
    if (!allowed) return;
    await Notifications.cancelScheduledNotificationAsync(`prayer-${key}`).catch(() => undefined);
    if (!enabled) return;
    const time = times[key];
    await Notifications.scheduleNotificationAsync({
      identifier: `prayer-${key}`,
      content: {
        title: `${key} prayer`,
        body: `It is time for ${key}. May your prayer be accepted.`,
        sound: 'default',
        vibrate: vibrationEnabled ? [0, 250, 150, 250] : undefined,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, ...prayerTimeForNotification(time) },
    });
  };

  useEffect(() => {
    if (!ready || !prayerTimes || Platform.OS === 'web') return;
    void (async () => {
      const allowed = await ensureNotificationPermission();
      if (!allowed) return;
      for (const key of Object.keys(alarms) as PrayerKey[]) {
        if (alarms[key]) await schedulePrayerAlarm(key, true, prayerTimes);
      }
    })();
  }, [ready, prayerTimes, alarms, vibrationEnabled]);

  const value = useMemo<AppStateValue>(() => ({
    ready,
    onboardingComplete,
    completeOnboarding: async () => { setOnboardingComplete(true); await persist({ onboardingComplete: true }); },
    theme,
    accent,
    setTheme: async (value) => { setThemeState(value); await persist({ theme: value }); },
    setAccent: async (value) => { setAccentState(value); await persist({ accent: value }); },
    colors: createPalette(theme, accent),
    completedPrayers,
    prayerHistory,
    togglePrayer: async (key) => {
      const next = { ...completedPrayers, [key]: !completedPrayers[key] };
      const nextHistory = { ...prayerHistory, [todayKey()]: next };
      setCompletedPrayers(next);
      setPrayerHistory(nextHistory);
      await persist({ prayerHistory: nextHistory });
    },
    tasbeehCount,
    setTasbeehCount: async (value) => { const next = Math.max(0, value); setTasbeehCountState(next); await persist({ tasbeehCount: next }); },
    alarms,
    toggleAlarm: async (key) => {
      const nextValue = !alarms[key];
      const next = { ...alarms, [key]: nextValue };
      setAlarms(next);
      await persist({ alarms: next });
      await schedulePrayerAlarm(key, nextValue, prayerTimes);
    },
    alarmTone,
    setAlarmTone: async (tone) => { setAlarmToneState(tone); await persist({ alarmTone: tone }); },
    vibrationEnabled,
    setVibrationEnabled: async (value) => { setVibrationState(value); await persist({ vibrationEnabled: value }); },
    snoozeMinutes,
    setSnoozeMinutes: async (value) => { setSnoozeState(value); await persist({ snoozeMinutes: value }); },
    scheduleTestAlarm: async () => {
      if (Platform.OS === 'web') return false;
      const allowed = await ensureNotificationPermission();
      if (!allowed) return false;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Islamic Companion test alarm', body: `Your ${alarmTone} reminder is working.`, sound: 'default', vibrate: vibrationEnabled ? [0, 250, 150, 250] : undefined },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
      });
      return true;
    },
    locationStatus,
    locationLabel,
    coordinates,
    prayerTimes,
    refreshLocation,
  }), [ready, onboardingComplete, theme, accent, completedPrayers, prayerHistory, tasbeehCount, alarms, alarmTone, vibrationEnabled, snoozeMinutes, locationStatus, locationLabel, coordinates, prayerTimes, refreshLocation]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}

export { formatPrayerTime };