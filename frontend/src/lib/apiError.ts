/**
 * apps/core/exceptions.py wraps failures as
 * `{ success: false, error: { code, message, details } }`, while DRF's own
 * validation errors surface as a field/messages map. Both shapes reach the UI.
 */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  const data = (error as { data?: unknown })?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;

  const envelope = (data as { error?: { message?: unknown; details?: unknown } }).error;
  const payload = envelope ?? data;

  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object' && payload !== null) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;

    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;

    const fieldMessages = Object.entries(payload as Record<string, unknown>)
      .filter(([key]) => !['code', 'details', 'message'].includes(key))
      .flatMap(([key, value]) => {
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        return text ? [`${key}: ${text}`] : [];
      });
    if (fieldMessages.length) return fieldMessages.join(' · ');
  }

  return fallback;
};
