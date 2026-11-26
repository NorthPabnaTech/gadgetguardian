'use client';

import * as React from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { z } from 'zod';

import { LocationFields } from '@/features/address/location-fields';
import type { AddressDTO } from '@/types';
import { Form, FormCheckbox, FormInput } from '@components/form';
import { Icon } from '@components/icon/icon';
import { EmptyState } from '@components/shared';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { SHIPPING_ZONE_LABELS } from '@lib/constants';
import { applyStorefrontErrors, storefrontRequest } from '@lib/storefront-browser';
import { toast } from '@lib/toast';
import { addressFields, checkLocation, requiredText } from '@lib/validators/common';

const addressSchema = z
  .object({
    label: requiredText('Label', 40),
    ...addressFields,
    isDefault: z.boolean().optional(),
  })
  .superRefine(checkLocation);

type FormValues = z.infer<typeof addressSchema>;

export function AddressBook({
  addresses: initialAddresses,
  userName,
  userPhone,
}: {
  addresses: AddressDTO[];
  userName: string;
  userPhone?: string;
}) {
  const router = useRouter();
  const [addresses, setAddresses] = React.useState(initialAddresses);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AddressDTO | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (addr: AddressDTO) => {
    setEditing(addr);
    setOpen(true);
  };

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    const res = await storefrontRequest<AddressDTO>(`/addresses/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { isDefault: true },
    });
    setBusyId(null);
    if (applyStorefrontErrors(res)) {
      toast.success('Default address updated');
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const res = await storefrontRequest<{ deleted: boolean; id: string }>(
      `/addresses/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    setBusyId(null);
    if (applyStorefrontErrors(res)) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-ink text-lg font-semibold">Saved addresses</h2>
          <p className="text-muted mt-0.5 text-sm">
            Pick a saved address at checkout for faster ordering.
          </p>
        </div>
        <Button variant="noir" onClick={openNew}>
          <Icon name="plus" size={16} /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add a delivery address so you don’t have to type it every time."
          action={
            <Button variant="noir" onClick={openNew}>
              Add address
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="border-line flex flex-col justify-between rounded-2xl border bg-white p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink font-semibold">{a.label}</span>
                  {a.isDefault && <Badge tone="ok">Default</Badge>}
                </div>
                <p className="text-ink mt-2 text-sm font-medium">
                  {a.fullName} · {a.phone}
                </p>
                <p className="text-muted mt-1 text-sm">{a.addressLine}</p>
                <p className="text-muted mt-0.5 text-xs">
                  {[a.area, a.city, a.division].filter(Boolean).join(', ')} ·{' '}
                  {SHIPPING_ZONE_LABELS[a.zone]}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
                {!a.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === a.id}
                    onClick={() => handleSetDefault(a.id)}
                  >
                    Set default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === a.id}
                  onClick={() => openEdit(a)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--status-danger-fg)]"
                  disabled={busyId === a.id}
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        userName={userName}
        userPhone={userPhone}
        onSaved={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function AddressDialog({
  open,
  onOpenChange,
  editing,
  userName,
  userPhone,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AddressDTO | null;
  userName: string;
  userPhone?: string;
  onSaved: () => void;
}) {
  const form = Form.useForm<FormValues>({
    schema: addressSchema,
    defaultValues: {
      label: editing?.label ?? 'Home',
      fullName: editing?.fullName ?? userName,
      phone: editing?.phone ?? userPhone ?? '',
      addressLine: editing?.addressLine ?? '',
      division: editing?.division ?? '',
      city: editing?.city ?? '',
      area: editing?.area ?? '',
      zone: editing?.zone ?? 'outside_dhaka',
      isDefault: editing?.isDefault ?? false,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      label: editing?.label ?? 'Home',
      fullName: editing?.fullName ?? userName,
      phone: editing?.phone ?? userPhone ?? '',
      addressLine: editing?.addressLine ?? '',
      division: editing?.division ?? '',
      city: editing?.city ?? '',
      area: editing?.area ?? '',
      zone: editing?.zone ?? 'outside_dhaka',
      isDefault: editing?.isDefault ?? false,
    });
  }, [open, editing, userName, userPhone, form]);

  const { isSubmitting } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit address' : 'Add address'}</DialogTitle>
        </DialogHeader>
        <Form
          form={form}
          className="mt-2 space-y-4"
          onFinish={async (values) => {
            const res = editing
              ? await storefrontRequest<AddressDTO>(`/addresses/${encodeURIComponent(editing.id)}`, {
                  method: 'PATCH',
                  body: values,
                })
              : await storefrontRequest<AddressDTO>('/addresses', {
                  method: 'POST',
                  body: values,
                });
            if (applyStorefrontErrors(res, form)) {
              toast.success(editing ? 'Address updated' : 'Address saved');
              onSaved();
            }
          }}
        >
          <FormInput name="label" label="Label" placeholder="Home, Office…" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="fullName" label="Full name" required />
            <FormInput
              name="phone"
              label="Mobile number"
              placeholder="01XXXXXXXXX"
              inputMode="tel"
              required
            />
          </div>
          <LocationFields />
          <FormInput
            name="addressLine"
            label="Street address"
            placeholder="House, road, block, landmark"
            required
          />
          <FormCheckbox name="isDefault" label="Set as default delivery address" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="noir" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editing ? 'Update address' : 'Save address'}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
