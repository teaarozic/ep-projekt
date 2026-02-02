'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/features/AuthGuard';
import { PageState } from '@/components/ui/PageState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import ForbiddenPage from '@/app/403/page';
import ClientsStats from '@/components/features/ClientsStats';
import { clientsService, type Client } from '@/services/clientsService';
import { getRole } from '@/utils/auth';
import { mapApiError } from '@/constants/apiMessages';
import { MESSAGES } from '@/constants/uiMessages';
import AddClientModal from '@/components/features/AddClientModal';
import EditClientModal from '@/components/features/EditClientModal';

export default function ClientsPage() {
  const role = getRole();

  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalProjects: 0,
  });

  if (role === 'USER') {
    return <ForbiddenPage />;
  }

  const canManage = role === 'SA' || role === 'ADMIN';

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getAll();
      setClients(data);
      setFiltered(data);
      updateStats(data);
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
    void loadClients();
  }, []);

  useEffect(() => {
    const handleRefreshClients = async () => {
      await loadClients();
    };

    window.addEventListener('projectsUpdated', handleRefreshClients);

    return () => {
      window.removeEventListener('projectsUpdated', handleRefreshClients);
    };
  }, []);

  function updateStats(list: Client[]) {
    const total = list.length;
    const active = list.filter((c) => c.status === 'Active').length;
    const inactive = list.filter((c) => c.status === 'Inactive').length;

    const totalProjects = list.reduce((acc, c) => {
      return acc + (c.projects?.length || 0);
    }, 0);

    setStats({ total, active, inactive, totalProjects });
  }

  useEffect(() => {
    const q = search.toLowerCase();
    const filteredList = clients.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
    setFiltered(filteredList);
  }, [search, clients]);

  const handleFilterByStatus = (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    if (status === 'ALL') {
      setFiltered(clients);
    } else {
      const wanted = status === 'ACTIVE' ? 'Active' : 'Inactive';
      setFiltered(clients.filter((c) => c.status === wanted));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await clientsService.remove(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success(MESSAGES.clients.deleteSuccess);
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
        title="Clients"
        loading={loading}
        error={error}
        onRetry={loadClients}
      >
        <div className="min-h-screen space-y-8 bg-gray-50 p-6">
          {/* ===== Header ===== */}
          <div className="flex items-center justify-between">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-lime-600" />
              <input
                type="text"
                placeholder="Search clients..."
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
                <Plus className="h-4 w-4" /> New client
              </button>
            )}
          </div>

          {/* ===== Stats samo za SA ===== */}
          {role === 'SA' && (
            <ClientsStats stats={stats} onFilter={handleFilterByStatus} />
          )}

          {/* ===== Table ===== */}
          <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
            <table className="w-full border-collapse text-center text-sm">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Contact</th>
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
                      colSpan={canManage ? 6 : 5}
                      className="py-6 text-center italic text-gray-500"
                    >
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{client.id}</td>
                      <td
                        className="max-w-[250px] truncate px-4 py-3 font-medium text-gray-800"
                        title={client.name}
                      >
                        {client.name.length > 50
                          ? `${client.name.slice(0, 50)}…`
                          : client.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {client.company || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {client.email || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            client.status === 'Active'
                              ? 'bg-lime-100 text-lime-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {role === 'SA' && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setShowEditModal(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-md bg-lime-100 text-lime-600 transition hover:bg-lime-200"
                              title="Edit"
                            >
                              <Edit size={16} strokeWidth={2} />
                            </button>

                            <div className="h-6 border-l border-gray-300" />

                            <button
                              onClick={() => {
                                setSelectedId(client.id);
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

          {/* ===== Confirm Delete Modal ===== */}
          <ConfirmDialog
            open={openDialog}
            title="Confirm Deletion"
            message={MESSAGES.clients.deleteConfirm}
            onConfirm={() => selectedId && handleDelete(selectedId)}
            onClose={() => setOpenDialog(false)}
          />
          <AddClientModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={loadClients}
          />
          <EditClientModal
            open={showEditModal}
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onSuccess={loadClients}
          />
        </div>
      </PageState>
    </AuthGuard>
  );
}
