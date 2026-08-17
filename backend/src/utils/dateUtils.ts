const pad = (value: number): string => {
  return String(value).padStart(2, "0");
};

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
};

const getStartOfToday = (): Date => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const getDayNumber = (value: string): number | null => {
  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return days[value.toLowerCase()] ?? null;
};

const normalizeIsoDate = (value: string): string | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return formatDate(date);
};

export const normalizeDueDate = (
  value: string
): string | null => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const isoDate = normalizeIsoDate(normalized);

  if (isoDate) {
    return isoDate;
  }

  const today = getStartOfToday();

  if (normalized === "today") {
    return formatDate(today);
  }

  if (normalized === "tomorrow") {
    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    return formatDate(tomorrow);
  }

  const requestedDay = getDayNumber(normalized);

  if (requestedDay !== null) {
    const currentDay = today.getDay();

    let daysUntil = requestedDay - currentDay;

    if (daysUntil <= 0) {
      daysUntil += 7;
    }

    const nextOccurrence = new Date(today);

    nextOccurrence.setDate(
      nextOccurrence.getDate() + daysUntil
    );

    return formatDate(nextOccurrence);
  }

  return null;
};