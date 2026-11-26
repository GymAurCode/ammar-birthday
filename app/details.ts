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

export const letter = [
  'Allah tumhein hamesha khush rakhe, sehat de, kamyabi de aur tumhari har achi dua qabool kare.',
  'Zindagi mein bohat aagay jao aur hamesha muskurate raho.',
  'Stay blessed, Bhai!',
];
