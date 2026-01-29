'use client';

import React, { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const ENTITY_TYPES = [
  'user', 'product', 'order', 'category', 'coupon',
  'settings', 'role', 'page', 'banner', 'menu',
];

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '30');
      if (entity) params.set('entity', entity);
      if (action) params.set('action', action);

      const { data } = await apiClient.get(`/admin/audit-logs?${params}`);
      const result = data.data ?? data;
      setLogs(result.logs ?? result ?? []);
      setPagination(result.pagination ?? null);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entity]);

  const actionBadge = (act: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
    };
    const key = Object.keys(colors).find((k) => act.toLowerCase().includes(k));
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[key ?? ''] ?? 'bg-gray-100 text-gray-700'}`}>
        {act}
      </span>
    );
  };

  const formatJson = (json: string | null) => {
    if (!json) return null;
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500">
          Track all administrative actions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={entity}
          onChange={(e) => { setEntity(e.target.value); setPage(1); }}
          className="rounded-md border-gray-300 text-sm shadow-sm"
        >
          <option value="">All Entities</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
          placeholder="Filter by action..."
          className="w-48 rounded-md border-gray-300 text-sm shadow-sm"
        />
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Entity ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {actionBadge(log.action)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {log.entity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-400">
                      {log.entityId ? log.entityId.slice(0, 8) + '...' : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                  {expandedId === log.id && (log.oldValues || log.newValues) && (
                    <tr key={`${log.id}-detail`}>
                      <td colSpan={6} className="bg-gray-50 px-4 py-3">
                        <div className="grid grid-cols-2 gap-4">
                          {log.oldValues && (
                            <div>
                              <h4 className="mb-1 text-xs font-medium text-gray-500">
                                Previous Values
                              </h4>
                              <pre className="max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                                {formatJson(log.oldValues)}
                              </pre>
                            </div>
                          )}
                          {log.newValues && (
                            <div>
                              <h4 className="mb-1 text-xs font-medium text-gray-500">
                                New Values
                              </h4>
                              <pre className="max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                                {formatJson(log.newValues)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
