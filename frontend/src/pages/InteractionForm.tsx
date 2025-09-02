import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import InteractionForm from '../components/InteractionForm';
import { crmService, Interaction } from '../services/crmService';

/* ---------- Small utils ---------- */
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
function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  try {
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return d.toString();
  }
}
function relativeTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((d - now) / 1000); // seconds
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1]
  ];
  for (const [unit, sec] of units) {
    if (abs >= sec || unit === 'second') {
      return rtf.format(Math.round(diff / sec), unit);
    }
  }
  return '';
}

/* ---------- Simple UI blocks (no extra deps) ---------- */
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
}> = ({ open, title, onClose, children, footer, maxWidth = 'max-w-lg' }) => {
  return (
    <>
      <Backdrop show={open} onClick={onClose} />
      <div className={classNames('fixed inset-0 z-50 grid place-items-center p-4', open ? '' : 'pointer-events-none')}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
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

const Pill: React.FC<{ tone?: 'gray' | 'blue' | 'green' | 'yellow' | 'purple' | 'red'; children: React.ReactNode }> = ({
  tone = 'gray',
  children
}) => {
  const tones: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };
  return <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-xs', tones[tone])}>{children}</span>;
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={classNames('animate-spin h-5 w-5 text-gray-500', className)} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
  </svg>
);

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" /></td>
  </tr>
);

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={classNames('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300', className)}>
    {children}
  </th>
);
const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={classNames('px-4 py-4 align-middle text-sm', className)}>{children}</td>
);

const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
    {children}
  </label>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, id, className, ...props }) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
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
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, id, className, ...props }) => {
  const inputId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
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

/* ---------- Page ---------- */
const InteractionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const entityType = (searchParams.get('type') === 'lead' ? 'leads' : 'customers') as 'customers' | 'leads';

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edit modal
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [editForm, setEditForm] = useState({ type: '', date: '', notes: '' });
  const [editFile, setEditFile] = useState<File | null>(null);

  // filters / sort / view
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'timeline'>('table');

  const [toDelete, setToDelete] = useState<{ open: boolean; id?: string }>({ open: false });

  const debouncedSearch = useDebounce(search, 300);

  const loadInteractions = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getInteractions(entityType, id);
      setInteractions(data);
    } catch (err) {
      console.error('Failed to load interactions', err);
      setError('Failed to load interactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, entityType]);

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setEditForm({
      type: interaction.type || '',
      date: interaction.date || '',
      notes: interaction.notes || ''
    });
    setEditFile(null);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFile(e.target.files?.[0] || null);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInteraction) return;
    setBusy(true);
    try {
      const updated = await crmService.updateInteraction(editingInteraction.id, { ...editForm, file: editFile || undefined });
      setInteractions((arr) => arr.map((i) => (i.id === editingInteraction.id ? updated : i)));
      setEditingInteraction(null);
      setEditFile(null);
    } catch (error) {
      console.error('Failed to update interaction', error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (interactionId: string) => {
    setBusy(true);
    try {
      await crmService.deleteInteraction(interactionId);
      setInteractions((arr) => arr.filter((i) => i.id !== interactionId));
      setToDelete({ open: false });
    } catch (error) {
      console.error('Failed to delete interaction', error);
    } finally {
      setBusy(false);
    }
  };

  if (!id) return <div className="py-6 text-sm text-gray-600 dark:text-gray-300">No target selected.</div>;

  // derive list of types for filter options (based on existing data)
  const allTypes = useMemo(() => {
    const set = new Set<string>();
    interactions.forEach((i) => i.type && set.add(i.type));
    return Array.from(set).sort();
  }, [interactions]);

  // client-side filtering + sorting
  const filtered = useMemo(() => {
    let arr = interactions.slice();

    if (typeFilter !== 'all') {
      arr = arr.filter((i) => (i.type || '') === typeFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      arr = arr.filter((i) => (i.notes || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q));
    }
    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      arr = arr.filter((i) => (i.date ? new Date(i.date).getTime() >= fromTs : false));
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime();
      arr = arr.filter((i) => (i.date ? new Date(i.date).getTime() <= toTs : false));
    }

    arr.sort((a, b) => {
      if (sortBy === 'date') {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return order === 'asc' ? da - db : db - da;
      } else {
        const ta = (a.type || '').localeCompare(b.type || '');
        return order === 'asc' ? ta : -ta;
      }
    });

    return arr;
  }, [interactions, typeFilter, debouncedSearch, dateFrom, dateTo, sortBy, order]);

  const toneByType = (t?: string): React.ComponentProps<typeof Pill>['tone'] => {
    if (!t) return 'gray';
    const key = t.toLowerCase();
    if (['call', 'phone'].includes(key)) return 'blue';
    if (['meeting', 'visit'].includes(key)) return 'green';
    if (['email', 'mail'].includes(key)) return 'purple';
    if (['task', 'todo'].includes(key)) return 'yellow';
    if (['issue', 'complaint'].includes(key)) return 'red';
    return 'gray';
  };

  return (
    <div className="space-y-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Interactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {entityType === 'leads' ? 'Lead' : 'Customer'} • ID: <span className="font-mono">{id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView((v) => (v === 'table' ? 'timeline' : 'table'))}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Toggle view"
          >
            {view === 'table' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 14l5-5l5 5z"/></svg>
                Timeline
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>
                Table
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create form (your existing component) */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <InteractionForm entityId={id} entityType={entityType} onSaved={loadInteractions} />
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-10 -mx-4 sm:mx-0">
        <div className="rounded-none sm:rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:flex-1">
              <div className="relative sm:col-span-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes or type…"
                  className="pl-10"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" />
                </svg>
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All</option>
                  {allTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <Label>Sort</Label>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="date">Date</option>
                    <option value="type">Type</option>
                  </select>
                  <button
                    onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    title="Toggle order"
                  >
                    {order === 'asc' ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 14l5-5l5 5z"/></svg>
                        Asc
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m7 10l5 5l5-5z"/></svg>
                        Desc
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setSearch(''); setTypeFilter('all'); setDateFrom(''); setDateTo(''); setSortBy('date'); setOrder('desc'); }}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {view === 'table' ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Notes</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900/40 divide-y divide-gray-100 dark:divide-gray-800">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="text-gray-400">
                          <path fill="currentColor" d="M12 2a7 7 0 0 0 0 14a7 7 0 0 0 0-14m0 16c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">No interactions found.</p>
                      </div>
                    </td>
                  </tr>
                )
                : filtered.map((interaction) => (
                    <tr key={interaction.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors">
                      <Td>
                        <Pill tone={toneByType(interaction.type)}>
                          {interaction.type || '—'}
                        </Pill>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-gray-100">{formatDate(interaction.date)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime(interaction.date)}</span>
                        </div>
                      </Td>
                      <Td className="text-gray-600 dark:text-gray-300">
                        <div className="max-w-[52ch] line-clamp-2">{interaction.notes || '—'}</div>
                        {interaction.attachmentPath && (
                          <div>
                            <a
                              href={interaction.attachmentPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Attachment
                            </a>
                          </div>
                        )}
                      </Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                            onClick={() => handleEdit(interaction)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            onClick={() => setToDelete({ open: true, id: interaction.id })}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6 7h12v13H6zM9 4h6v3H9z"/></svg>
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        ) : (
          /* Timeline view */
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-start animate-pulse">
                    <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700 mt-1.5" />
                    <div className="flex-1">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                      <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-600 dark:text-gray-300">No interactions found.</div>
            ) : (
              <ul className="relative pl-5">
                {/* vertical line */}
                <div className="absolute left-1 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent dark:from-gray-800 dark:via-gray-800" />
                {filtered.map((i) => (
                  <li key={i.id} className="relative mb-6">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-900"
                      style={{ backgroundColor: 'currentcolor' }}
                    />
                    <div className="ml-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Pill tone={toneByType(i.type)}>{i.type || '—'}</Pill>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(i.date)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({relativeTime(i.date)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                            onClick={() => handleEdit(i)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            onClick={() => setToDelete({ open: true, id: i.id })}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M6 7h12v13H6zM9 4h6v3H9z"/></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                      {i.notes && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{i.notes}</p>}
                      {i.attachmentPath && (
                        <a
                          href={i.attachmentPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-sm text-blue-600 hover:underline"
                        >
                          Attachment
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editingInteraction}
        onClose={() => (busy ? null : setEditingInteraction(null))}
        title={`Edit Interaction`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditingInteraction(null)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              form="edit-interaction-form"
              type="submit"
              disabled={busy || !editForm.type.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="edit-interaction-form" onSubmit={handleEditSubmit} className="space-y-3">
          <Input
            label="Type"
            name="type"
            value={editForm.type}
            onChange={handleEditChange}
            placeholder="e.g., call, email, meeting"
            required
          />
          <Input
            type="datetime-local"
            label="Date & Time"
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
          />
          <Textarea
            label="Notes"
            name="notes"
            value={editForm.notes}
            onChange={handleEditChange}
            placeholder="Details…"
          />
          {editingInteraction?.attachmentPath && (
            <div className="text-sm">
              Current file:{' '}
              <a
                href={editingInteraction.attachmentPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download
              </a>
            </div>
          )}
          <Input type="file" name="file" label="Attachment" onChange={handleEditFileChange} />
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={toDelete.open}
        onClose={() => (busy ? null : setToDelete({ open: false }))}
        title="Delete interaction?"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              disabled={busy}
              onClick={() => setToDelete({ open: false })}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={() => toDelete.id && handleDelete(toDelete.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default InteractionsPage;
