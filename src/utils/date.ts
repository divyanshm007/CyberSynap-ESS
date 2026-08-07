import { format, formatDistanceToNow, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isWeekend } from 'date-fns';

export const fmtDate = (date: string | Date, pattern = 'dd MMM yyyy') =>
  format(typeof date === 'string' ? parseISO(date) : date, pattern);

export const fmtDateTime = (date: string | Date) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy, hh:mm a');

export const fmtTime = (date: string | Date) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'hh:mm a');

export const fmtMonthYear = (date: string | Date) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'MMMM yyyy');

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end   = endOfWeek(date,   { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isTodayDate = (date: string) => isToday(parseISO(date));
export const isWeekendDate = (date: string) => isWeekend(parseISO(date));

export const monthLabel = (monthStr: string) =>
  format(parseISO(`${monthStr}-01`), 'MMMM yyyy');
