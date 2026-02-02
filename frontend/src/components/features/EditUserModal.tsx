'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { usersService, type User } from '@/services/usersService';

const schema = z.object({
  name: z
    .string()
    .min(2, 'User name is required')
    .max(40, 'User name cannot exceed 40 characters'),
  role: z.enum(['USER', 'ADMIN', 'SA']),
  status: z.enum(['Active', 'Inactive']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active' },
  });

  const roleValue = watch('role');
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
    if (user && open) {
      setUserId(user.id);
      const userStatus = user.status === 'Inactive' ? 'Inactive' : 'Active';
      reset({
        name: user.name || '',
        role: user.role || 'USER',
        status: userStatus,
      });
      setValue('status', userStatus);
    }
  }, [user, open, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      setLoading(true);
      await usersService.update(user.id, data);
      toast.success(`User "${data.name}" updated successfully`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user) return null;

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

        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit User</h1>
        <p className="mb-8 text-sm text-gray-500">
          Modify the user’s details and save changes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ID + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                ID<span className="text-red-500">*</span>
              </label>
              <Input
                value={userId ?? ''}
                readOnly
                className="cursor-not-allowed bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Name<span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. John Doe" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Role<span className="text-red-500">*</span>
            </label>

            <Select
              key={`role-${user?.id}-${roleValue}`}
              value={roleValue}
              onValueChange={(val: 'USER' | 'ADMIN' | 'SA') =>
                setValue('role', val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                <SelectValue placeholder="Select role">
                  {roleValue || 'Select role'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SA">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Status<span className="text-red-500">*</span>
            </label>

            <Select
              key={`status-${user?.id}-${statusValue}`}
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

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-lime-600 hover:bg-lime-500"
            >
              {isSubmitting || loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
