import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import taskService, { Task } from '../services/taskService';

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
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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
function isOverdue(task: Task) {
  return task.status !== 'completed' && task.dueDate ? new Date(task.dueDate).getTime() < Date.now() : false;
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
    <td className="px-4 py-4"><div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" /></td>
    <td className="px-4 py-4"><div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" /></td>
  </tr>
);

/** table helpers */
const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={classNames('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300', className)}>{children}</th>
);
const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={classNames('px-4 py-4 align-middle text-sm', className)}>{children}</td>
);

/** form controls */
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
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options?: { label: string; value: string }[] }> = ({ label, id, className, options, ...props }) => {
  const inputId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <select
        id={inputId}
        {...props}
        className={classNames(
          'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm',
          'text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition',
          className
        )}
      >
        {options ? options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : null}
      </select>
    </div>
  );
};

const ActionButton: React.FC<{ tone: 'blue' | 'purple' | 'green' | 'red' | 'gray'; label: string; iconPath: string; onClick: () => void; }> = ({ tone, label, iconPath, onClick }) => {
  const tones: Record<string, string> = {
    blue: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    purple: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    green: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    red: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
    gray: 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
  };
  return (
    <button onClick={onClick} className={classNames('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition', tones[tone])}>
      <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d={iconPath} /></svg>
      {label}
    </button>
  );
};

/* ---------- Page ---------- */
const TasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const entityType = (searchParams.get('type') === 'lead' ? 'leads' : 'customers') as 'customers' | 'leads';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', dueDate: '', status: 'pending' as Task['status'] });

  // edit modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ title: '', dueDate: '', status: 'pending' as Task['status'] });

  // delete confirm
  const [toDelete, setToDelete] = useState<{ open: boolean; id?: string; title?: string }>({ open: false });

  // filters / sort / view
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'status'>('dueDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'table' | 'board'>('table');

  const debouncedSearch = useDebounce(search, 300);

  const loadTasks = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const params: any = { [entityType === 'customers' ? 'customerId' : 'leadId']: id };
      const data = await taskService.getTasks(params);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, entityType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    try {
      const data: any = { ...form, [entityType === 'customers' ? 'customerId' : 'leadId']: id };
      const newTask = await taskService.createTask(data);
      setTasks((ts) => [...ts, newTask]);
      setForm({ title: '', dueDate: '', status: 'pending' });
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      status: task.status || 'pending'
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setBusy(true);
    try {
      const updated = await taskService.updateTask(editingTask.id, editForm);
      setTasks((ts) => ts.map((t) => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task', error);
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    setBusy(true);
    try {
      const next = task.status === 'completed' ? 'pending' : 'completed';
      const updated = await taskService.updateTask(task.id, { status: next });
      setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      console.error('Failed to toggle task', error);
    } finally {
      setBusy(false);
    }
  };

  const toggleReminder = async (task: Task) => {
    setBusy(true);
    try {
      const updated = await taskService.toggleReminder(task.id, !task.reminderEnabled);
      setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      console.error('Failed to toggle reminder', error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    setBusy(true);
    try {
      await taskService.deleteTask(taskId);
      setTasks((ts) => ts.filter((t) => t.id !== taskId));
      setToDelete({ open: false });
    } catch (error) {
      console.error('Failed to delete task', error);
    } finally {
      setBusy(false);
    }
  };

  if (!id) return <div className="py-6 text-sm text-gray-600 dark:text-gray-300">No target selected</div>;

  // filtering + sorting
  const filtered = useMemo(() => {
    let arr = tasks.slice();
    if (statusFilter !== 'all') arr = arr.filter((t) => t.status === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      arr = arr.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      arr = arr.filter((t) => (t.dueDate ? new Date(t.dueDate).getTime() >= fromTs : false));
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime();
      arr = arr.filter((t) => (t.dueDate ? new Date(t.dueDate).getTime() <= toTs : false));
    }
    arr.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return order === 'asc' ? da - db : db - da;
      }
      if (sortBy === 'title') {
        const r = a.title.localeCompare(b.title);
        return order === 'asc' ? r : -r;
      }
      // status
      const r = (a.status || '').localeCompare(b.status || '');
      return order === 'asc' ? r : -r;
    });
    return arr;
  }, [tasks, statusFilter, debouncedSearch, dateFrom, dateTo, sortBy, order]);

  const toneByStatus = (s?: Task['status']): React.ComponentProps<typeof Pill>['tone'] => {
    if (s === 'completed') return 'green';
    return 'blue';
  };

  // board columns
  const boardColumns = useMemo(() => {
    const pending = filtered.filter((t) => t.status !== 'completed');
    const completed = filtered.filter((t) => t.status === 'completed');
    return [
      { key: 'pending', title: 'Pending', items: pending as Task[] },
      { key: 'completed', title: 'Completed', items: completed as Task[] }
    ];
  }, [filtered]);

  return (
    <div className="space-y-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {entityType === 'leads' ? 'Lead' : 'Customer'} • ID: <span className="font-mono">{id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2.5 text-sm font-semibold shadow-sm hover:brightness-110 active:translate-y-px transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M13 11V6a1 1 0 0 0-2 0v5H6a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2z"/></svg>
            New Task
          </button>
          <button
            onClick={() => setView((v) => (v === 'table' ? 'board' : 'table'))}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Toggle view"
          >
            {view === 'table' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3 5h6v14H3zm12 0h6v14h-6z"/></svg>
                Board
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

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 -mx-4 sm:mx-0 sm:rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:flex-1">
            <div className="relative sm:col-span-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks by title…"
                className="pl-10"
              />
              <svg width="18" height="18" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" />
              </svg>
            </div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | Task['status'])}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' }
              ]}
            />
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
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="dueDate">Due date</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
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
              onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setSortBy('dueDate'); setOrder('asc'); }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Reset
            </button>
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
      {view === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <Th>Title</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Reminder</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900/40 divide-y divide-gray-100 dark:divide-gray-800">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="36" height="36" viewBox="0 0 24 24" className="text-gray-400">
                          <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">No tasks found.</p>
                      </div>
                    </td>
                  </tr>
                )
                : filtered.map((task) => (
                    <tr key={task.id} className={classNames('group hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors', isOverdue(task) ? 'bg-red-50/40 dark:bg-red-900/10' : '')}>
                      <Td className="text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="accent-green-600 h-4 w-4"
                            checked={task.status === 'completed'}
                            onChange={() => toggleStatus(task)}
                            title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                          />
                          <span className={classNames(task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : '')}>
                            {task.title}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className={classNames('text-gray-900 dark:text-gray-100', isOverdue(task) ? 'text-red-600 dark:text-red-400 font-medium' : '')}>
                            {formatDate(task.dueDate)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime(task.dueDate)}</span>
                        </div>
                      </Td>
                      <Td><Pill tone={toneByStatus(task.status)}>{task.status === 'completed' ? 'Completed' : 'Pending'}</Pill></Td>
                      <Td>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-600"
                          checked={!!task.reminderEnabled}
                          onChange={() => toggleReminder(task)}
                          title={task.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                        />
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            tone="green"
                            onClick={() => handleEdit(task)}
                            label="Edit"
                            iconPath="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
                          />
                          <ActionButton
                            tone="red"
                            onClick={() => setToDelete({ open: true, id: task.id, title: task.title })}
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
      ) : (
        /* Board view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boardColumns.map((col) => (
            <div key={col.key} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Pill tone={col.key === 'completed' ? 'green' : 'blue'}>{col.title}</Pill>
                </div>
                <Pill tone="gray">{col.items.length}</Pill>
              </div>
              <div className="p-3 space-y-3 max-h-[60vh] overflow-auto">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    ))
                  : col.items.length === 0
                  ? <div className="text-sm text-gray-500">No tasks.</div>
                  : col.items.map((task) => (
                      <div key={task.id} className={classNames('rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm', isOverdue(task) ? 'ring-1 ring-red-300 dark:ring-red-800' : '')}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="accent-green-600 h-4 w-4 mt-0.5"
                              checked={task.status === 'completed'}
                              onChange={() => toggleStatus(task)}
                            />
                            <div>
                              <div className={classNames('font-medium', task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100')}>
                                {task.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                {formatDate(task.dueDate)} <span className="text-gray-400">•</span> {relativeTime(task.dueDate) || '—'}
                              </div>
                            </div>
                          </div>
                          <Pill tone={toneByStatus(task.status)}>{task.status === 'completed' ? 'Completed' : 'Pending'}</Pill>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <ActionButton tone="blue" label={task.reminderEnabled ? 'Disable' : 'Enable'} iconPath="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2h16l-2-2z" onClick={() => toggleReminder(task)} />
                          <ActionButton tone="green" label="Edit" iconPath="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" onClick={() => handleEdit(task)} />
                          <ActionButton tone="red" label="Delete" iconPath="M6 7h12v13H6zM9 4h6v3H9z" onClick={() => setToDelete({ open: true, id: task.id, title: task.title })} />
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => (busy ? null : setShowCreate(false))}
        title="Add Task"
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
              form="create-task-form"
              type="submit"
              disabled={busy || !form.title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Create
            </button>
          </div>
        }
      >
        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-3">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Follow up call" required />
          <Input type="datetime-local" label="Due date" name="dueDate" value={form.dueDate} onChange={handleChange} />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' }
            ]}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                setForm((f) => ({ ...f, dueDate: d.toISOString().slice(0, 16) }));
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                setForm((f) => ({ ...f, dueDate: d.toISOString().slice(0, 16) }));
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Tomorrow
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingTask}
        onClose={() => (busy ? null : setEditingTask(null))}
        title="Edit Task"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditingTask(null)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              form="edit-task-form"
              type="submit"
              disabled={busy || !editForm.title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Spinner className="h-4 w-4" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="edit-task-form" onSubmit={handleEditSubmit} className="space-y-3">
          <Input label="Title" name="title" value={editForm.title} onChange={handleEditChange} required />
          <Input type="datetime-local" label="Due date" name="dueDate" value={editForm.dueDate} onChange={handleEditChange} />
          <Select
            label="Status"
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' }
            ]}
          />
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={toDelete.open}
        onClose={() => (busy ? null : setToDelete({ open: false }))}
        title="Delete task?"
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
          This action cannot be undone. You’re about to delete{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">{toDelete.title ?? 'this task'}</span>.
        </p>
      </Modal>
    </div>
  );
};

export default TasksPage;
