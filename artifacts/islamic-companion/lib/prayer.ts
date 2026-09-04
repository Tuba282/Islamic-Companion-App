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
  const start = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const hour = date.getHours() + date.getMinutes() / 60;
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

function solarEvent(date: Date, latitude: number, longitude: number, event: SolarEvent, direction: 'rise' | 'set') {
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
  const offset = -date.getTimezoneOffset();
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutes + offset);
  return result;
}

function solarNoon(date: Date, longitude: number) {
  const { equationOfTime } = solarPosition(date);
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(720 - 4 * longitude - equationOfTime - date.getTimezoneOffset());
  return result;
}

function angleForElevation(date: Date, latitude: number, longitude: number, elevation: number, direction: 'rise' | 'set') {
  const { declination, equationOfTime } = solarPosition(date);
  const latitudeRad = degToRad(latitude);
  const cosHourAngle = (
    Math.cos(degToRad(90 + elevation)) /
      (Math.cos(latitudeRad) * Math.cos(declination)) -
    Math.tan(latitudeRad) * Math.tan(declination)
  );
  const bounded = Math.min(1, Math.max(-1, cosHourAngle));
  const hourAngle = direction === 'rise' ? -Math.acos(bounded) : Math.acos(bounded);
  const minutes = 720 - 4 * (longitude + radToDeg(hourAngle)) - equationOfTime - date.getTimezoneOffset();
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutes);
  return result;
}

export function calculatePrayerTimes(date: Date, latitude: number, longitude: number): PrayerTimes {
  const sunrise = solarEvent(date, latitude, longitude, 'sunrise', 'rise');
  const sunset = solarEvent(date, latitude, longitude, 'sunset', 'set');
  return {
    Fajr: angleForElevation(date, latitude, longitude, -18, 'rise'),
    Sunrise: sunrise,
    Dhuhr: solarNoon(date, longitude),
    Asr: angleForElevation(date, latitude, longitude, -4.5, 'set'),
    Maghrib: sunset,
    Isha: angleForElevation(date, latitude, longitude, -18, 'set'),
  };
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

export function formatPrayerTime(value: Date | undefined) {
  if (!value) return '--:--';
  return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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