'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
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
import { usersService } from '@/services/usersService';
import { getDisplayName } from '@/utils/userDisplay';
import { useForm, Controller } from 'react-hook-form';
import { logger } from '@/utils/logger';

const schema = z.object({
  name: z
    .string()
    .min(2, 'User name is required')
    .max(40, 'User name cannot exceed 40 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'ADMIN', 'SA']),
  status: z.enum(['Active', 'Inactive']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ open, onClose, onSuccess }: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER', status: 'Active' },
  });

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

  const onSubmit = async (data: FormData) => {
    try {
      const nameToSave =
        data.name.trim() || getDisplayName({ email: data.email });

      await usersService.create({
        name: nameToSave,
        email: data.email.trim(),
        password: data.password,
        role: data.role,
        status: data.status,
      });

      toast.success(`User "${nameToSave}" created successfully`);
      onSuccess();
      onClose();
      reset();
    } catch (err) {
      logger.error('[AddUserModal] Failed to create user:', err);
      toast.error('Failed to create user');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h1 className="mb-2 text-xl font-bold text-gray-900">Add New User</h1>
        <p className="mb-8 text-sm text-gray-500">
          Fill in the details to add a new user to your system.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              User name<span className="text-red-500">*</span>
            </label>
            <Input placeholder="e.g. John Doe" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email<span className="text-red-500">*</span>
            </label>
            <Input placeholder="you@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password<span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Role<span className="text-red-500">*</span>
              </label>

              <Controller
                name="role"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SA">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Status<span className="text-red-500">*</span>
              </label>

              <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-lime-600 hover:bg-lime-500"
            >
              {isSubmitting ? 'Saving...' : 'Add user'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
