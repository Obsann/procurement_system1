import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  TextArea,
  useToast,
} from '../../components/ui';
import {
  useCreateSupplierMutation,
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation,
} from '../../store/api/suppliersApi';
import { apiErrorMessage } from '../../lib/apiError';
import { supplierSchema, type SupplierFormData } from './supplierSchema';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export const SupplierFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: supplier, isLoading: isLoadingSupplier } = useGetSupplierByIdQuery(id!, {
    skip: !isEditing,
  });

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useReactHookForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      status: 'ACTIVE',
      country: 'Ethiopia',
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        legal_name: supplier.legal_name,
        display_name: supplier.display_name || '',
        contact_person: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || 'Ethiopia',
        tax_id: supplier.tax_id || '',
        status: (supplier.status as any) || 'ACTIVE',
        categories: supplier.categories || '',
        notes: supplier.notes || '',
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing && id) {
        await updateSupplier({ id, data }).unwrap();
        addToast('success', 'Supplier updated successfully.');
      } else {
        await createSupplier(data).unwrap();
        addToast('success', 'Supplier created successfully.');
      }
      navigate('/suppliers');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not save supplier.'));
    }
  };

  if (isEditing && isLoadingSupplier) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Supplier' : 'New Supplier'}
        actions={
          <Button
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/suppliers')}
          >
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Legal Name"
                {...register('legal_name')}
                error={errors.legal_name?.message}
                required
              />
              <Input
                label="Display Name"
                {...register('display_name')}
                error={errors.display_name?.message}
              />
              <Input
                label="Tax ID"
                {...register('tax_id')}
                error={errors.tax_id?.message}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Status</label>
                <Select
                  options={statusOptions}
                  {...register('status')}
                  onChange={(e) => setValue('status', e.target.value as any)}
                  defaultValue={supplier?.status || 'ACTIVE'}
                />
                {errors.status && <p className="text-sm text-accent-red">{errors.status.message}</p>}
              </div>
              <Input
                label="Categories (comma separated)"
                {...register('categories')}
                error={errors.categories?.message}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Contact Person"
                {...register('contact_person')}
                error={errors.contact_person?.message}
                required
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                required
              />
              <Input
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Address Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextArea
                  label="Address"
                  {...register('address')}
                  error={errors.address?.message}
                  rows={2}
                />
              </div>
              <Input
                label="City"
                {...register('city')}
                error={errors.city?.message}
              />
              <Input
                label="Country"
                {...register('country')}
                error={errors.country?.message}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-text-primary">Additional Information</h3>
            <TextArea
              label="Notes"
              {...register('notes')}
              error={errors.notes?.message}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
            <Button variant="ghost" onClick={() => navigate('/suppliers')}>
              Cancel
            </Button>
            <Button type="submit" icon={<Save className="h-4 w-4" />} isLoading={isSaving}>
              Save Supplier
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
