const MS_PER_DAY = 86_400_000;

/** Whole days a record has been sitting in its current queue. */
export const daysWaiting = (since: string | null | undefined): number => {
  if (!since) return 0;
  const elapsed = Date.now() - new Date(since).getTime();
  return elapsed > 0 ? Math.floor(elapsed / MS_PER_DAY) : 0;
};

/** Ages beyond a week are worth flagging to an approver. */
export const waitingTone = (days: number): string =>
  days >= 7 ? 'text-danger' : days >= 3 ? 'text-warning' : 'text-text-secondary';
