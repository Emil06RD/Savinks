const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function createLocalDate(year, month, day) {
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  return localDate;
}

function parseDate(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return new Date(date.getTime());
  }

  if (typeof date === 'string') {
    const trimmedDate = date.trim();

    if (!trimmedDate) {
      return null;
    }

    const isoMatch = trimmedDate.match(ISO_DATE_REGEX);

    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return createLocalDate(Number(year), Number(month), Number(day));
    }

    const parsedDate = new Date(trimmedDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof date === 'number') {
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export const formatDate = (date) => {
  const parsedDate = parseDate(date);
  return parsedDate ? toISODate(parsedDate) : '';
};

export const getTodayISO = () => {
  return toISODate(new Date());
};

export const isToday = (date) => {
  const formattedDate = formatDate(date);
  return Boolean(formattedDate) && formattedDate === getTodayISO();
};

export const isPastDate = (date) => {
  const formattedDate = formatDate(date);

  if (!formattedDate) {
    return false;
  }

  return formattedDate < getTodayISO();
};

export const isSameDate = (dateA, dateB) => {
  const formattedDateA = formatDate(dateA);
  const formattedDateB = formatDate(dateB);

  if (!formattedDateA || !formattedDateB) {
    return false;
  }

  return formattedDateA === formattedDateB;
};

export const addDays = (date, days) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return '';
  }

  const nextDate = new Date(parsedDate.getTime());
  nextDate.setDate(nextDate.getDate() + Number(days || 0));

  return toISODate(nextDate);
};

export const addWeeks = (date, weeks) => {
  return addDays(date, Number(weeks || 0) * 7);
};

export const addMonths = (date, months) => {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return '';
  }

  const monthOffset = Number(months || 0);
  const year = parsedDate.getFullYear();
  const monthIndex = parsedDate.getMonth();
  const totalMonths = year * 12 + monthIndex + monthOffset;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;
  const targetDay = Math.min(
    parsedDate.getDate(),
    getDaysInMonth(targetYear, targetMonthIndex)
  );
  const nextDate = new Date(targetYear, targetMonthIndex, targetDay, 12, 0, 0, 0);

  return toISODate(nextDate);
};

export const addYears = (date, years) => {
  return addMonths(date, Number(years || 0) * 12);
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 0, 0, 0);

  return {
    start: toISODate(start),
    end: toISODate(end),
  };
};
