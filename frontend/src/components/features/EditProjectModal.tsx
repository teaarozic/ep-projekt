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
import { projectsService, type Project } from '@/services/projectsService';
import { clientsService } from '@/services/clientsService';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';

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
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProjectModal({
  open,
  project,
  onClose,
  onSuccess,
}: Props) {
  const [clients, setClients] = useState<{ id: number; email: string }[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'Active',
      clientId: 0,
    },
  });

  const statusValue = watch('status');
  const clientIdValue = watch('clientId');

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
    if (!open) {
      setClients([]);
      setIsLoadingClients(false);
      return;
    }

    setIsLoadingClients(true);

    (async () => {
      try {
        const data = await clientsService.getAll();
        const formatted = data.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
        }));
        setClients(formatted);
      } catch {
        toast.error('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!project || !open || isLoadingClients || clients.length === 0) return;

    setProjectId(project.id);

    const currentStatus = project.status === 'Inactive' ? 'Inactive' : 'Active';

    reset({
      name: project.name,
      country: project.country || '',
      status: currentStatus,
      clientId: project.clientId ?? 0,
    });

    setValue('status', currentStatus, { shouldValidate: false });
    if (project.clientId) {
      setValue('clientId', project.clientId, { shouldValidate: false });
    }
  }, [project, open, reset, setValue, isLoadingClients, clients]);

  const onSubmit = async (data: FormData) => {
    if (!project) return;
    try {
      await projectsService.update(project.id, data);
      toast.success(`Project "${data.name}" updated successfully`);
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

  if (!open || !project) return null;

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

        <h1 className="mb-2 text-xl font-bold text-gray-900">Edit Project</h1>
        <p className="mb-8 text-sm text-gray-500">
          Update project details and save changes.
        </p>

        {isLoadingClients ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-lime-600"></div>
            <span className="ml-3 text-gray-600">Loading clients...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ID + Project Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  ID
                </label>
                <Input
                  value={projectId ?? ''}
                  readOnly
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
              <Select
                key={`client-${project?.id}-${clientIdValue}`}
                onValueChange={(val) =>
                  setValue('clientId', Number(val), { shouldValidate: true })
                }
                value={
                  clientIdValue && clientIdValue > 0
                    ? String(clientIdValue)
                    : ''
                }
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                  <SelectValue placeholder="Select client email" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      No clients available
                    </div>
                  ) : (
                    clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-500">
                  {errors.clientId.message}
                </p>
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
                  <p className="text-sm text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Status<span className="text-red-500">*</span>
                </label>
                <Select
                  key={`status-${project?.id}-${statusValue}`}
                  value={statusValue || ''}
                  onValueChange={(val: 'Active' | 'Inactive') =>
                    setValue('status', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message}
                  </p>
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
                disabled={isSubmitting || clients.length === 0}
                className="bg-lime-600 hover:bg-lime-500"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
