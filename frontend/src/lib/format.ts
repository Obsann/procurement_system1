/**
 * DRF serialises DecimalField as a string to avoid float drift, so amounts
 * arrive here as strings and must be parsed before display or arithmetic.
 */
export const toNumber = (value: string | number | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatMoney = (value: string | number | null | undefined, currency = 'ETB'): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

export const formatQuantity = (value: string | number | null | undefined): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(toNumber(value));

export const formatDate = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleDateString() : '—';

export const formatDateTime = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleString() : '—';
