import { describe, it, expect } from 'vitest';
import { isNavItemVisible, navItems, pageTitleFor } from './navigation';
import { type Role } from '../../types';

const labelsFor = (roles: Role[]) =>
  navItems.filter((item) => isNavItemVisible(item, roles)).map((item) => item.label);

describe('navigation visibility', () => {
  it('shows a requester only their own sections', () => {
    expect(labelsFor(['REQUESTER'])).toEqual([
      'Dashboard',
      'Requisitions',
      'Notifications',
      'Settings',
    ]);
  });

  it('keeps warehouse officers away from financial review', () => {
    const labels = labelsFor(['WAREHOUSE_OFFICER']);
    expect(labels).toContain('Goods Receipts');
    expect(labels).not.toContain('Financial Review');
    expect(labels).not.toContain('Audit Log');
  });

  it('gives admins every section', () => {
    expect(labelsFor(['ADMIN'])).toHaveLength(navItems.length);
  });

  it('unions the sections of a user holding several roles', () => {
    const labels = labelsFor(['REQUESTER', 'FINANCIAL_REVIEWER']);
    expect(labels).toContain('Requisitions');
    expect(labels).toContain('Financial Review');
  });

  it('still shows unrestricted items to a user with no roles', () => {
    expect(labelsFor([])).toEqual(['Dashboard', 'Notifications', 'Settings']);
  });
});

describe('pageTitleFor', () => {
  it('titles a section route', () => {
    expect(pageTitleFor('/requisitions')).toBe('Requisitions');
  });

  it('inherits the section title on nested routes', () => {
    expect(pageTitleFor('/requisitions/abc-123/edit')).toBe('Requisitions');
  });

  it('falls back for unknown routes', () => {
    expect(pageTitleFor('/nowhere')).toBe('ProcureSync');
  });
});
