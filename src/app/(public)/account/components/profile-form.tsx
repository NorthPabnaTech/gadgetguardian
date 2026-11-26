'use client';

import { useRouter } from 'nextjs-toploader/app';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Form, FormInput } from '@components/form';
import { Button } from '@components/ui/button';
import { applyStorefrontErrors, storefrontRequest } from '@lib/storefront-browser';
import type { StorefrontCustomer } from '@lib/storefront-client';
import { toast } from '@lib/toast';
import { bdPhone, requiredText } from '@lib/validators/common';

const profileSchema = z.object({
  name: requiredText('Full name', 80),
  phone: bdPhone,
});

type Values = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: { user: StorefrontCustomer }) {
  const router = useRouter();
  const form = Form.useForm<Values>({
    schema: profileSchema,
    defaultValues: {
      name: user.name,
      phone: user.phone ?? '',
    },
  });
  const { isSubmitting } = form.formState;

  return (
    <Form
      form={form}
      className="mt-6 max-w-md space-y-5"
      onFinish={async (values) => {
        const res = await storefrontRequest<StorefrontCustomer>('/auth/me', {
          method: 'PATCH',
          body: values,
        });
        if (applyStorefrontErrors(res, form)) {
          toast.success('Profile updated');
          router.refresh();
        }
      }}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="bg-noir text-brand-300 text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-ink font-semibold">{user.name}</p>
          {user.email && <p className="text-muted text-sm">{user.email}</p>}
        </div>
      </div>

      <FormInput name="name" label="Full name" required />
      <FormInput
        name="phone"
        label="Mobile number"
        placeholder="01XXXXXXXXX"
        inputMode="tel"
        required
      />

      <Button type="submit" variant="noir" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </Form>
  );
}
