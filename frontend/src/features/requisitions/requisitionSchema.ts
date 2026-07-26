import { z } from 'zod';

/**
 * Number inputs hand back strings, but the same fields are seeded with numbers
 * when an existing requisition is loaded. `z.coerce` would widen the inferred
 * input type to `unknown`, so the accepted shape is spelled out instead.
 */
const numericField = (message: string, isValid: (value: number) => boolean) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === 'number' ? value : Number(value)))
    .refine((value) => Number.isFinite(value) && isValid(value), { message });

export const requisitionLineSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: numericField('Quantity must be greater than zero', (value) => value > 0),
  unit_of_measure: z.string().min(1, 'Required'),
  estimated_unit_price: numericField('Price cannot be negative', (value) => value >= 0),
});

export const requisitionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  department: z.string().min(1, 'Department is required'),
  delivery_location: z.string().optional(),
  required_delivery_date: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  // BR-01: a requisition needs at least one line before it can be submitted.
  lines: z.array(requisitionLineSchema).min(1, 'Add at least one line item'),
});

export type RequisitionFormValues = z.input<typeof requisitionSchema>;
export type RequisitionFormOutput = z.output<typeof requisitionSchema>;

export const emptyLine: RequisitionFormValues['lines'][number] = {
  item_name: '',
  description: '',
  category: '',
  quantity: 1,
  unit_of_measure: 'PCS',
  estimated_unit_price: 0,
};
