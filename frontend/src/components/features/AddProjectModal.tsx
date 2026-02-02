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
import { projectsService } from '@/services/projectsService';
import { clientsService } from '@/services/clientsService';
import { logger } from '@/utils/logger';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Project name is required')
    .max(40, 'Project name cannot exceed 40 characters'),
  country: z
    .string()
    .min(2, 'Country is required')
    .max(40, 'Country cannot exceed 40 characters'),
  status: z.enum(['Active', 'Inactive']),
  clientId: z.number().min(1, 'Client is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProjectModal({ open, onClose, onSuccess }: Props) {
  const [nextId, setNextId] = useState<number | null>(null);
  const [clients, setClients] = useState<{ id: number; email: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active' },
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

  useEffect(() => {
    if (open) {
      void (async () => {
        try {
          const id = await projectsService.getNextId();
          setNextId(id);
        } catch (error) {
          logger.error(
            '[AddProjectModal] Failed to load next project ID:',
            error
          );
          toast.error('Failed to load project ID');
          setNextId(null);
        }
      })();

      void (async () => {
        try {
          const data = await clientsService.getAll();
          setClients(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email,
            }))
          );
        } catch (error) {
          logger.error('[AddProjectModal] Failed to load clients:', error);
          toast.error('Failed to load clients');
          setClients([]);
        }
      })();
    }
  }, [open]);

  const onSubmit = async (data: FormData) => {
    try {
      await projectsService.create({
        name: data.name,
        country: data.country,
        status: data.status,
        clientId: data.clientId,
      });
      toast.success(`Project "${data.name}" created`);
      reset();
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create project');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h1 className="mb-2 text-xl font-bold text-gray-900">
          Add New Project
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Choose an existing client and fill in project details.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ID + Project Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">ID</label>
              <Input
                value={nextId ?? ''}
                readOnly
                placeholder="Loading..."
                className="cursor-not-allowed bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Project Name<span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. EcoTrek App" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Client Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Client Email<span className="text-red-500">*</span>
            </label>
            <Select onValueChange={(val) => setValue('clientId', Number(val))}>
              <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                <SelectValue
                  placeholder={
                    clients.length === 0
                      ? 'No clients available'
                      : 'Select client email'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 && (
                  <div className="px-2 py-4 text-center text-sm text-gray-500">
                    No clients found. Please add a client first.
                  </div>
                )}
                {clients.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.clientId && (
              <p className="text-sm text-red-500">{errors.clientId.message}</p>
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
                onValueChange={(val: 'Active' | 'Inactive') =>
                  setValue('status', val)
                }
                defaultValue="Active"
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || nextId === null || clients.length === 0}
              className="bg-lime-600 hover:bg-lime-500"
            >
              {isSubmitting ? 'Saving...' : 'Add Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
