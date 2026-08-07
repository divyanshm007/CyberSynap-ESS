export const formatCurrency = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-IN').format(n);

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const getInitials = (name: string): string =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (str: string, len = 50): string =>
  str.length > len ? `${str.slice(0, len)}…` : str;
