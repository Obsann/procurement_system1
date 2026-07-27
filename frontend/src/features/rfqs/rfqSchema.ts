import { z } from 'zod';

/** Mirrors the requisition form: number inputs yield strings, seeds are numbers. */
const numericField = (message: string, isValid: (value: number) => boolean) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === 'number' ? value : Number(value)))
    .refine((value) => Number.isFinite(value) && isValid(value), { message });

export const rfqLineSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: numericField('Quantity must be greater than zero', (value) => value > 0),
  unit_of_measure: z.string().min(1, 'Required'),
  pr_line: z.string().nullable().optional(),
});

export const rfqSchema = z.object({
  purchase_requisition: z.string().min(1, 'Choose an approved requisition'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  submission_deadline: z.string().min(1, 'A submission deadline is required'),
  instructions: z.string().optional(),
  // BR-06 needs quotations from two distinct suppliers before a winner can be
  // chosen, so inviting fewer than two guarantees a dead end later.
  supplier_ids: z.array(z.string()).min(2, 'Invite at least two suppliers'),
  lines: z.array(rfqLineSchema).min(1, 'Add at least one line item'),
});

export type RFQFormValues = z.input<typeof rfqSchema>;
export type RFQFormOutput = z.output<typeof rfqSchema>;

export const emptyRFQLine: RFQFormValues['lines'][number] = {
  item_name: '',
  description: '',
  quantity: 1,
  unit_of_measure: 'PCS',
  pr_line: null,
};
