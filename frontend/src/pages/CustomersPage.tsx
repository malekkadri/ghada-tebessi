import React, { useEffect, useMemo, useRef, useState } from 'react';
import { crmService, Customer, Tag } from '../services/crmService';
import { vcardService } from '../services/api';
import { VCard } from '../services/vcard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** ---------- Small Utils ---------- */
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** ---------- UI Building Blocks (no external deps) ---------- */
const Backdrop: React.FC<{ show: boolean; onClick?: () => void }> = ({ show, onClick }) => (
  <div
    aria-hidden="true"
    onClick={onClick}
    className={classNames(
      'fixed inset-0 z-40 bg-black/50 transition-opacity',
      show ? 'opacity-100' : 'pointer-events-none opacity-0'
    )}
  />
);

const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}> = ({ open, title, onClose, children, footer, maxWidth = 'max-w-xl' }) => {
  return (
    <>
      <Backdrop show={open} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={classNames(
          'fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto',
          open ? '' : 'pointer-events-none'
        )}
      >
        <div
          className={classNames(
            'w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10',
            'transition-all duration-300',
            open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-2',
            maxWidth
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600 dark:text-gray-300">
                <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59L7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer && <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">{footer}</div>}
        </div>
      </div>
    </>
  );
};

const Pill: React.FC<{ tone?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple'; children: React.ReactNode }> = ({
  tone = 'gray',
  children
}) => {
  const tones: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
  };
  return <span className={classNames('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', tones[tone])}>{children}</span>;
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={classNames('animate-spin h-5 w-5 text-gray-500', className)} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
  </svg>
);

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4">
      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-52 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="px-4 py-4">
      <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
  </tr>
);

/** ---------- Main Page ---------- */
const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', notes: '', vcardId: '' });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: 'active', notes: '', vcardId: '' });
  const [editFormTags, setEditFormTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [vcards, setVcards] = useState<VCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [tagFilterOpen, setTagFilterOpen] = useState(false);

  const statuses = ['active', 'inactive', 'prospect', 'lost'] as const;

  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const { user } = useAuth();

  const debouncedSearch = useDebounce(search, 350);

  /** Load tags once */
  useEffect(() => {
    let mounted = true;
    crmService
      .getTags()
      .then((data) => mounted && setTags(data))
      .catch((err) => console.error('Failed to load tags', err));
    return () => {
      mounted = false;
    };
  }, []);

  /** Load vcards when user available */
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    vcardService
      .getAll(String(user.id))
      .then((data: VCard[]) => mounted && setVcards(data))
      .catch((err: any) => console.error('Failed to load vcards', err));
    return () => {
      mounted = false;
    };
  }, [user]);

  /** Load customers on filters change */
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomers({
        search: debouncedSearch,
        sortBy,
        order,
        tags: filterTags
      });
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to load customers', err);
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortBy, order, filterTags.join('|')]);

  /** Handlers */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const handleFormTagsToggle = (id: string) => {
    setFormTags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleEditTagsToggle = (id: string) => {
    setEditFormTags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleFilterTagsToggle = (id: string) => {
    setFilterTags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    setBusy(true);
    try {
      const created = await crmService.createTag({ name });
      setTags((t) => [...t, created]);
      setNewTag('');
    } catch (error) {
      console.error('Failed to create tag', error);
    } finally {
      setBusy(false);
    }
  };

  const resetCreateForm = () => {
    setForm({ name: '', email: '', phone: '', status: 'active', notes: '', vcardId: '' });
    setFormTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const newCustomer = await crmService.createCustomer(form);
      for (const tagId of formTags) {
        await crmService.assignTagToCustomer(newCustomer.id, tagId);
      }
      await fetchCustomers();
      resetCreateForm();
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create customer', error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await crmService.deleteCustomer(id);
      setCustomers((cs) => cs.filter((c) => c.id !== id));
      setShowDelete({ open: false });
    } catch (error) {
      console.error('Failed to delete customer', error);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      status: (customer.status as any) || 'active',
      notes: customer.notes || '',
      vcardId: customer.vcardId ? String(customer.vcardId) : ''
    });
    setEditFormTags(customer.Tags?.map((t) => t.id.toString()) || []);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setBusy(true);
    try {
      await crmService.updateCustomer(editingCustomer.id, editForm);
      const prev = editingCustomer.Tags?.map((t) => t.id.toString()) || [];
      const toAdd = editFormTags.filter((id) => !prev.includes(id));
      const toRemove = prev.filter((id) => !editFormTags.includes(id));
      for (const id of toAdd) await crmService.assignTagToCustomer(editingCustomer.id, id);
      for (const id of toRemove) await crmService.unassignTagFromCustomer(editingCustomer.id, id);
      await fetchCustomers();
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to update customer', error);
    } finally {
      setBusy(false);
    }
  };

  /** Derived helpers */
  const statusTone = (s?: string) =>
    s === 'active'
      ? 'green'
      : s === 'prospect'
      ? 'blue'
      : s === 'lost'
      ? 'red'
      : s === 'inactive'
      ? 'yellow'
      : 'gray';

  const toolbarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-5 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your contacts, tags, and quick actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2.5 text-sm font-semibold shadow-sm hover:brightness-110 active:translate-y-px transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M13 11V6a1 1 0 0 0-2 0v5H6a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2z"/></svg>
            New Customer
          </button>
        </div>
      </div>

      {/* Sticky Toolbar */}
      <div
        ref={toolbarRef}
        className="sticky top-0 z-10 -mx-4 rounded-none sm:mx-0 sm:rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-3 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone…"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition"
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" />
              </svg>
            </div>

            {/* Tag filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setTagFilterOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                aria-haspopup="true"
                aria-expanded={tagFilterOpen}
                aria-controls="tag-filter-panel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v2H3zm4 6h10v2H7zm3 6h4v2h-4z"/></svg>
                Tags
                {filterTags.length > 0 && <Pill tone="purple">{filterTags.length}</Pill>}
              </button>
              <div
                id="tag-filter-panel"
                className={classNames(
                  'absolute left-0 mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-3 transition-all origin-top',
                  tagFilterOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
                )}
              >
                <div className="max-h-60 overflow-auto pr-1">
                  {tags.length === 0 && <p className="text-sm text-gray-500">No tags yet.</p>}
                  {tags.map((t) => (
                    <label key={t.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-gray-900 dark:accent-gray-100"
                        checked={filterTags.includes(String(t.id))}
                        onChange={() => handleFilterTagsToggle(String(t.id))}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{t.name}</span>
                    </label>
                  ))}
                </div>
                {filterTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {filterTags.map((id) => {
                      const tag = tags.find((t) => String(t.id) === id);
                      if (!tag) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => handleFilterTagsToggle(id)}
                          className="group inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-200"
                        >
                          {tag.name}
                          <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">×</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200"
              title="Sort by"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="created_at">Created</option>
            </select>
            <button
              onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Toggle order"
            >
              {order === 'asc' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 14l5-5l5 5z"/></svg> Asc
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m7 10l5 5l5-5z"/></svg> Desc
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Customers Table / List */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Tags</Th>
              <Th>VCard</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900/40 divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : customers.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="36" height="36" viewBox="0 0 24 24" className="text-gray-400">
                        <path fill="currentColor" d="M12 2a7 7 0 0 0 0 14a7 7 0 0 0 0-14m0 16c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-300">No customers found.</p>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2.5 text-sm font-semibold hover:brightness-110 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13 11V6a1 1 0 1 0-2 0v5H6a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 0 0 0-2z"/></svg>
                        Add your first customer
                      </button>
                    </div>
                  </td>
                </tr>
                )
              : customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                        {customer.notes && (
                          <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">{customer.notes}</div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="text-gray-600 dark:text-gray-300">{customer.email}</Td>
                  <Td className="text-gray-600 dark:text-gray-300">{customer.phone}</Td>
                  <Td>
                    <Pill tone={statusTone(customer.status)}>{customer.status ? customer.status[0].toUpperCase() + customer.status.slice(1) : '—'}</Pill>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {customer.Tags?.length
                        ? customer.Tags.map((t) => <Pill key={t.id}>{t.name}</Pill>)
                        : <span className="text-sm text-gray-400">—</span>}
                    </div>
                  </Td>
                  <Td>{customer.Vcard?.name ? <Pill tone="purple">{customer.Vcard?.name}</Pill> : <span className="text-sm text-gray-400">—</span>}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButton
                        tone="blue"
                        onClick={() => navigate(`${basePath}/crm/interactions/${customer.id}?type=customer`)}
                        label="Interactions"
                        iconPath="M3 12h7v7H3zm11 0h7v7h-7zM3 3h7v7H3zm11 0h7v7h-7z"
                      />
                      <ActionButton
                        tone="purple"
                        onClick={() => navigate(`${basePath}/crm/tasks/${customer.id}?type=customer`)}
                        label="Tasks"
                        iconPath="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
                      />
                      <ActionButton
                        tone="green"
                        onClick={() => handleEdit(customer)}
                        label="Edit"
                        iconPath="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
                      />
                      <ActionButton
                        tone="red"
                        onClick={() => setShowDelete({ open: true, id: String(customer.id), name: customer.name })}
                        label="Delete"
                        iconPath="M6 7h12v13H6zM9 4h6v3H9z"
                      />
                    </div>
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => (busy ? null : setShowCreate(false))}
        title="Add Customer"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              form="create-customer-form"
              type="submit"
              disabled={busy || !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Create
            </button>
          </div>
        }
      >
        <form id="create-customer-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={Array.from(statuses).map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s }))}
            />
            <Select
              label="VCard"
              name="vcardId"
              value={form.vcardId}
              onChange={handleChange}
              options={[{ label: 'No VCard', value: '' }, ...vcards.map((v) => ({ label: v.name, value: String(v.id) }))]}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-2 max-h-44 overflow-auto grid grid-cols-2 gap-1">
              {tags.length === 0 && <p className="text-sm text-gray-500 px-2 py-1.5">No tags yet.</p>}
              {tags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gray-900 dark:accent-gray-100"
                    checked={formTags.includes(String(t.id))}
                    onChange={() => handleFormTagsToggle(String(t.id))}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t.name}</span>
                </label>
              ))}
            </div>
            {/* quick tag creator */}
            <div className="mt-2 flex items-center gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Create new tag"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={busy || !newTag.trim()}
                className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Add Tag
              </button>
            </div>
          </div>
          <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingCustomer}
        onClose={() => (busy ? null : setEditingCustomer(null))}
        title={`Edit: ${editingCustomer?.name ?? ''}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditingCustomer(null)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              form="edit-customer-form"
              type="submit"
              disabled={busy || !editForm.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="edit-customer-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Name" name="name" value={editForm.name} onChange={handleEditChange} required />
            <Input label="Email" name="email" value={editForm.email} onChange={handleEditChange} type="email" />
            <Input label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
            <Select
              label="Status"
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              options={Array.from(statuses).map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s }))}
            />
            <Select
              label="VCard"
              name="vcardId"
              value={editForm.vcardId}
              onChange={handleEditChange}
              options={[{ label: 'No VCard', value: '' }, ...vcards.map((v) => ({ label: v.name, value: String(v.id) }))]}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-2 max-h-44 overflow-auto grid grid-cols-2 gap-1">
              {tags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-green-600"
                    checked={editFormTags.includes(String(t.id))}
                    onChange={() => handleEditTagsToggle(String(t.id))}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Textarea label="Notes" name="notes" value={editForm.notes} onChange={handleEditChange} />
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={showDelete.open}
        onClose={() => (busy ? null : setShowDelete({ open: false }))}
        title="Delete customer?"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              disabled={busy}
              onClick={() => setShowDelete({ open: false })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => showDelete.id && handleDelete(showDelete.id)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This action cannot be undone. You’re about to delete{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{showDelete.name ?? 'this customer'}</span>.
        </p>
      </Modal>
    </div>
  );
};

/** ---------- Table helpers ---------- */
const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th
    scope="col"
    className={classNames(
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300',
      className
    )}
  >
    {children}
  </th>
);
const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={classNames('px-4 py-4 align-middle text-sm', className)}>{children}</td>
);

/** ---------- Form controls ---------- */
const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
    {children}
  </label>
);

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, id, className, ...props }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <input
        id={inputId}
        {...props}
        className={classNames(
          'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
          'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition',
          className
        )}
      />
    </div>
  );
};

const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }
> = ({ label, id, className, ...props }) => {
  const inputId = id || `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <textarea
        id={inputId}
        rows={4}
        {...props}
        className={classNames(
          'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
          'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition',
          className
        )}
      />
    </div>
  );
};

const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { label: string; value: string }[] }
> = ({ label, id, className, options, ...props }) => {
  const inputId = id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <select
        id={inputId}
        {...props}
        className={classNames(
          'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
          'text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition',
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ActionButton: React.FC<{
  tone: 'blue' | 'purple' | 'green' | 'red';
  label: string;
  iconPath: string;
  onClick: () => void;
}> = ({ tone, label, iconPath, onClick }) => {
  const tones: Record<string, string> = {
    blue: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    purple: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    green: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    red: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
  };
  return (
    <button
      onClick={onClick}
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition',
        tones[tone]
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d={iconPath} /></svg>
      {label}
    </button>
  );
};

export default CustomersPage;
