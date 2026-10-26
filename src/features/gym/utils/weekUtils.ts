/**
 * Returns Monday 00:00:00.000 for the week containing the given date.
 * Calendar week is defined from Monday 00:00:00 through Sunday 23:59:59.
 */
export const getMondayOfWeek = (d: Date = new Date()): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = day === 0 ? 6 : day - 1; // distance to Monday
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Returns Sunday 23:59:59.999 for the week containing the given date.
 */
export const getSundayOfWeek = (d: Date = new Date()): Date => {
  const monday = getMondayOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

/**
 * Formats a Date object into a local date string 'YYYY-MM-DD'.
 */
export const formatDateKey = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Generates a stable week identifier based on Monday of that calendar week.
 * Example: '2026-10-05' for the week from Oct 5 to Oct 11.
 */
export const getWeekIdentifier = (d: Date = new Date()): string => {
  const monday = getMondayOfWeek(d);
  return formatDateKey(monday);
};
