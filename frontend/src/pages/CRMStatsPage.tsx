import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { crmService, CRMStats } from '../services/crmService';
import taskService, { Task } from '../services/taskService';
import CRMCharts from '../atoms/Charts/CRMCharts';

/* ---------- Small utils ---------- */
function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString();
}

function parseISO(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
function relativeTime(to?: string | null) {
  if (!to) return '';
  const date = parseISO(to);
  if (!date) return '';
  const now = new Date().getTime();
  const diffMs = date.getTime() - now;
  const abs = Math.abs(diffMs);
  if (abs >= 1000 * 60 * 60 * 48) {
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return rtf.format(days, 'day');
  } else {
    const hours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(hours, 'hour');
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/* ---------- CSV helpers ---------- */
function toCSV(rows: any[]): string {
  if (!rows.length) return '';
  const columns = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const esc = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map(r => columns.map(c => esc((r as any)[c])).join(','));
  return [header, ...lines].join('\n');
}
function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) { alert('No data to export.'); return; }
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Simple UI atoms (Tailwind) ---------- */
const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: string; right?: React.ReactNode }>> = ({ className = '', title, right, children }) => (
  <section className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-800 ${className}`}>
    {(title || right) && (
      <header className="mb-3 flex items-center justify-between gap-3">
        {title ? <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2> : <span />}
        {right}
      </header>
    )}
    {children}
  </section>
);

const KPI: React.FC<{ label: string; value: number; hint?: string; icon?: React.ReactNode }> = ({ label, value, hint, icon }) => (
  <div className="flex items-center gap-4">
    <div className="grid h-12 w-12 place-items-center rounded-lg bg-gray-100 dark:bg-gray-700">{icon}</div>
    <div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}{hint ? <span className="text-gray-400 dark:text-gray-500"> • {hint}</span> : null}</div>
    </div>
  </div>
);

const Badge: React.FC<{ tone?: 'gray' | 'red' | 'amber' | 'blue' | 'green'; children: React.ReactNode }> = ({ tone = 'gray', children }) => {
  const tones: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    red: 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-700/30 dark:text-amber-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200',
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700/30 dark:text-emerald-200',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
  />
);

const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 ${className}`}
  />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${className}`}
  />
);

const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

/* ---------- Main Page ---------- */
type ReminderTab = 'all' | 'overdue' | 'today' | 'week' | 'later' | 'nodate';

const CRMStatsPage: React.FC = () => {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [reminders, setReminders] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Reminder UI
  const [tab, setTab] = useState<ReminderTab>(() => (localStorage.getItem('crm.reminder.tab') as ReminderTab) || 'all');
  const [query, setQuery] = useState<string>('');

  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, tasks] = await Promise.all([
        crmService.getStats(),
        taskService.getTasks({ status: 'pending' }),
      ]);
      setStats(s);
      const sorted = [...tasks].sort((a, b) => {
        const da = parseISO(a.dueDate)?.getTime() ?? Infinity;
        const db = parseISO(b.dueDate)?.getTime() ?? Infinity;
        return da - db;
      });
      setReminders(sorted);
      setUpdatedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load CRM stats', err);
      setError('Failed to load CRM stats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { localStorage.setItem('crm.reminder.tab', tab); }, [tab]);

  const todayStart = useMemo(() => startOfToday(), []);
  const todayEnd = useMemo(() => endOfToday(), []);

  type Groups = {
    overdue: Task[];
    today: Task[];
    week: Task[];
    later: Task[];
    nodate: Task[];
  };

  const grouped: Groups = useMemo(() => {
    const g: Groups = { overdue: [], today: [], week: [], later: [], nodate: [] };
    const in7 = new Date(); in7.setDate(in7.getDate() + 7);

    for (const t of reminders) {
      const d = parseISO(t.dueDate);
      if (!d) { g.nodate.push(t); continue; }

      if (d < todayStart) g.overdue.push(t);
      else if (d >= todayStart && d <= todayEnd) g.today.push(t);
      else if (d > todayEnd && d <= in7) g.week.push(t);
      else g.later.push(t);
    }
    return g;
  }, [reminders, todayStart, todayEnd]);

  const filteredByTab: Task[] = useMemo(() => {
    let list: Task[] = [];
    switch (tab) {
      case 'overdue': list = grouped.overdue; break;
      case 'today': list = grouped.today; break;
      case 'week': list = grouped.week; break;
      case 'later': list = grouped.later; break;
      case 'nodate': list = grouped.nodate; break;
      default: list = reminders;
    }
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(t =>
      (t.title ?? '').toLowerCase().includes(q) ||
      (t.status ?? '').toLowerCase().includes(q)
    );
  }, [tab, grouped, reminders, query]);

  async function markDone(task: Task) {
    try {
      const svc: any = taskService as any;
      if (typeof svc.updateTaskStatus === 'function') {
        await svc.updateTaskStatus(task.id, 'done');
      } else if (typeof svc.updateTask === 'function') {
        await svc.updateTask(task.id, { status: 'done' });
      } else if (typeof svc.update === 'function') {
        await svc.update(task.id, { status: 'done' });
      } else {
        throw new Error('No task update method available on taskService');
      }
      setToast('Marked as done');
      await fetchData();
    } catch (e) {
      console.warn(e);
      setToast("Couldn't mark as done here.");
      setTimeout(() => setToast(null), 2200);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="py-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-gray-200 bg-white/75 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/60 sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">CRM Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick health of your pipeline & reminders
              {updatedAt ? <span className="ml-2 text-gray-400">• Updated {relativeTime(updatedAt.toISOString())}</span> : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GhostButton onClick={fetchData} aria-label="Refresh data">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-80"><path fill="currentColor" d="M12 6V3L8 7l4 4V8a5 5 0 0 1 0 10 5 5 0 0 1-4.9-4H5a7 7 0 1 0 7-8"/></svg>
              Refresh
            </GhostButton>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2" aria-live="polite">
          <Card>
            <div className="space-y-3">
              <SkeletonLine className="h-6 w-36" />
              <SkeletonLine className="w-24" />
              <SkeletonLine className="w-16" />
            </div>
          </Card>
          <Card>
            <div className="space-y-3">
              <SkeletonLine className="h-6 w-36" />
              <SkeletonLine className="w-3/4" />
              <SkeletonLine className="w-2/3" />
              <SkeletonLine className="w-1/2" />
            </div>
          </Card>
          <Card className="md:col-span-2">
            <SkeletonLine className="h-6 w-40" />
            <div className="mt-4 h-40 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </Card>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          <Button onClick={fetchData}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 5v2a5 5 0 1 1-4.546 2.916l-1.79.894A7 7 0 1 0 12 5Z"/><path fill="currentColor" d="M8 4H4v4l1.414-1.414L8 4Z"/></svg>
            Retry
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && stats && (
        <>
          {/* KPI cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <KPI
                label="Leads"
                value={stats.leadCount}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z"/>
                  </svg>
                }
              />
            </Card>
            <Card>
              <KPI
                label="Customers"
                value={stats.customerCount}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path fill="currentColor" d="M16 11a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm-8 0a3 3 0 1 0-3-3a3 3 0 0 0 3 3Zm0 2c-3.3 0-6 1.7-6 4v3h6v-3.1c0-1 .3-2 .8-2.9c-.2 0-.5 0-.8 0Zm8 0c-3.9 0-7 2-7 5v3h14v-3c0-3-3.1-5-7-5Z"/>
                  </svg>
                }
              />
            </Card>
          </div>

          {/* Reminders + Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card
              title="Reminders"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{reminders.length} pending</Badge>
                  <GhostButton
                    onClick={() => downloadCSV(`reminders-${tab}-${new Date().toISOString().slice(0,10)}.csv`, filteredByTab as any[])}
                    aria-label="Export reminders CSV"
                  >
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              {/* Toolbar */}
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {/* Tabs */}
                <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
                  {(['all','overdue','today','week','later','nodate'] as ReminderTab[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setTab(opt)}
                      className={`px-2.5 py-1.5 text-xs font-medium ${tab === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`}
                      aria-pressed={tab === opt}
                      title={opt === 'nodate' ? 'No date' : opt[0].toUpperCase() + opt.slice(1)}
                    >
                      {opt === 'nodate' ? 'No date' : opt[0].toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div className="w-full sm:w-64">
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search reminders…"
                    aria-label="Search reminders"
                  />
                </div>
              </div>

              {/* Lists */}
              {reminders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  No reminders yet. Create tasks tied to leads/customers and they’ll show up here.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Render a single list based on current tab */}
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredByTab.map((r) => {
                      const due = parseISO(r.dueDate);
                      const isOverdue = !!due && due < todayStart;
                      const isToday = !!due && due >= todayStart && due <= todayEnd;
                      const badgeTone = !due ? 'gray' : isOverdue ? 'red' : isToday ? 'amber' : 'blue';
                      const badgeText = !due ? 'pending' : isOverdue ? 'due' : isToday ? 'today' : 'upcoming';
                      return (
                        <li key={r.id} className="flex items-center justify-between py-2 gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                            <p className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : isToday ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>
                              {due ? `${formatDate(r.dueDate)} • ${relativeTime(r.dueDate)}` : 'No due date'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge tone={badgeTone as any}>{badgeText}</Badge>
                            <GhostButton
                              onClick={() => markDone(r)}
                              title="Mark done"
                              aria-label="Mark reminder as done"
                            >
                              ✓
                            </GhostButton>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Empty after filter */}
                  {filteredByTab.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                      Nothing here for <strong>{tab === 'nodate' ? 'No date' : tab}</strong>
                      {query ? <> matching “{query}”.</> : '.'}
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card title="Trends">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Weekly leads, conversion rate & interactions per customer
              </div>
              <div className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                <CRMCharts
                  weeklyLeadCreation={stats.weeklyLeadCreation}
                  conversionRate={stats.conversionRate}
                  interactionsPerCustomer={stats.interactionsPerCustomer}
                />
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Tiny toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          onAnimationEnd={() => setTimeout(() => setToast(null), 1600)}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default CRMStatsPage;
