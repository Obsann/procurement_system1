import { describe, it, expect } from 'vitest';
import { isDeletable, isEditable } from './editability';

describe('requisition editability', () => {
  it('allows editing a draft', () => {
    expect(isEditable('DRAFT')).toBe(true);
  });

  it('allows editing one that was returned for correction, per BR-03', () => {
    expect(isEditable('RETURNED')).toBe(true);
  });

  it('locks a requisition once it is with an approver or beyond', () => {
    expect(isEditable('SUBMITTED')).toBe(false);
    expect(isEditable('APPROVED')).toBe(false);
    expect(isEditable('REJECTED')).toBe(false);
  });

  it('keeps deletion to drafts, since a returned one is already in the workflow', () => {
    expect(isDeletable('DRAFT')).toBe(true);
    expect(isDeletable('RETURNED')).toBe(false);
  });
});
