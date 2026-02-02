'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

import AuthGuard from '@/components/features/AuthGuard';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageState } from '@/components/ui/PageState';
import { projectsService, type Project } from '@/services/projectsService';
import { MESSAGES } from '@/constants/uiMessages';
import { mapApiError } from '@/constants/apiMessages';
import { getRole } from '@/utils/auth';
import ProjectStats from '@/components/features/ProjectStats';
import AddProjectModal from '@/components/features/AddProjectModal';
import EditProjectModal from '@/components/features/EditProjectModal';

export default function ProjectsPage() {
  const role = getRole();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isReadOnly = role === 'USER';

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsService.getAll();
      setProjects(data);
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

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectsService.getAll();
        if (!isMounted) return;
        setProjects(data);
        setFiltered(data);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? mapApiError(err.message)
            : MESSAGES.common.unknownError;
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const filteredData = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        p.client?.email?.toLowerCase().includes(q)
    );
    setFiltered(filteredData);
  }, [search, projects]);

  const total = projects.length;
  const active = projects.filter((p) => p.status === 'Active').length;
  const inactive = total - active;
  const totalTasks = projects.reduce(
    (acc, p) => acc + (p.tasks?.length || 0),
    0
  );

  const handleFilterByStatus = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    if (status === 'ALL') {
      setFiltered(projects);
    } else {
      setFiltered(
        projects.filter(
          (p) => p.status === (status === 'ACTIVE' ? 'Active' : 'Inactive')
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await projectsService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(MESSAGES.projects.deleteSuccess);
    } catch (err) {
      const message =
        err instanceof Error
          ? mapApiError(err.message)
          : MESSAGES.common.unknownError;
      toast.error(message);
    } finally {
      setOpenDialog(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['USER', 'ADMIN', 'SA']}>
      <PageState
        title="Projects"
        loading={loading}
        error={error}
        onRetry={loadProjects}
      >
        <div className="min-h-screen space-y-8 bg-gray-50 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-lime-600" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-700 focus:border-lime-500 focus:outline-none"
              />
            </div>

            {!isReadOnly && (
              <Button
                onClick={() => setIsAddOpen(true)}
                className="rounded-xl border border-lime-500 bg-white text-lime-700 hover:bg-lime-50"
              >
                <Plus className="mr-2 h-4 w-4" /> New project
              </Button>
            )}
          </div>

          {/* ===== ROLE-BASED METRICS ===== */}
          {role === 'SA' && (
            <ProjectStats
              stats={{
                total,
                active,
                inactive,
                totalTasks,
              }}
              onFilter={handleFilterByStatus}
            />
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
            <table className="w-full border-collapse text-center text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  {!isReadOnly && (
                    <th className="px-4 py-3 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center italic text-gray-500"
                    >
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.country || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.client?.email || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            p.status === 'Active'
                              ? 'bg-lime-100 text-lime-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      {!isReadOnly && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {/* Edit */}
                            <button
                              onClick={() => {
                                setSelectedProject(p);
                                setIsEditOpen(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-lime-100 text-lime-600 transition hover:bg-lime-200"
                              title="Edit"
                            >
                              <Edit size={16} strokeWidth={2} />
                            </button>

                            <div className="h-6 border-l border-gray-300" />

                            {/* Delete */}
                            <button
                              onClick={() => {
                                setSelectedId(p.id);
                                setOpenDialog(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-600 transition hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Confirm Dialog */}
          <ConfirmDialog
            open={openDialog}
            title="Confirm Deletion"
            message={MESSAGES.projects.deleteConfirm}
            onConfirm={() => selectedId && handleDelete(selectedId)}
            onClose={() => setOpenDialog(false)}
          />
        </div>
      </PageState>

      {/* Add Project Modal */}
      <AddProjectModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadProjects}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        open={isEditOpen}
        project={selectedProject}
        onClose={() => setIsEditOpen(false)}
        onSuccess={loadProjects}
      />
    </AuthGuard>
  );
}
