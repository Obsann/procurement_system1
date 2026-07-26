import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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
  useCreateRequisitionMutation,
  useGetRequisitionByIdQuery,
  useSubmitRequisitionMutation,
  useUpdateRequisitionMutation,
} from '../../store/api/requisitionsApi';
import { useGetDepartmentsQuery, useGetLocationsQuery } from '../../store/api/organizationsApi';
import { formatMoney, toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import {
  emptyLine,
  requisitionSchema,
  type RequisitionFormValues,
} from './requisitionSchema';

export const RequisitionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const { data: existing, isLoading: isLoadingExisting } = useGetRequisitionByIdQuery(id!, {
    skip: !id,
  });
  const { data: departments } = useGetDepartmentsQuery();
  const { data: locations } = useGetLocationsQuery();

  const [createRequisition, { isLoading: isCreating }] = useCreateRequisitionMutation();
  const [updateRequisition, { isLoading: isUpdating }] = useUpdateRequisitionMutation();
  const [submitRequisition, { isLoading: isSubmitting }] = useSubmitRequisitionMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      title: '',
      description: '',
      department: '',
      delivery_location: '',
      required_delivery_date: '',
      currency: 'USD',
      lines: [{ ...emptyLine }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    if (!existing) return;
    reset({
      title: existing.title,
      description: existing.description,
      department: existing.department ?? '',
      delivery_location: existing.delivery_location ?? '',
      required_delivery_date: existing.required_delivery_date ?? '',
      currency: existing.currency,
      lines: existing.lines.length
        ? existing.lines.map((line) => ({
            item_name: line.item_name,
            description: line.description ?? '',
            category: line.category ?? '',
            quantity: toNumber(line.quantity),
            unit_of_measure: line.unit_of_measure ?? 'PCS',
            estimated_unit_price: toNumber(line.estimated_unit_price),
          }))
        : [{ ...emptyLine }],
    });
  }, [existing, reset]);

  const watchedLines = useWatch({ control, name: 'lines' });
  const watchedCurrency = useWatch({ control, name: 'currency' });

  const total = useMemo(
    () =>
      (watchedLines ?? []).reduce(
        (sum, line) => sum + toNumber(line?.quantity) * toNumber(line?.estimated_unit_price),
        0,
      ),
    [watchedLines],
  );

  const departmentOptions = [
    { value: '', label: 'Select a department' },
    ...(departments?.results ?? []).map((d) => ({ value: d.id, label: d.name })),
  ];

  const locationOptions = [
    { value: '', label: 'No delivery location' },
    ...(locations?.results ?? []).map((l) => ({ value: l.id, label: l.name })),
  ];

  const persist = async (values: RequisitionFormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      department: values.department,
      // The API rejects empty strings for nullable relations and dates.
      delivery_location: values.delivery_location || null,
      required_delivery_date: values.required_delivery_date || null,
      currency: values.currency,
      lines: values.lines.map((line, index) => ({
        item_name: line.item_name,
        description: line.description ?? '',
        category: line.category ?? '',
        quantity: String(line.quantity),
        unit_of_measure: line.unit_of_measure,
        estimated_unit_price: String(line.estimated_unit_price),
        sort_order: index,
      })),
    };

    return isEdit
      ? updateRequisition({ id: id!, data: payload }).unwrap()
      : createRequisition(payload).unwrap();
  };

  const onSaveDraft = handleSubmit(async (values) => {
    try {
      const saved = await persist(values);
      addToast('success', `${saved.pr_number} saved as draft.`);
      navigate('/requisitions');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not save this requisition.'));
    }
  });

  const onSubmitForApproval = handleSubmit(async (values) => {
    try {
      const saved = await persist(values);
      await submitRequisition(saved.id).unwrap();
      addToast('success', `${saved.pr_number} submitted for approval.`);
      navigate('/requisitions');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not submit this requisition.'));
    }
  });

  const busy = isCreating || isUpdating || isSubmitting;

  if (isEdit && isLoadingExisting) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-surface" />;
  }

  if (isEdit && existing && existing.status !== 'DRAFT') {
    return (
      <div className="space-y-6">
        <PageHeader title={existing.pr_number} description={existing.title} />
        <Card className="p-8 text-center">
          <p className="mb-4 text-text-secondary">
            Only draft requisitions can be edited. This one is {existing.status.toLowerCase()}.
          </p>
          <Button variant="secondary" onClick={() => navigate(`/requisitions/${existing.id}`)}>
            View requisition
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <form className="max-w-5xl space-y-6" onSubmit={onSaveDraft}>
      <PageHeader
        title={isEdit ? `Edit ${existing?.pr_number ?? 'requisition'}` : 'Create requisition'}
        description="Requisitions stay editable until you submit them for approval"
        actions={
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/requisitions')}
          >
            Back to list
          </Button>
        }
      />

      <Card className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            placeholder="What is being requested?"
            error={errors.title?.message}
            {...register('title')}
          />
          <Select
            label="Department"
            options={departmentOptions}
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <TextArea
          label="Description"
          rows={4}
          placeholder="Explain what you need and why"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            label="Delivery location"
            options={locationOptions}
            {...register('delivery_location')}
          />
          <Input
            label="Required delivery date"
            type="date"
            {...register('required_delivery_date')}
          />
          <Input label="Currency" error={errors.currency?.message} {...register('currency')} />
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Line items</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => append({ ...emptyLine })}
          >
            Add item
          </Button>
        </div>

        {errors.lines?.root && (
          <p className="mb-3 text-xs text-danger">{errors.lines.root.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => {
            const lineErrors = errors.lines?.[index];
            const lineTotal =
              toNumber(watchedLines?.[index]?.quantity) *
              toNumber(watchedLines?.[index]?.estimated_unit_price);

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border-default bg-bg-surface-hover/40 p-4 md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <Input
                    label="Item"
                    placeholder="Item name"
                    error={lineErrors?.item_name?.message}
                    {...register(`lines.${index}.item_name`)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Description"
                    placeholder="Optional detail"
                    {...register(`lines.${index}.description`)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="Qty"
                    type="number"
                    min="0"
                    step="0.01"
                    error={lineErrors?.quantity?.message}
                    {...register(`lines.${index}.quantity`)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="Unit"
                    error={lineErrors?.unit_of_measure?.message}
                    {...register(`lines.${index}.unit_of_measure`)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Unit price"
                    type="number"
                    min="0"
                    step="0.01"
                    error={lineErrors?.estimated_unit_price?.message}
                    {...register(`lines.${index}.estimated_unit_price`)}
                  />
                </div>
                <div className="flex items-end justify-between gap-2 md:col-span-2">
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">Line total</p>
                    <p className="truncate font-medium text-accent-indigo">
                      {formatMoney(lineTotal, watchedCurrency || 'USD')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove line ${index + 1}`}
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    icon={<Trash2 className="h-4 w-4" />}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border-default pt-4">
          <span className="text-sm font-semibold text-text-secondary">Total estimated</span>
          <span className="text-lg font-bold text-accent-indigo">
            {formatMoney(total, watchedCurrency || 'USD')}
          </span>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate('/requisitions')}>
          Cancel
        </Button>
        <Button type="submit" variant="secondary" isLoading={isCreating || isUpdating}>
          Save as draft
        </Button>
        <Button type="button" isLoading={busy} onClick={onSubmitForApproval}>
          Submit for approval
        </Button>
      </div>
    </form>
  );
};
