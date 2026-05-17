export function validateThaiIdChecksum(id: string): boolean {
  const digits = id.replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(digits[12], 10);
}

const EN_MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export function parseIappDate(s: string): Date | null {
  // iApp returns dates like "22 Feb 1990" or "1 Sep 2030"
  const cleaned = s.trim().replace(/\s+/g, " ");
  const english = cleaned.match(/^(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})$/);
  if (english) {
    const day = Number(english[1]);
    const month = EN_MONTHS[english[2].replace(/\./g, "").toLowerCase()];
    const year = Number(english[3]);
    if (day && month !== undefined && year) return new Date(Date.UTC(year, month, day));
  }

  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

const THAI_SHORT_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function formatThaiBuddhistDateFromIappEnglish(s: string): string | null {
  const date = parseIappDate(s);
  if (!date) return null;

  const day = date.getUTCDate();
  const month = THAI_SHORT_MONTHS[date.getUTCMonth()];
  const buddhistYear = date.getUTCFullYear() + 543;
  return `${day} ${month} ${buddhistYear}`;
}
