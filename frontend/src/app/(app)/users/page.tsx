'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/features/AuthGuard';
import { PageState } from '@/components/ui/PageState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import ForbiddenPage from '@/app/403/page';
import UserStats from '@/components/features/UserStats';
import { usersService, type User } from '@/services/usersService';
import { getRole } from '@/utils/auth';
import { mapApiError } from '@/constants/apiMessages';
import { MESSAGES } from '@/constants/uiMessages';
import { getDisplayName } from '@/utils/userDisplay';
import { projectsService } from '@/services/projectsService';
import AddUserModal from '@/components/features/AddUserModal';
import EditUserModal from '@/components/features/EditUserModal';
import { logger } from '@/utils/logger';

interface ProjectWithTasks {
  id: number;
  name: string;
  tasks?: { id: number }[];
}

export default function UsersPage() {
  const role = getRole();

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (role === 'USER') {
    return <ForbiddenPage />;
  }

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsService.getAll();
        setProjects(data);
      } catch (err) {
        logger.error('Failed to load projects', err);
      }
    };
    void loadProjects();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll();
      setUsers(data);
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
    void loadUsers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const filteredList = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
    setFiltered(filteredList);
  }, [search, users]);

  const total = users.length;
  const active = users.filter((u) => u.status === 'Active').length;
  const inactive = total - active;
  const totalTasks = projects.reduce(
    (acc, p) => acc + (p.tasks?.length || 0),
    0
  );

  const handleFilterByStatus = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    if (status === 'ALL') {
      setFiltered(users);
    } else {
      const wanted = status === 'ACTIVE' ? 'Active' : 'Inactive';
      setFiltered(
        users.filter(
          (u) => u.status?.toLowerCase().trim() === wanted.toLowerCase()
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usersService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(MESSAGES.users.deleteSuccess || 'User deleted');
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
    <AuthGuard allowedRoles={['ADMIN', 'SA']}>
      <PageState
        title="Users"
        loading={loading}
        error={error}
        onRetry={loadUsers}
      >
        <div className="min-h-screen space-y-8 bg-gray-50 p-6">
          {/* ===== Header ===== */}
          <div className="flex items-center justify-between">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-lime-600" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-700 focus:border-lime-500 focus:outline-none"
              />
            </div>

            {role === 'SA' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl border border-lime-500 bg-white px-4 py-2 text-lime-700 transition hover:bg-lime-50"
              >
                <Plus className="h-4 w-4" /> New user
              </button>
            )}
          </div>

          {/* ===== Stats (SA only) ===== */}
          {role === 'SA' && (
            <UserStats
              stats={{
                total,
                active,
                inactive,
                totalTasks,
              }}
              onFilter={handleFilterByStatus}
            />
          )}

          {/* ===== Table ===== */}
          <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
            <table className="w-full border-collapse text-center text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Join date</th>
                  <th className="px-4 py-3">Status</th>
                  {role === 'SA' && (
                    <th className="px-4 py-3 text-center">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center italic text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {getDisplayName(u)}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {u.role === 'SA' ? 'Super Admin' : u.role}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            u.status?.toLowerCase() === 'active'
                              ? 'bg-lime-100 text-lime-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {u.status || 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        {role === 'SA' && (
                          <div className="flex items-center justify-center gap-3">
                            {/* Edit button */}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowEditModal(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-lime-100 text-lime-600 transition hover:bg-lime-200"
                              title="Edit"
                            >
                              <Edit size={16} strokeWidth={2} />
                            </button>

                            <div className="h-6 border-l border-gray-300" />

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                setSelectedId(u.id);
                                setOpenDialog(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-600 transition hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== Confirm Dialog ===== */}
          <ConfirmDialog
            open={openDialog}
            title="Confirm Deletion"
            message={
              MESSAGES.users?.deleteConfirm ||
              'Are you sure you want to delete this user?'
            }
            onConfirm={() => selectedId && handleDelete(selectedId)}
            onClose={() => setOpenDialog(false)}
          />
        </div>
      </PageState>

      {/* ===== Modals ===== */}
      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadUsers}
      />

      <EditUserModal
        open={showEditModal}
        user={selectedUser}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadUsers}
      />
    </AuthGuard>
  );
}
