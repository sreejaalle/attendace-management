import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatTime = (date) => {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'hh:mm a');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy hh:mm a');
};

export const getMonthDays = (year, month) => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return eachDayOfInterval({ start, end });
};

export const isWeekendDay = (date) => {
  return isWeekend(typeof date === 'string' ? parseISO(date) : date);
};

export const getMonthName = (month) => {
  return format(new Date(2024, month - 1, 1), 'MMMM');
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-500';
    case 'absent':
      return 'bg-red-500';
    case 'late':
      return 'bg-amber-500';
    case 'half-day':
      return 'bg-orange-500';
    default:
      return 'bg-slate-500';
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present':
      return 'badge-present';
    case 'absent':
      return 'badge-absent';
    case 'late':
      return 'badge-late';
    case 'half-day':
      return 'badge-half-day';
    default:
      return 'bg-slate-500/20 text-slate-400';
  }
};
