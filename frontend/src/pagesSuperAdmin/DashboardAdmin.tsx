import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  statsService,
  projectService,
  pixelService,
  customDomainService,
  subscriptionService,
  vcardService,
  VCardWithUser,
} from '../services/api';
import ProjectCharts from '../atoms/Charts/ProjectCharts';
import PixelCharts from '../atoms/Charts/PixelCharts';
import CustomDomainCharts from '../atoms/Charts/CustomDomainCharts';
import SubscriptionCharts from '../atoms/Charts/SubscriptionCharts';
import VCardsCharts from '../atoms/Charts/VCardsCharts';
import { Project } from '../services/Project';
import { Pixel } from '../services/Pixel';
import { CustomDomain } from '../services/CustomDomain';
import { Subscription } from '../services/Subscription';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ===================== UI atoms (Tailwind) ===================== */
const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: string; right?: React.ReactNode }>> = ({ className = '', title, right, children }) => (
  <section className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-800 ${className}`}>
    {(title || right) && (
      <header className="mb-3 flex items-center justify-between gap-3">
        {title ? <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3> : <span />}
        {right}
      </header>
    )}
    {children}
  </section>
);

const KPI: React.FC<{ label: string; value: number | string; icon?: React.ReactNode; hint?: string }> = ({ label, value, icon, hint }) => (
  <div className="flex items-center gap-4">
    <div className="grid h-12 w-12 place-items-center rounded-lg bg-gray-100 dark:bg-gray-700">{icon}</div>
    <div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {label}{hint ? <span className="text-gray-400 dark:text-gray-500"> • {hint}</span> : null}
      </div>
    </div>
  </div>
);

const Badge: React.FC<{ tone?: 'gray' | 'blue' | 'green' | 'orange' | 'violet' }> = ({ tone = 'gray', children }) => {
  const tones: Record<string, string> = {
    gray:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200',
    green:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-700/30 dark:text-emerald-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-700/30 dark:text-orange-200',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-700/30 dark:text-violet-200',
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

const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

/* ===================== Helpers ===================== */
type TimeRange = '7d' | '30d' | '90d' | '365d' | 'all';

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
function relativeFrom(date?: Date | null) {
  if (!date) return '';
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const abs = Math.abs(diffMs);
  if (abs >= 1000 * 60 * 60 * 48) return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), 'day');
  return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), 'hour');
}

function dateFromUnknown(o: any): Date | null {
  if (!o || typeof o !== 'object') return null;
  const candidates = [
    'date','createdAt','created_at','created_on','created','updatedAt','updated_at','startDate','startedAt','timestamp'
  ];
  for (const k of candidates) {
    const v = (o as any)[k];
    if (!v) continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function filterByRange<T>(rows: T[], range: TimeRange): T[] {
  if (range === 'all') return rows;
  const daysMap: Record<Exclude<TimeRange, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
  const days = daysMap[range as Exclude<TimeRange, 'all'>];
  const since = new Date();
  since.setDate(since.getDate() - days);
  return rows.filter(r => {
    const d = dateFromUnknown(r as any);
    return d ? d >= since : false;
  });
}

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
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ===================== Types ===================== */
interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalVCards: number;
  usersByRole: {
    admin: number;
    superAdmin: number;
    user: number;
  };
}

/* ===================== Main ===================== */
const DashboardAdmin: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [vcards, setVcards] = useState<VCardWithUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // UI controls
  const [range, setRange] = useState<TimeRange>(() => (localStorage.getItem('dash.range') as TimeRange) || 'all');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  // Persist theme toggle
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist range
  useEffect(() => {
    localStorage.setItem('dash.range', range);
  }, [range]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, projectRes, pixelRes, domainRes, subscriptionRes, vcardRes] =
        await Promise.all([
          statsService.getStats(),
          projectService.getAllProjectsWithUser(),
          pixelService.getPixels(),
          customDomainService.getDomains(),
          subscriptionService.getSubscriptions(),
          vcardService.getAllWithUsers(),
        ]);

      setStats(statsData ?? null);

      setProjects(projectRes && Array.isArray(projectRes.data) ? projectRes.data : []);
      setPixels(pixelRes && Array.isArray(pixelRes.data) ? pixelRes.data : []);
      setDomains(domainRes && Array.isArray(domainRes.data) ? domainRes.data : []);
      setSubscriptions(subscriptionRes && Array.isArray(subscriptionRes.data) ? subscriptionRes.data : []);
      setVcards(vcardRes && Array.isArray(vcardRes.data) ? vcardRes.data : []);

      setUpdatedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ===== Filtered views by time range ===== */
  const view = useMemo(() => {
    return {
      projects: filterByRange(projects, range),
      pixels: filterByRange(pixels, range),
      domains: filterByRange(domains, range),
      subscriptions: filterByRange(subscriptions, range),
      vcards: filterByRange(vcards, range),
    };
  }, [projects, pixels, domains, subscriptions, vcards, range]);

  const counts = useMemo(() => {
    const activeSubs = view.subscriptions.filter((s: any) => (s?.status ?? '').toString().toLowerCase() === 'active').length;
    return {
      projects: view.projects.length,
      pixels: view.pixels.length,
      domains: view.domains.length,
      subscriptions: view.subscriptions.length,
      activeSubs,
      vcards: view.vcards.length,
    };
  }, [view]);

  /* ===== User roles donut ===== */
  const roleChart = useMemo(() => {
    if (!stats) return null;
    const data = {
      labels: ['Admin', 'Super Admin', 'User'],
      datasets: [{
        data: [stats.usersByRole.admin, stats.usersByRole.superAdmin, stats.usersByRole.user],
        backgroundColor: ['#f97316', '#6366f1', '#10b981'],
        borderWidth: 0,
      }],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false as const,
      cutout: '60%', // donut
      plugins: {
        legend: { position: 'bottom' as const, labels: { usePointStyle: true } },
        tooltip: { callbacks: { label: (c: any) => `${c.label}: ${c.raw}` } },
      },
    };
    return { data, options };
  }, [stats]);

  /* ===== Header controls ===== */
  const RangePicker = (
    <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
      {(['7d','30d','90d','365d','all'] as TimeRange[]).map(opt => (
        <button
          key={opt}
          onClick={() => setRange(opt)}
          className={`px-2.5 py-1.5 text-xs font-medium ${range === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`}
          aria-pressed={range === opt}
          title={`Show ${opt === 'all' ? 'all time' : opt}`}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-container w-full py-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-gray-200 bg-white/75 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/60 sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overview of users, projects, domains, subscriptions & more
              {updatedAt ? <span className="ml-2 text-gray-400">• Updated {relativeFrom(updatedAt)}</span> : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {RangePicker}
            <GhostButton onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} aria-label="Toggle theme">
              {/* theme icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" aria-hidden>
                <path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm7.07 2.93a1 1 0 0 1 0 1.41l-1.41 1.41a1 1 0 0 1-1.42-1.41l1.42-1.41a1 1 0 0 1 1.41 0ZM21 11a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM7.76 7.76a1 1 0 0 1 0 1.41L6.34 10.6a1 1 0 1 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.42 0ZM12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10ZM4 11a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2h2Zm1.52 6.48a1 1 0 0 1 1.41 0l1.41 1.41a1 1 0 0 1-1.41 1.42l-1.41-1.42a1 1 0 0 1 0-1.41ZM12 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm8.48-.52a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0Z"/>
              </svg>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </GhostButton>
            <GhostButton onClick={fetchData} aria-label="Refresh data">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-80"><path fill="currentColor" d="M12 6V3L8 7l4 4V8a5 5 0 0 1 0 10 5 5 0 0 1-4.9-4H5a7 7 0 1 0 7-8"/></svg>
              Refresh
            </GhostButton>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-6 w-24" />
                  <SkeletonLine className="w-32" />
                </div>
              </div>
            </Card>
          ))}
          <Card className="md:col-span-2 xl:col-span-4">
            <SkeletonLine className="h-6 w-40" />
            <div className="mt-4 h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
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
      {!loading && !error && (
        <>
          {/* KPIs */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <KPI
                label="Total users"
                value={stats?.totalUsers ?? 0}
                icon={<svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6Z"/></svg>}
              />
            </Card>
            <Card>
              <KPI
                label="Total projects"
                value={stats?.totalProjects ?? counts.projects}
                icon={<svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 5h18v4H3V5Zm0 6h18v8H3v-8Zm2 2v4h6v-4H5Z"/></svg>}
              />
            </Card>
            <Card>
              <KPI
                label="Total vCards"
                value={stats?.totalVCards ?? counts.vcards}
                icon={<svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12h2V6h16v14h2V6a2 2 0 0 0-2-2ZM6 8h8v2H6V8Zm0 4h12v2H6v-2Zm0 4h12v2H6v-2Z"/></svg>}
              />
            </Card>
            <Card>
              <KPI
                label="Subscriptions"
                value={counts.subscriptions}
                hint={counts.activeSubs ? `${counts.activeSubs} active` : undefined}
                icon={<svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M20 7H4V5h16v2Zm-2 4H6V9h12v2ZM4 13h16v6H4v-6Z"/></svg>}
              />
            </Card>
          </div>

          {/* Users by role + quick counts */}
          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <Card
              title="Users by role"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{(stats?.totalUsers ?? 0).toLocaleString()}</Badge>
                  <GhostButton onClick={() => downloadCSV(`users-by-role-${new Date().toISOString().slice(0,10)}.csv`, stats ? [
                    { role: 'admin', count: stats.usersByRole.admin },
                    { role: 'superAdmin', count: stats.usersByRole.superAdmin },
                    { role: 'user', count: stats.usersByRole.user },
                  ] : [])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              {!stats ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">No stats available.</div>
              ) : (
                <div className="h-64 md:h-72">
                  <Doughnut data={roleChart!.data} options={roleChart!.options} />
                </div>
              )}
              {stats && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.usersByRole.admin}</div>
                    <div className="text-gray-600 dark:text-gray-400">Admin</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.usersByRole.superAdmin}</div>
                    <div className="text-gray-600 dark:text-gray-400">Super</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.usersByRole.user}</div>
                    <div className="text-gray-600 dark:text-gray-400">User</div>
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Note: users by role is global (not affected by time range).</p>
            </Card>

            <Card title="Quick counts">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Pixels</span>
                  <Badge tone="violet">{counts.pixels}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Custom domains</span>
                  <Badge tone="orange">{counts.domains}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Projects (filtered)</span>
                  <Badge tone="blue">{counts.projects}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">vCards (filtered)</span>
                  <Badge tone="green">{counts.vcards}</Badge>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Counts reflect current time-range: {range.toUpperCase()}.</p>
            </Card>
          </div>

          {/* Charts – each with Export CSV (filtered data) */}
          <div className="space-y-8">
            <Card
              title="Projects"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{counts.projects}</Badge>
                  <GhostButton onClick={() => downloadCSV(`projects-${range}-${new Date().toISOString().slice(0,10)}.csv`, view.projects as any[])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              <ProjectCharts projects={view.projects} />
            </Card>

            <Card
              title="Pixels"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="violet">{counts.pixels}</Badge>
                  <GhostButton onClick={() => downloadCSV(`pixels-${range}-${new Date().toISOString().slice(0,10)}.csv`, view.pixels as any[])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              <PixelCharts pixels={view.pixels} />
            </Card>

            <Card
              title="Custom Domains"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="orange">{counts.domains}</Badge>
                  <GhostButton onClick={() => downloadCSV(`domains-${range}-${new Date().toISOString().slice(0,10)}.csv`, view.domains as any[])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              <CustomDomainCharts domains={view.domains} />
            </Card>

            <Card
              title="Subscriptions"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="blue">{counts.subscriptions}</Badge>
                  <GhostButton onClick={() => downloadCSV(`subscriptions-${range}-${new Date().toISOString().slice(0,10)}.csv`, view.subscriptions as any[])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              <SubscriptionCharts subscriptions={view.subscriptions} />
            </Card>

            <Card
              title="vCards"
              right={
                <div className="flex items-center gap-2">
                  <Badge tone="green">{counts.vcards}</Badge>
                  <GhostButton onClick={() => downloadCSV(`vcards-${range}-${new Date().toISOString().slice(0,10)}.csv`, view.vcards as any[])}>
                    Export CSV
                  </GhostButton>
                </div>
              }
            >
              <VCardsCharts vcards={view.vcards} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;
