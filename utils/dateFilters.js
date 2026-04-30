function createDateFromParts(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function parseTransactionDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    const dateOnlyMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return createDateFromParts(Number(year), Number(month), Number(day));
    }

    const parsedDate = new Date(trimmedValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return null;
}

function startOfDay(date) {
  const normalizedDate = new Date(date.getTime());
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function endOfDay(date) {
  const normalizedDate = new Date(date.getTime());
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

function startOfWeek(date) {
  const normalizedDate = startOfDay(date);
  const currentDay = normalizedDate.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  normalizedDate.setDate(normalizedDate.getDate() + diff);
  return normalizedDate;
}

function endOfWeek(date) {
  const normalizedDate = startOfWeek(date);
  normalizedDate.setDate(normalizedDate.getDate() + 6);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

export function isToday(value) {
  const parsedDate = parseTransactionDate(value);

  if (!parsedDate) {
    return false;
  }

  const currentDate = new Date();

  return (
    parsedDate.getFullYear() === currentDate.getFullYear() &&
    parsedDate.getMonth() === currentDate.getMonth() &&
    parsedDate.getDate() === currentDate.getDate()
  );
}

export function isCurrentWeek(value) {
  const parsedDate = parseTransactionDate(value);

  if (!parsedDate) {
    return false;
  }

  const currentDate = new Date();
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  return parsedDate >= weekStart && parsedDate <= weekEnd;
}

export function isCurrentMonth(value) {
  const parsedDate = parseTransactionDate(value);

  if (!parsedDate) {
    return false;
  }

  const currentDate = new Date();

  return (
    parsedDate.getFullYear() === currentDate.getFullYear() &&
    parsedDate.getMonth() === currentDate.getMonth()
  );
}

export function sortByMostRecentDate(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstDate = parseTransactionDate(firstItem.date);
    const secondDate = parseTransactionDate(secondItem.date);
    const firstTime = firstDate ? firstDate.getTime() : 0;
    const secondTime = secondDate ? secondDate.getTime() : 0;

    return secondTime - firstTime;
  });
}
