export const ALARM_TONES = [
  'Adhan 1',
  'Adhan 2',
  'Adhan 3',
  'Makkah Alarm',
  'Madinah Alarm',
  'Gentle Bell',
  'Soft Reminder',
  'Beep',
  'Nature Sound',
] as const;

export type AlarmTone = (typeof ALARM_TONES)[number];

type AlarmSound = {
  fileName: string;
  source: number;
};

export const ALARM_SOUNDS: Record<AlarmTone, AlarmSound> = {
  'Adhan 1': { fileName: 'adhan-1.wav', source: require('@/assets/audio/adhan-1.wav') },
  'Adhan 2': { fileName: 'adhan-2.wav', source: require('@/assets/audio/adhan-2.wav') },
  'Adhan 3': { fileName: 'adhan-3.wav', source: require('@/assets/audio/adhan-3.wav') },
  'Makkah Alarm': { fileName: 'makkah-alarm.wav', source: require('@/assets/audio/makkah-alarm.wav') },
  'Madinah Alarm': { fileName: 'madinah-alarm.wav', source: require('@/assets/audio/madinah-alarm.wav') },
  'Gentle Bell': { fileName: 'gentle-bell.wav', source: require('@/assets/audio/gentle-bell.wav') },
  'Soft Reminder': { fileName: 'soft-reminder.wav', source: require('@/assets/audio/soft-reminder.wav') },
  Beep: { fileName: 'beep.wav', source: require('@/assets/audio/beep.wav') },
  'Nature Sound': { fileName: 'nature-sound.wav', source: require('@/assets/audio/nature-sound.wav') },
};

export function isAlarmTone(value: unknown): value is AlarmTone {
  return typeof value === 'string' && (ALARM_TONES as readonly string[]).includes(value);
}

export function getAlarmSound(tone: AlarmTone) {
  return ALARM_SOUNDS[tone];
}

export function getNotificationChannelId(tone: AlarmTone) {
  return `prayer-alarm-${ALARM_SOUNDS[tone].fileName.replace('.wav', '')}`;
}