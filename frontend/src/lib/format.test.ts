import { describe, it, expect } from 'vitest';
import { formatDate, formatMoney, formatQuantity, toNumber } from './format';
import { apiErrorMessage } from './apiError';

describe('toNumber', () => {
  it('parses the decimal strings DRF sends', () => {
    expect(toNumber('4200.00')).toBe(4200);
    expect(toNumber('0.05')).toBe(0.05);
  });

  it('treats missing or unparseable values as zero rather than NaN', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('')).toBe(0);
    expect(toNumber('not a number')).toBe(0);
  });
});

describe('formatMoney', () => {
  it('formats a decimal string as currency', () => {
    expect(formatMoney('15750.5', 'USD')).toBe('$15,750.50');
  });

  it('does not render NaN for absent amounts', () => {
    expect(formatMoney(null)).toBe('$0.00');
  });
});

describe('formatQuantity and formatDate', () => {
  it('drops trailing decimal noise from quantities', () => {
    expect(formatQuantity('6.00')).toBe('6');
  });

  it('renders an em dash for a missing date', () => {
    expect(formatDate(null)).toBe('—');
  });
});

describe('apiErrorMessage', () => {
  it('reads the core exception envelope', () => {
    const error = { data: { success: false, error: { code: 'CONFLICT', message: 'PO is closed.' } } };
    expect(apiErrorMessage(error)).toBe('PO is closed.');
  });

  it('reads a plain DRF detail', () => {
    expect(apiErrorMessage({ data: { detail: 'Not found.' } })).toBe('Not found.');
  });

  it('flattens DRF field validation errors', () => {
    const error = { data: { title: ['This field is required.'], quantity: ['Must be positive.'] } };
    expect(apiErrorMessage(error)).toBe(
      'title: This field is required. · quantity: Must be positive.',
    );
  });

  it('falls back when the payload carries nothing useful', () => {
    expect(apiErrorMessage(undefined, 'Could not save.')).toBe('Could not save.');
    expect(apiErrorMessage({ data: {} }, 'Could not save.')).toBe('Could not save.');
  });
});
