export type PrayerTimes = {
  Fajr: Date;
  Sunrise: Date;
  Dhuhr: Date;
  Asr: Date;
  Maghrib: Date;
  Isha: Date;
};

const degToRad = (value: number) => (value * Math.PI) / 180;
const radToDeg = (value: number) => (value * 180) / Math.PI;
const normalize = (value: number) => ((value % 360) + 360) % 360;
const fixHour = (hour: number) => ((hour % 24) + 24) % 24;

function getJulianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

function getSunPosition(julianDate: number): { declination: number; equationOfTime: number } {
  const D = julianDate - 2451545.0;
  const g = fixHour(357.529 + 0.98560028 * D);
  const q = fixHour(280.459 + 0.98564736 * D);
  const L = fixHour(q + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g)));
  const e = 23.439 - 0.00000036 * D;
  const declination = radToDeg(Math.asin(Math.sin(degToRad(e)) * Math.sin(degToRad(L))));
  const rightAscension = radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(L)), Math.cos(degToRad(L)))) / 15;
  const equationOfTime = (q / 15 - fixHour(rightAscension)) * 60; // in minutes
  return { declination, equationOfTime };
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffsetMinutes = -date.getTimezoneOffset(),
  asrMethod: 'standard' | 'hanafi' = 'standard'
): PrayerTimes {
  const local = new Date(date.getTime() + timezoneOffsetMinutes * 60000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth() + 1;
  const day = local.getUTCDate();

  const jd = getJulianDate(year, month, day);
  const { declination, equationOfTime } = getSunPosition(jd);

  // Solar noon in local hours
  const noonHours = 12 + timezoneOffsetMinutes / 60 - longitude / 15 - equationOfTime / 60;

  function hourAngle(altitude: number): number | null {
    const latRad = degToRad(latitude);
    const declRad = degToRad(declination);
    const altRad = degToRad(altitude);
    const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
    if (cosH > 1) return null;
    if (cosH < -1) return null;
    return radToDeg(Math.acos(cosH)) / 15;
  }

  const sunriseHA = hourAngle(-0.833) ?? 6;
  const fajrHA = hourAngle(-18) ?? 7.5;
  const ishaHA = hourAngle(-18) ?? 7.5;

  // Asr altitude calculation
  const noonZenith = Math.abs(latitude - declination);
  const shadowFactor = asrMethod === 'hanafi' ? 2 : 1;
  const asrAlt = radToDeg(Math.atan(1 / (shadowFactor + Math.tan(degToRad(noonZenith)))));
  const asrHA = hourAngle(asrAlt) ?? 3.5;

  const toDate = (hours: number): Date => {
    const midnightUtc = Date.UTC(year, month - 1, day);
    return new Date(midnightUtc - timezoneOffsetMinutes * 60000 + hours * 3600 * 1000);
  };

  return {
    Fajr: toDate(noonHours - fajrHA),
    Sunrise: toDate(noonHours - sunriseHA),
    Dhuhr: toDate(noonHours),
    Asr: toDate(noonHours + asrHA),
    Maghrib: toDate(noonHours + sunriseHA),
    Isha: toDate(noonHours + ishaHA),
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
  GB: 0,
  US: -300, // Eastern standard default
};

export function getLocationTimezoneOffsetMinutes(latitude: number, longitude: number, countryCode?: string): number {
  const normalizedCountryCode = countryCode?.toUpperCase();
  if (normalizedCountryCode && countryTimezoneOffsets[normalizedCountryCode] !== undefined) {
    return countryTimezoneOffsets[normalizedCountryCode];
  }
  // Rough geographic approximation if country is unknown
  return Math.max(-12, Math.min(14, Math.round(longitude / 15))) * 60;
}

export function formatTimezoneOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60).toString().padStart(2, '0');
  const minutes = (absolute % 60).toString().padStart(2, '0');
  return `GMT${sign}${hours}:${minutes}`;
}

export function qiblaBearing(latitude: number, longitude: number): number {
  const kaabaLatitude = degToRad(21.422487);
  const kaabaLongitude = degToRad(39.826206);
  const currentLatitude = degToRad(latitude);
  const deltaLongitude = kaabaLongitude - degToRad(longitude);
  const bearing = radToDeg(
    Math.atan2(
      Math.sin(deltaLongitude),
      Math.cos(currentLatitude) * Math.tan(kaabaLatitude) -
        Math.sin(currentLatitude) * Math.cos(deltaLongitude)
    )
  );
  return Math.round(normalize(bearing));
}

export function distanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371; // Earth's radius in km
  const kaabaLat = degToRad(21.422487);
  const kaabaLng = degToRad(39.826206);
  const lat1 = degToRad(latitude);
  const lng1 = degToRad(longitude);
  const dLat = kaabaLat - lat1;
  const dLng = kaabaLng - lng1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(kaabaLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatPrayerTime(value: Date | undefined, timezoneOffsetMinutes?: number): string {
  if (!value) return '--:--';
  return formatClockTime(value, timezoneOffsetMinutes);
}

export function formatClockTime(value: Date, timezoneOffsetMinutes = -value.getTimezoneOffset()): string {
  const shifted = new Date(value.getTime() + timezoneOffsetMinutes * 60000);
  const hour24 = shifted.getUTCHours();
  const hour12 = hour24 % 12 || 12;
  const minute = shifted.getUTCMinutes().toString().padStart(2, '0');
  const period = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute} ${period}`;
}

export function formatDate(value: Date, timezoneOffsetMinutes = -value.getTimezoneOffset()): string {
  const shifted = new Date(value.getTime() + timezoneOffsetMinutes * 60000);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(shifted);
}

export function prayerTimeForNotification(value: Date): { hour: number; minute: number } {
  return { hour: value.getHours(), minute: value.getMinutes() };
}

export function nextPrayer(times: PrayerTimes, now = new Date()): [keyof PrayerTimes, Date] {
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