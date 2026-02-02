'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

import AuthGuard from '@/components/features/AuthGuard';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageState } from '@/components/ui/PageState';
import { tasksService, type Task } from '@/services/tasksService';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';

import AddTaskModal from '@/components/features/AddTaskModal';
import EditTaskModal from '@/components/features/EditTaskModal';
import TasksFilterBar from '@/components/features/TasksFilterBar';
import { useAuth } from '@/context/AuthContext';
import BoardTasksView from '@/components/features/BoardTasksView';

export default function TasksPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filtered, setFiltered] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    project: '',
    client: '',
    assignee: '',
    timeRange: '',
  });

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.getAll();
      setTasks(data);
      setFiltered(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? mapApiError(err.message)
          : MESSAGES.common.unknownError;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void loadTasks(), []);

  useEffect(() => {
    const q = search.toLowerCase();
    const filteredData = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.project?.name?.toLowerCase().includes(q) ||
        t.client?.name?.toLowerCase().includes(q) ||
        t.assignee?.email?.toLowerCase().includes(q)
    );
    setFiltered(filteredData);
  }, [search, tasks]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoveTask = async (taskId: number, newStatus: string) => {
    try {
      await tasksService.update(taskId, { status: newStatus });

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      toast.success(`Task moved to ${newStatus}`);
    } catch {
      toast.error('Failed to move task');
    }
  };

  useEffect(() => {
    let filteredData = [...tasks];

    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter(
        (t) => t.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.project && filters.project !== 'all') {
      filteredData = filteredData.filter(
        (t) => t.project?.name === filters.project
      );
    }

    if (filters.client && filters.client !== 'all') {
      filteredData = filteredData.filter(
        (t) => t.client?.name === filters.client
      );
    }

    if (filters.assignee && filters.assignee !== 'all') {
      filteredData = filteredData.filter(
        (t) => t.assignee?.email === filters.assignee
      );
    }

    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      const todayDay = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((todayDay + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      filteredData = filteredData.filter((t) => {
        const end = t.endDate ? new Date(t.endDate) : null;
        if (!end) return false;

        if (filters.timeRange === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDay = new Date(end);
          endDay.setHours(0, 0, 0, 0);
          return endDay.getTime() === today.getTime();
        }

        if (filters.timeRange === 'week') {
          return end >= monday && end <= sunday;
        }

        if (filters.timeRange === 'month') {
          return (
            end.getMonth() === now.getMonth() &&
            end.getFullYear() === now.getFullYear()
          );
        }

        return true;
      });
    }

    filteredData.sort((a, b) => {
      const da = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const db = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      return da - db;
    });

    setFiltered(filteredData);
  }, [filters, tasks]);

  const handleDelete = async (id: number) => {
    try {
      await tasksService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success(MESSAGES.tasks.deleteSuccess);
    } catch (err) {
      toast.error(mapApiError((err as Error).message));
    } finally {
      setOpenDialog(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['ADMIN', 'SA', 'USER']}>
      <PageState
        title="Tasks"
        loading={loading}
        error={error}
        onRetry={loadTasks}
      >
        <div className="min-h-screen space-y-8 bg-gray-50 p-6">
          {/* ---- HEADER ---- */}
          <div className="flex items-center justify-between">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-lime-600" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-700 focus:border-lime-500 focus:outline-none"
              />
            </div>

            <Button
              onClick={() => setOpenAdd(true)}
              className="rounded-xl border border-lime-500 bg-white text-lime-700 hover:bg-lime-50"
            >
              <Plus className="mr-2 h-4 w-4" /> Create task
            </Button>
          </div>

          {/* ---- FILTER BAR ---- */}
          <TasksFilterBar
            statuses={[
              { value: 'To do', label: 'To do' },
              { value: 'In progress', label: 'In progress' },
              { value: 'Blocked', label: 'Blocked' },
              { value: 'QA', label: 'QA' },
              { value: 'Done', label: 'Done' },
            ]}
            projects={[
              ...new Set(tasks.map((t) => t.project?.name).filter(Boolean)),
            ].map((p) => ({
              value: p!,
              label: p!,
            }))}
            clients={[
              ...new Set(tasks.map((t) => t.client?.name).filter(Boolean)),
            ].map((c) => ({
              value: c!,
              label: c!,
            }))}
            assignees={[
              ...new Set(tasks.map((t) => t.assignee?.email).filter(Boolean)),
            ].map((a) => ({
              value: a!,
              label: a!,
            }))}
            selected={filters}
            onChange={handleFilterChange}
            showAssignee={user?.role !== 'USER'}
          />

          {/* ACTIVE FILTER PILLS */}
          {Object.values(filters).some((v) => v && v !== 'all') && (
            <div className="ml-2 mt-2 flex flex-wrap items-center gap-2">
              {/* Status */}
              {filters.status && filters.status !== 'all' && (
                <span
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-lime-300 bg-lime-50 px-3 py-1 text-xs font-medium text-lime-700"
                  onClick={() => handleFilterChange('status', 'all')}
                >
                  Status: {filters.status}
                  <span className="text-sm font-bold text-lime-700">×</span>
                </span>
              )}

              {/* Project */}
              {filters.project && filters.project !== 'all' && (
                <span
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  onClick={() => handleFilterChange('project', 'all')}
                >
                  Project: {filters.project}
                  <span className="text-sm font-bold text-gray-700">×</span>
                </span>
              )}

              {/* Client */}
              {filters.client && filters.client !== 'all' && (
                <span
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  onClick={() => handleFilterChange('client', 'all')}
                >
                  Client: {filters.client}
                  <span className="text-sm font-bold text-gray-700">×</span>
                </span>
              )}

              {/* Assignee */}
              {user?.role !== 'USER' &&
                filters.assignee &&
                filters.assignee !== 'all' && (
                  <span
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    onClick={() => handleFilterChange('assignee', 'all')}
                  >
                    Assignee: {filters.assignee}
                    <span className="text-sm font-bold text-gray-700">×</span>
                  </span>
                )}

              {/* Time range */}
              {filters.timeRange && filters.timeRange !== 'all' && (
                <span
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  onClick={() => handleFilterChange('timeRange', 'all')}
                >
                  Time: {filters.timeRange}
                  <span className="text-sm font-bold text-gray-700">×</span>
                </span>
              )}

              {/* Clear all */}
              <span
                className="ml-2 cursor-pointer text-xs text-lime-700 hover:underline"
                onClick={() =>
                  setFilters({
                    status: 'all',
                    project: 'all',
                    client: 'all',
                    assignee: 'all',
                    timeRange: 'all',
                  })
                }
              >
                Clear all
              </span>
            </div>
          )}

          {/* ---- VIEW MODE BUTTONS ---- */}
          <div className="mb-2 flex justify-end gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-lime-100 text-lime-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('list')}
            >
              List view
            </button>

            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === 'board'
                  ? 'bg-lime-100 text-lime-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('board')}
            >
              Board view
            </button>
          </div>

          {/* ---- BOARD VIEW ---- */}
          {viewMode === 'board' ? (
            <BoardTasksView tasks={filtered} onMoveTask={handleMoveTask} />
          ) : (
            /* ---- LIST VIEW ---- */
            <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
              <table className="w-full border-collapse text-center text-sm">
                <thead className="border-b text-gray-600">
                  {user?.role === 'USER' ? (
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Task Name</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Estimated</th>
                      <th className="px-4 py-3">Time spent</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Task Name</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Start date</th>
                      <th className="px-4 py-3">End date</th>
                      <th className="px-4 py-3">Estimated</th>
                      <th className="px-4 py-3">Time spent</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  )}
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={user?.role === 'USER' ? 7 : 10}
                        className="py-6 text-center italic text-gray-500"
                      >
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-700">{t.id}</td>

                        <td className="px-4 py-3 font-medium text-gray-800">
                          {t.title}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {t.project?.name || '-'}
                        </td>

                        {/* ADMIN + SA EXTRA FIELDS */}
                        {user?.role !== 'USER' && (
                          <>
                            <td className="px-4 py-3 text-gray-600">
                              {t.client?.name ?? t.project?.client?.name ?? '-'}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {t.assignee?.email || '-'}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {t.startDate
                                ? new Date(t.startDate).toLocaleDateString()
                                : '-'}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {t.endDate
                                ? new Date(t.endDate).toLocaleDateString()
                                : '-'}
                            </td>
                          </>
                        )}

                        {/* STATUS BADGE */}
                        {user?.role === 'USER' && (
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                t.status === 'Done'
                                  ? 'bg-blue-100 text-blue-700'
                                  : t.status === 'QA'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : t.status === 'Blocked'
                                      ? 'bg-red-100 text-red-700'
                                      : t.status === 'In progress'
                                        ? 'bg-lime-100 text-lime-700'
                                        : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                        )}

                        {/* ESTIMATED */}
                        <td className="px-4 py-3 text-gray-600">
                          {t.estimatedHours ? `${t.estimatedHours} h` : '-'}
                        </td>

                        {/* TIME SPENT */}
                        <td className="px-4 py-3 text-gray-600">
                          {t.timeSpentHours ? (
                            <div className="flex flex-col">
                              <span>{t.timeSpentHours} h</span>
                              {t.progress != null && (
                                <span className="text-xs font-medium text-lime-600">
                                  {t.progress}%
                                </span>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedTask(t);
                                setOpenEdit(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-lime-100 text-lime-600 transition hover:bg-lime-200"
                              title="Edit"
                            >
                              <Edit size={16} strokeWidth={2} />
                            </button>

                            <div className="h-6 border-l border-gray-300" />

                            <button
                              onClick={() => {
                                setSelectedId(t.id);
                                setOpenDialog(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-600 transition hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ---- CONFIRM DELETE ---- */}
          <ConfirmDialog
            open={openDialog}
            title="Confirm Deletion"
            message={MESSAGES.tasks.deleteConfirm}
            onConfirm={() => selectedId && handleDelete(selectedId)}
            onClose={() => setOpenDialog(false)}
          />
        </div>
      </PageState>

      {/* ---- MODALS ---- */}
      <AddTaskModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={loadTasks}
      />

      {openEdit && selectedTask && (
        <EditTaskModal
          open={openEdit}
          task={selectedTask}
          onClose={() => {
            setOpenEdit(false);
            setSelectedTask(null);
          }}
          onSuccess={loadTasks}
        />
      )}
    </AuthGuard>
  );
}
