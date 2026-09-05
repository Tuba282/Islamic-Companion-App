export type HijriDate = {
  year: number;
  month: number;
  day: number;
};

export type IslamicEvent = {
  name: string;
  gregorianDate: Date;
  hijriLabel: string;
};

export const hijriMonthNames = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul-Qa'dah",
  'Dhul-Hijjah',
];

const eventNames: Record<number, Record<number, string>> = {
  1: { 1: 'Islamic New Year', 10: 'Day of Ashura' },
  3: { 12: 'Mawlid al-Nabi' },
  7: { 27: "Isra' and Mi'raj" },
  8: { 15: 'Mid-Sha’ban' },
  9: { 1: 'First day of Ramadan', 27: 'Laylat al-Qadr' },
  10: { 1: 'Eid al-Fitr', 10: 'Eid al-Fitr holiday' },
  12: { 9: 'Day of Arafah', 10: 'Eid al-Adha' },
};

function julianDay(date: Date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utc / 86400000 + 2440588);
}

export function gregorianToHijri(date: Date): HijriDate {
  const jd = julianDay(date);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function hijriToJulianDay(year: number, month: number, day: number) {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    1948439
  );
}

export function hijriToGregorian(year: number, month: number, day: number) {
  const jd = hijriToJulianDay(year, month, day);
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const adjusted = z + 1 + a - Math.floor(a / 4);
  const b = adjusted + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dayOfMonth = b - d - Math.floor(30.6001 * e);
  const monthOfYear = e < 14 ? e - 1 : e - 13;
  const yearNumber = monthOfYear > 2 ? c - 4716 : c - 4715;
  return new Date(yearNumber, monthOfYear - 1, dayOfMonth);
}

export function formatHijriDate(value: HijriDate) {
  return `${value.day} ${hijriMonthNames[value.month - 1]} ${value.year} AH`;
}

export function eventsForGregorianMonth(year: number, monthIndex: number): IslamicEvent[] {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const events: IslamicEvent[] = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, monthIndex, day);
    const hijri = gregorianToHijri(date);
    const name = eventNames[hijri.month]?.[hijri.day];
    if (name) {
      events.push({
        name,
        gregorianDate: date,
        hijriLabel: formatHijriDate(hijri),
      });
    }
  }
  return events;
}

export function eventsForHijriMonth(year: number, month: number): IslamicEvent[] {
  return Object.entries(eventNames[month] ?? {}).map(([day, name]) => {
    const hijriDay = Number(day);
    return {
      name,
      gregorianDate: hijriToGregorian(year, month, hijriDay),
      hijriLabel: `${hijriDay} ${hijriMonthNames[month - 1]} ${year} AH`,
    };
  });
}

export function nextRamadanStart(from = new Date()) {
  const current = gregorianToHijri(from);
  const targetYear = current.month >= 9 ? current.year + 1 : current.year;
  return hijriToGregorian(targetYear, 9, 1);
}