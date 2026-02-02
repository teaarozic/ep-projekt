'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { clientsService, type Client } from '@/services/clientsService';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Client name is required')
    .max(40, 'Client name cannot exceed 40 characters'),
  email: z.string().email('Invalid email address'),
  country: z
    .string()
    .min(2, 'Country is required')
    .max(40, 'Country cannot exceed 40 characters'),
  status: z.enum(['Active', 'Inactive']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditClientModal({
  open,
  client,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active' },
  });

  const [clientId, setClientId] = useState<number | null>(null);
  const statusValue = watch('status');

  useEffect(() => {
    if (open) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  useEffect(() => {
    if (client && open) {
      setClientId(client.id);
      const clientStatus = client.status === 'Inactive' ? 'Inactive' : 'Active';
      reset({
        name: client.name,
        email: client.email,
        country: client.company || '',
        status: clientStatus,
      });
      setValue('status', clientStatus);
    }
  }, [client, open, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!client) return;
    try {
      await clientsService.update(client.id, {
        name: data.name,
        email: data.email,
        company: data.country,
        status: data.status,
      });
      toast.success(MESSAGES.clients.updateSuccess(data.name));
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? mapApiError(err.message)
          : MESSAGES.common.unknownError;
      toast.error(message);
    }
  };

  if (!open || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        {/* Close (X) button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Client</h1>
        <p className="mb-8 text-sm text-gray-500">
          Update the details of this client.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ID + Client name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                ID<span className="text-red-500">*</span>
              </label>
              <Input
                value={clientId ?? ''}
                readOnly
                className="cursor-not-allowed bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Client name<span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. Acme Inc" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email address<span className="text-red-500">*</span>
            </label>
            <Input placeholder="you@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Country + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Country<span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. Germany" {...register('country')} />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Status<span className="text-red-500">*</span>
              </label>

              <Select
                key={`status-${client?.id}-${statusValue}`}
                value={statusValue}
                onValueChange={(val: 'Active' | 'Inactive') =>
                  setValue('status', val, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                  <SelectValue placeholder="Select status">
                    {statusValue || 'Select status'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-lime-600 hover:bg-lime-500"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
