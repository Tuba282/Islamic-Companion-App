export type PrayerTimes = {
  Fajr: Date;
  Sunrise: Date;
  Dhuhr: Date;
  Asr: Date;
  Maghrib: Date;
  Isha: Date;
};

type SolarEvent = 'sunrise' | 'sunset' | 'civilTwilight';

const degToRad = (value: number) => (value * Math.PI) / 180;
const radToDeg = (value: number) => (value * 180) / Math.PI;
const normalize = (value: number) => ((value % 360) + 360) % 360;

function solarPosition(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
  const gamma = (2 * Math.PI / 365) * (day - 1 + (hour - 12) / 24);
  const equationOfTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  return { equationOfTime, declination };
}

function localSolarDate(date: Date, timezoneOffsetMinutes: number) {
  const local = new Date(date.getTime() + timezoneOffsetMinutes * 60000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 12));
}

function localTimeToDate(date: Date, minutes: number, timezoneOffsetMinutes: number) {
  const local = new Date(date.getTime() + timezoneOffsetMinutes * 60000);
  const midnightUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnightUtc - timezoneOffsetMinutes * 60000 + minutes * 60000);
}

function solarEvent(date: Date, latitude: number, longitude: number, event: SolarEvent, direction: 'rise' | 'set', timezoneOffsetMinutes: number) {
  const { equationOfTime, declination } = solarPosition(date);
  const zenith = event === 'sunrise' ? 90.833 : event === 'civilTwilight' ? 96 : 90.833;
  const latitudeRad = degToRad(latitude);
  const cosHourAngle = (
    Math.cos(degToRad(zenith)) /
      (Math.cos(latitudeRad) * Math.cos(declination)) -
    Math.tan(latitudeRad) * Math.tan(declination)
  );
  const bounded = Math.min(1, Math.max(-1, cosHourAngle));
  const hourAngle = direction === 'rise' ? -Math.acos(bounded) : Math.acos(bounded);
  const minutes = 720 - 4 * (longitude + radToDeg(hourAngle)) - equationOfTime;
  return localTimeToDate(date, minutes, timezoneOffsetMinutes);
}

function solarNoon(date: Date, longitude: number, timezoneOffsetMinutes: number) {
  const { equationOfTime } = solarPosition(date);
  return localTimeToDate(date, 720 - 4 * longitude - equationOfTime, timezoneOffsetMinutes);
}

function angleForElevation(date: Date, latitude: number, longitude: number, elevation: number, direction: 'rise' | 'set', timezoneOffsetMinutes: number) {
  const { declination, equationOfTime } = solarPosition(date);
  const latitudeRad = degToRad(latitude);
  const cosHourAngle = (
    Math.cos(degToRad(90 + elevation)) /
      (Math.cos(latitudeRad) * Math.cos(declination)) -
    Math.tan(latitudeRad) * Math.tan(declination)
  );
  const bounded = Math.min(1, Math.max(-1, cosHourAngle));
  const hourAngle = direction === 'rise' ? -Math.acos(bounded) : Math.acos(bounded);
  const minutes = 720 - 4 * (longitude + radToDeg(hourAngle)) - equationOfTime;
  return localTimeToDate(date, minutes, timezoneOffsetMinutes);
}

export function calculatePrayerTimes(date: Date, latitude: number, longitude: number, timezoneOffsetMinutes = -date.getTimezoneOffset()): PrayerTimes {
  const solarDate = localSolarDate(date, timezoneOffsetMinutes);
  const sunrise = solarEvent(solarDate, latitude, longitude, 'sunrise', 'rise', timezoneOffsetMinutes);
  const sunset = solarEvent(solarDate, latitude, longitude, 'sunset', 'set', timezoneOffsetMinutes);
  return {
    Fajr: angleForElevation(solarDate, latitude, longitude, -18, 'rise', timezoneOffsetMinutes),
    Sunrise: sunrise,
    Dhuhr: solarNoon(solarDate, longitude, timezoneOffsetMinutes),
    Asr: angleForElevation(solarDate, latitude, longitude, -4.5, 'set', timezoneOffsetMinutes),
    Maghrib: sunset,
    Isha: angleForElevation(solarDate, latitude, longitude, -18, 'set', timezoneOffsetMinutes),
  };
}

const countryTimezoneOffsets: Record<string, number> = {
  PK: 300,
  IN: 330,
  BD: 360,
  NP: 345,
  LK: 330,
  AF: 270,
  IR: 210,
  AE: 240,
  OM: 240,
  SA: 180,
  QA: 180,
  KW: 180,
  BH: 180,
  YE: 180,
  TR: 180,
  EG: 120,
  ZA: 120,
  NG: 60,
  KE: 180,
  MY: 480,
  SG: 480,
  ID: 420,
  CN: 480,
  JP: 540,
  KR: 540,
};

export function getLocationTimezoneOffsetMinutes(latitude: number, longitude: number, countryCode?: string) {
  const normalizedCountryCode = countryCode?.toUpperCase();
  if (normalizedCountryCode && countryTimezoneOffsets[normalizedCountryCode] !== undefined) {
    return countryTimezoneOffsets[normalizedCountryCode];
  }
  return Math.max(-12, Math.min(14, Math.round(longitude / 15))) * 60;
}

export function formatTimezoneOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60).toString().padStart(2, '0');
  const minutes = (absolute % 60).toString().padStart(2, '0');
  return `GMT${sign}${hours}:${minutes}`;
}

export function qiblaBearing(latitude: number, longitude: number) {
  const kaabaLatitude = degToRad(21.422487);
  const kaabaLongitude = degToRad(39.826206);
  const currentLatitude = degToRad(latitude);
  const deltaLongitude = kaabaLongitude - degToRad(longitude);
  const bearing = radToDeg(Math.atan2(
    Math.sin(deltaLongitude),
    Math.cos(currentLatitude) * Math.tan(kaabaLatitude) -
      Math.sin(currentLatitude) * Math.cos(deltaLongitude),
  ));
  return Math.round(normalize(bearing));
}

export function formatPrayerTime(value: Date | undefined, timezoneOffsetMinutes?: number) {
  if (!value) return '--:--';
  return formatClockTime(value, timezoneOffsetMinutes);
}

export function formatClockTime(value: Date, timezoneOffsetMinutes = -value.getTimezoneOffset()) {
  const shifted = new Date(value.getTime() + timezoneOffsetMinutes * 60000);
  const hour24 = shifted.getUTCHours();
  const hour = (hour24 % 12 || 12).toString();
  const minute = shifted.getUTCMinutes().toString().padStart(2, '0');
  const period = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour}:${minute} ${period}`;
}

export function formatDate(value: Date, timezoneOffsetMinutes = -value.getTimezoneOffset()) {
  const shifted = new Date(value.getTime() + timezoneOffsetMinutes * 60000);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(shifted);
}

export function prayerTimeForNotification(value: Date) {
  return { hour: value.getHours(), minute: value.getMinutes() };
}

export function nextPrayer(times: PrayerTimes, now = new Date()) {
  const ordered: Array<[keyof PrayerTimes, Date]> = [
    ['Fajr', times.Fajr],
    ['Dhuhr', times.Dhuhr],
    ['Asr', times.Asr],
    ['Maghrib', times.Maghrib],
    ['Isha', times.Isha],
  ];
  const next = ordered.find(([, time]) => time.getTime() > now.getTime());
  if (next) return next;
  const tomorrow = new Date(times.Fajr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return ['Fajr', tomorrow] as [keyof PrayerTimes, Date];
}