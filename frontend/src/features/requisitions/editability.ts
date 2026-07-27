import { type PRStatus } from '../../types';

/**
 * BR-03 locks a requisition after submission "unless it is returned for
 * correction", so a returned one has to be editable and resubmittable.
 * Mirrors PurchaseRequisitionSerializer.EDITABLE_STATUSES on the backend.
 */
const EDITABLE_STATUSES: PRStatus[] = ['DRAFT', 'RETURNED'];

export const isEditable = (status: PRStatus): boolean => EDITABLE_STATUSES.includes(status);

/** Deleting is kept to drafts; a returned requisition is already in the workflow. */
export const isDeletable = (status: PRStatus): boolean => status === 'DRAFT';
