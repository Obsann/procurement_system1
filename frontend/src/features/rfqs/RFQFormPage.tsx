import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useCreateRFQMutation } from '../../store/api/rfqApi';
import { useGetRequisitionsQuery } from '../../store/api/requisitionsApi';
import { useGetSuppliersQuery } from '../../store/api/suppliersApi';
import { toNumber } from '../../lib/format';
import { apiErrorMessage } from '../../lib/apiError';
import { emptyRFQLine, rfqSchema, type RFQFormValues } from './rfqSchema';

export const RFQFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const presetPR = searchParams.get('pr') ?? '';

  // BR-05: an RFQ can only be raised against an approved requisition.
  const { data: requisitions } = useGetRequisitionsQuery({ status: 'APPROVED' });
  const { data: suppliers } = useGetSuppliersQuery({ status: 'ACTIVE' });
  const [createRFQ, { isLoading: isCreating }] = useCreateRFQMutation();

  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RFQFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      purchase_requisition: presetPR,
      title: '',
      description: '',
      submission_deadline: '',
      instructions: '',
      supplier_ids: [],
      lines: [{ ...emptyRFQLine }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const selectedPR = useWatch({ control, name: 'purchase_requisition' });
  const selectedSuppliers = useWatch({ control, name: 'supplier_ids' }) ?? [];

  // Re-keying the RFQ lines by hand would mean retyping the requisition, so
  // adopt its lines the first time a requisition is chosen.
  useEffect(() => {
    if (!selectedPR || selectedPR === prefilledFrom) return;
    const pr = requisitions?.results.find((row) => row.id === selectedPR);
    if (!pr) return;

    setPrefilledFrom(selectedPR);
    reset(
      (current) => ({
        ...current,
        purchase_requisition: selectedPR,
        title: current.title || `RFQ for ${pr.title}`,
        description: current.description || pr.description,
        lines: pr.lines.length
          ? pr.lines.map((line) => ({
              item_name: line.item_name,
              description: line.description ?? '',
              quantity: toNumber(line.quantity),
              unit_of_measure: line.unit_of_measure ?? 'PCS',
              pr_line: line.id,
            }))
          : [{ ...emptyRFQLine }],
      }),
      { keepDefaultValues: true },
    );
  }, [selectedPR, prefilledFrom, requisitions, reset]);

  const requisitionOptions = [
    { value: '', label: 'Select an approved requisition' },
    ...(requisitions?.results ?? []).map((pr) => ({
      value: pr.id,
      label: `${pr.pr_number} — ${pr.title}`,
    })),
  ];

  const supplierList = suppliers?.results ?? [];

  const toggleSupplier = (supplierId: string) => {
    const next = selectedSuppliers.includes(supplierId)
      ? selectedSuppliers.filter((id) => id !== supplierId)
      : [...selectedSuppliers, supplierId];
    setValue('supplier_ids', next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const created = await createRFQ({
        purchase_requisition: values.purchase_requisition,
        title: values.title,
        description: values.description ?? '',
        submission_deadline: values.submission_deadline,
        instructions: values.instructions ?? '',
        supplier_ids: values.supplier_ids,
        lines: values.lines.map((line) => ({
          item_name: line.item_name,
          description: line.description ?? '',
          quantity: String(line.quantity),
          unit_of_measure: line.unit_of_measure,
          pr_line: line.pr_line ?? null,
        })),
      }).unwrap();
      addToast('success', `${created.rfq_number} created.`);
      navigate(`/rfqs/${created.id}`);
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Could not create this RFQ.'));
    }
  });

  return (
    <form className="max-w-5xl space-y-6" onSubmit={onSubmit}>
      <PageHeader
        title="Create RFQ"
        description="Invite suppliers to quote against an approved requisition"
        actions={
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/rfqs')}
          >
            Back to list
          </Button>
        }
      />

      <Card className="space-y-6 p-6">
        <Select
          label="Approved requisition"
          options={requisitionOptions}
          error={errors.purchase_requisition?.message}
          {...register('purchase_requisition')}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Input
            label="Submission deadline"
            type="date"
            error={errors.submission_deadline?.message}
            {...register('submission_deadline')}
          />
        </div>

        <TextArea label="Description" rows={2} {...register('description')} />
        <TextArea
          label="Instructions to suppliers"
          rows={2}
          placeholder="Delivery terms, packaging, warranty expectations"
          {...register('instructions')}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Invited suppliers</h3>
          <p className="text-sm text-text-muted">
            A winner can only be chosen once two different suppliers have quoted, so invite at
            least two.
          </p>
        </div>

        {supplierList.length === 0 ? (
          <p className="text-sm text-text-muted">
            No active suppliers yet. Register one before creating an RFQ.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {supplierList.map((supplier) => (
              <label
                key={supplier.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3 hover:bg-bg-subtle"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border-default"
                  checked={selectedSuppliers.includes(supplier.id)}
                  onChange={() => toggleSupplier(supplier.id)}
                />
                <span className="text-sm text-text-primary">{supplier.legal_name}</span>
              </label>
            ))}
          </div>
        )}
        {errors.supplier_ids?.message ? (
          <p className="text-sm text-danger">{errors.supplier_ids.message}</p>
        ) : null}
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Line items</h3>
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => append({ ...emptyRFQLine })}
          >
            Add line
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <Input
                label={index === 0 ? 'Item' : undefined}
                error={errors.lines?.[index]?.item_name?.message}
                {...register(`lines.${index}.item_name` as const)}
              />
            </div>
            <div className="md:col-span-4">
              <Input
                label={index === 0 ? 'Description' : undefined}
                {...register(`lines.${index}.description` as const)}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label={index === 0 ? 'Quantity' : undefined}
                type="number"
                step="0.01"
                error={errors.lines?.[index]?.quantity?.message}
                {...register(`lines.${index}.quantity` as const)}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label={index === 0 ? 'Unit' : undefined}
                {...register(`lines.${index}.unit_of_measure` as const)}
              />
            </div>
            <div className="flex items-end md:col-span-1">
              <Button
                type="button"
                variant="ghost"
                aria-label={`Remove line ${index + 1}`}
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          </div>
        ))}
        {errors.lines?.message ? (
          <p className="text-sm text-danger">{errors.lines.message}</p>
        ) : null}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate('/rfqs')}>
          Cancel
        </Button>
        <Button type="submit" loading={isCreating}>
          Create RFQ
        </Button>
      </div>
    </form>
  );
};
