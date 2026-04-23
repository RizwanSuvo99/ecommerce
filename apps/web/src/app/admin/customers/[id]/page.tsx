'use client';

import { ArrowLeft, Mail, Phone, ShieldCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/components/admin/ui/confirm-dialog';
import { apiClient } from '@/lib/api/client';

/**
 * Admin detail view for a single customer. Backfills the gap the audit
 * called out: the customers list has no drill-through today. Reads
 * GET /admin/users/:id; flips active status via PATCH
 * /admin/users/:id/toggle-active; deletes via DELETE /admin/users/:id.
 *
 * Order history and lifetime spend show when /admin/users/:id returns
 * them nested; otherwise the page still renders the profile cleanly.
 */

interface AdminUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  status: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  orders?: Array<{
    id: string;
    orderNumber: string;
    totalAmount: string | number;
    status: string;
    createdAt: string;
  }>;
  _count?: {
    orders?: number;
  };
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirm();

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      const res = await apiClient.get<{ data?: AdminUser } | AdminUser>(`/admin/users/${id}`);
      const payload = (res.data as { data?: AdminUser }).data ?? (res.data as AdminUser);
      setUser(payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load customer:', err);
      toast.error('Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    try {
      await apiClient.patch(`/admin/users/${user.id}/toggle-active`);
      toast.success(user.status === 'ACTIVE' ? 'Customer deactivated' : 'Customer activated');
      await load();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Toggle active failed:', err);
      toast.error('Action failed');
    } finally {
      setBusy(false);
    }
  };

  const deleteCustomer = async () => {
    if (!user) {
      return;
    }
    const ok = await confirm({
      title: 'Delete this customer?',
      description: `${user.email} will be removed permanently along with their saved addresses. Their orders stay in the system with the email kept for reference.`,
      confirmLabel: 'Delete customer',
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      await apiClient.delete(`/admin/users/${user.id}`);
      toast.success('Customer deleted');
      router.push('/admin/customers');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete failed:', err);
      toast.error('Delete failed');
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
        <p className="mt-4 text-gray-600">Customer not found.</p>
      </div>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed customer';

  return (
    <div className="p-6">
      {dialog}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to customers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {user.email}
              {user.emailVerified && (
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-label="Verified" />
              )}
            </span>
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {user.phone}
              </span>
            )}
            <span>
              Role: <span className="font-medium text-gray-700">{user.role}</span>
            </span>
            <span>
              Status:{' '}
              <span
                className={`font-medium ${
                  user.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {user.status}
              </span>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleActive}
            disabled={busy}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            onClick={deleteCustomer}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <UserX className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="First name" value={user.firstName ?? '—'} />
            <Row label="Last name" value={user.lastName ?? '—'} />
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone ?? '—'} />
            <Row
              label="Registered"
              value={new Date(user.createdAt).toLocaleString('en-BD', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
            <Row
              label="Last login"
              value={
                user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('en-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'
              }
            />
          </dl>
        </section>

        {/* Stats */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row
              label="Total orders"
              value={String(user._count?.orders ?? user.orders?.length ?? 0)}
            />
            <Row label="Lifetime spend" value={formatSpend(user.orders)} />
          </dl>
        </section>

        {/* Recent orders */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent orders</h2>
          {!user.orders || user.orders.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Placed</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.orders.slice(0, 10).map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 text-gray-700">
                      <Link href={`/admin/orders/${o.id}`} className="text-primary hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-700">{o.status}</td>
                    <td className="py-2 text-gray-600">
                      {new Date(o.createdAt).toLocaleDateString('en-BD')}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      ৳{Number(o.totalAmount).toLocaleString('en-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function formatSpend(orders?: AdminUser['orders']): string {
  if (!orders || orders.length === 0) {
    return '৳0';
  }
  const total = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  return `৳${total.toLocaleString('en-BD')}`;
}
