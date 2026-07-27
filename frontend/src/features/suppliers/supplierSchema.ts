import { z } from 'zod';

export const supplierSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  display_name: z.string().optional(),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Ethiopia'),
  tax_id: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).default('ACTIVE'),
  categories: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
