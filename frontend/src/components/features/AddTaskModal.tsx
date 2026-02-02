'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { tasksService } from '@/services/tasksService';
import { projectsService } from '@/services/projectsService';
import { clientsService } from '@/services/clientsService';
import { usersService } from '@/services/usersService';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';
import type { Project } from '@/services/projectsService';
import { DateInput } from '../ui/DateInput';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  title: z
    .string()
    .min(2, 'Task title is required')
    .max(40, 'Task title cannot exceed 40 characters'),
  projectId: z.number().min(1, 'Project is required'),
  clientId: z.number().optional().nullable(),
  assigneeId: z.number().optional().nullable(),
  status: z.enum(['QA', 'In progress', 'Blocked', 'To do', 'Done']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    }),
  timeSpentHours: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    }),
  progress: z.number().optional(),
  done: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface ProjectOption {
  id: number;
  name: string;
}
interface ClientOption {
  id: number;
  name: string;
}
interface UserOption {
  id: number;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTaskModal({ open, onClose, onSuccess }: Props) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [fullProjects, setFullProjects] = useState<Project[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: '',
      projectId: undefined,
      status: 'To do',
      clientId: undefined,
      assigneeId: undefined,
      startDate: '',
      endDate: '',
      estimatedHours: undefined,
      timeSpentHours: undefined,
      progress: undefined,
      done: false,
    },
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
    if (!open || !user) return;

    (async () => {
      try {
        const proj = await projectsService.getAll();

        let cli: ClientOption[] = [];

        if (user.role === 'ADMIN' || user.role === 'SA') {
          cli = await clientsService.getAll();
        }

        let usr = [];
        if (user.role === 'ADMIN' || user.role === 'SA') {
          usr = await usersService.getAll();
        } else {
          const me = await usersService.getMe();
          usr = [me];
        }

        setFullProjects(proj);
        setProjects(proj.map((p: Project) => ({ id: p.id, name: p.name })));
        setClients(
          cli.map((c: { id: number; name: string }) => ({
            id: c.id,
            name: c.name,
          }))
        );
        setUsers(
          usr.map((u: { id: number; email: string }) => ({
            id: u.id,
            email: u.email,
          }))
        );
      } catch {
        toast.error('Failed to load dropdown data');
      }
    })();
  }, [open, user]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const payload = {
        ...data,
        clientId: data.clientId ?? undefined,
        assigneeId: data.assigneeId ?? undefined,
        startDate: startDate
          ? startDate.toISOString().split('T')[0]
          : undefined,
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      };

      await tasksService.create(payload);
      toast.success(`Task "${data.title}" created`);
      reset();
      setStartDate(null);
      setEndDate(null);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h1 className="mb-2 text-xl font-bold text-gray-900">Add New Task</h1>
        <p className="mb-8 text-sm text-gray-500">
          Fill in task details and assign to project or user.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 text-gray-800"
        >
          {/* Title + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Title<span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Build API endpoints"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Status<span className="text-red-500">*</span>
              </label>
              <Select
                defaultValue="To do"
                onValueChange={(val) =>
                  setValue(
                    'status',
                    val as 'QA' | 'In progress' | 'Done' | 'Blocked' | 'To do'
                  )
                }
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="To do">To do</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Project<span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(val) => {
                  const selectedProject = projects.find(
                    (p) => p.id === Number(val)
                  );
                  setValue('projectId', Number(val));

                  if (selectedProject) {
                    const project = fullProjects.find(
                      (fp) => fp.id === selectedProject.id
                    );
                    if (project?.clientId) {
                      setValue('clientId', project.clientId);
                      toast.success(
                        `Client automatically set to ${project.client?.name}`
                      );
                    } else {
                      setValue('clientId', undefined);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-red-500">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            {user && (user.role === 'ADMIN' || user.role === 'SA') ? (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Client
                </label>
                <Select
                  value={
                    watch('clientId') ? String(watch('clientId')) : undefined
                  }
                  onValueChange={(val) => setValue('clientId', Number(val))}
                  disabled={!clients.length}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Client
                </label>
                <input
                  type="text"
                  readOnly
                  value={
                    fullProjects.find((p) => p.id === watch('projectId'))
                      ?.client?.name || ''
                  }
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                  placeholder="Auto-selected from project"
                />
              </div>
            )}
          </div>

          {/* Assignee + Dates on left, Estimated Hours + Time Spent on right */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left side: Assignee and Dates */}
            <div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Assignee
                </label>
                <Select
                  onValueChange={(val) => setValue('assigneeId', Number(val))}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-lime-500 focus:ring-lime-500">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date and End Date side by side */}
              <div className="mt-4 grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <DateInput
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <DateInput
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Estimated Hours and Time Spent */}
            <div>
              <div className="mt-[2px] grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Estimated Hours
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 40"
                    {...register('estimatedHours')}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Time Spent
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    {...register('timeSpentHours')}
                    onChange={(e) => {
                      const spent = parseFloat(e.target.value) || 0;
                      const estimated =
                        parseFloat(String(watch('estimatedHours') ?? 0)) || 0;
                      const percent =
                        estimated > 0
                          ? Math.min(Math.round((spent / estimated) * 100), 100)
                          : 0;
                      setValue('timeSpentHours', spent);
                      setValue('progress', percent);
                    }}
                  />
                </div>
              </div>

              {/* Progress indicator */}
              {(watch('progress') ?? 0) > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Progress:{' '}
                  <span className="font-semibold text-lime-600">
                    {watch('progress')}%
                  </span>
                </div>
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
              {isSubmitting ? 'Saving...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
