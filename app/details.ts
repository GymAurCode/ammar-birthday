const birth = { year: 2003, month: 11, day: 26 };
const celebration = { year: 2026, month: 11, day: 26 };
const utcDay = ({ year, month, day }: typeof birth) => Date.UTC(year, month - 1, day);
const months = (celebration.year - birth.year) * 12 + celebration.month - birth.month
  - Number(celebration.day < birth.day);

export const age = {
  years: Math.floor(months / 12),
  months,
  days: (utcDay(celebration) - utcDay(birth)) / 86_400_000,
};

export const updates = [
  'Age update: Successfully installed.',
  'Maturity update: Still downloading…',
  'Responsibilities: Automatically enabled.',
  'Family questions about your future: Difficulty increased.',
  'Congratulations! You are now officially old enough to give Eidi instead of receiving it.',
];

export const letter = [
  'Allah tumhein hamesha khush rakhe, sehat de, kamyabi de aur tumhari har achi dua qabool kare.',
  'Dua hai ke tumhari zindagi ka har agla saal pehle se zyada khoobsurat ho.',
  'Hamesha khush rehna, muskurate rehna aur apni funny harkatein kabhi mat chorna.',
  'Waise 23 saal ka ho gaya hai, ab thora responsible bhi ho ja. Thora sa hi, zyada nahi.',
  'May Allah bless you with happiness, peace, success, good health and a beautiful future.',
];
