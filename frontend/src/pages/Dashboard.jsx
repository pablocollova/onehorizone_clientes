import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    AlertCircle,
    TrendingUp,
    DownloadCloud,
    RefreshCw,
    FolderOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiGet } from '../lib/api';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, trend, trendUp, icon: Icon, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-text-dark/60 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-primary">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${trendUp ? 'bg-green-50 text-green-600' : 'bg-primary/5 text-primary'}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {trend}
            </span>
            <span className="text-text-dark/40">vs last month</span>
        </div>
    </motion.div>
);

const StatCardSkeleton = ({ className }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
        </div>
        <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
);

const DocumentRow = ({ name, type, date, size }) => (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
        <td className="py-4 pl-4 pr-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                    <FileText size={20} />
                </div>
                <div>
                    <div className="font-medium text-text-dark">{name}</div>
                    <div className="text-xs text-text-dark/50">{type}</div>
                </div>
            </div>
        </td>
        <td className="px-3 py-4 text-sm text-text-dark/70">{date}</td>
        <td className="px-3 py-4 text-sm text-text-dark/70">{size}</td>
        <td className="px-3 py-4 text-right pr-4">
            <button
                className="text-primary hover:text-accent font-medium text-sm p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Download"
            >
                <DownloadCloud size={18} />
            </button>
        </td>
    </tr>
);

const DocumentRowSkeleton = () => (
    <tr className="border-b border-gray-50 animate-pulse">
        <td className="py-4 pl-4 pr-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200" />
                <div className="space-y-1.5">
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
            </div>
        </td>
        <td className="px-3 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
        <td className="px-3 py-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
        <td className="px-3 py-4 text-right pr-4"><div className="h-3 w-6 bg-gray-100 rounded ml-auto" /></td>
    </tr>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatEuros = (cents) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents ?? 0);

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr; // already formatted string fallback
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    if (bytes >= 1_024) return `${Math.round(bytes / 1_024)} KB`;
    return `${bytes} B`;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const json = await apiGet('/api/dashboard');
            setData(json);
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // ── Error state ──
    if (error) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-2">Financial Overview</h1>
                    <p className="text-text-dark/60">Welcome back. Here is what's happening with your account.</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                    <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={22} />
                    <div className="flex-1">
                        <p className="font-semibold text-red-700 mb-1">Could not load dashboard data</p>
                        <p className="text-sm text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchDashboard}
                            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Resolve display values ──
    // Support both flat numbers from the mock endpoint and cents from the real /dashboard/summary
    const currentBalance = data
        ? (data.currentBalance !== undefined
            ? formatEuros(data.currentBalance)             // mock: already in euros
            : formatEuros((data.cards?.currentBalanceCents ?? 0) / 100))
        : null;

    const balanceByLocation = data
        ? (data.balanceByLocation !== undefined
            ? formatEuros(data.balanceByLocation)
            : formatEuros((data.cards?.balanceByLocationCents ?? 0) / 100))
        : null;

    const pendingInvoices = data
        ? (data.pendingInvoices !== undefined
            ? data.pendingInvoices
            : data.cards?.pendingInvoices ?? 0)
        : null;

    const docs = data
        ? (data.recentDocuments ?? data.recentDocuments ?? [])
        : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary mb-2">Financial Overview</h1>
                <p className="text-text-dark/60">Welcome back. Here is what's happening with your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {loading ? (
                    <>
                        <StatCardSkeleton className="md:col-span-5" />
                        <StatCardSkeleton className="md:col-span-4" />
                        <StatCardSkeleton className="md:col-span-3" />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Current Balance"
                            value={currentBalance}
                            trend="+5.2%"
                            trendUp
                            icon={TrendingUp}
                            className="md:col-span-5"
                        />
                        <StatCard
                            title="Balance by Location"
                            value={balanceByLocation}
                            trend="+2.1%"
                            trendUp
                            icon={TrendingUp}
                            className="md:col-span-4"
                        />
                        <StatCard
                            title="Pending Invoices"
                            value={String(pendingInvoices)}
                            trend="Due soon"
                            trendUp={false}
                            icon={AlertCircle}
                            className="md:col-span-3"
                        />
                    </>
                )}
            </div>

            {/* Recent Documents */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-primary">Recent Documents</h3>
                    <button className="text-sm text-accent font-medium hover:text-primary transition-colors">View All</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-3 pl-4 pr-3 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Document Name</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Date Uploaded</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Size</th>
                                <th className="text-right px-3 py-3 pr-4 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <DocumentRowSkeleton key={i} />)
                            ) : docs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-text-dark/40">
                                            <FolderOpen size={40} strokeWidth={1.5} />
                                            <p className="text-sm font-medium">No documents yet</p>
                                            <p className="text-xs">Documents uploaded to your account will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                docs.map((doc) => (
                                    <DocumentRow
                                        key={doc.id}
                                        name={doc.name}
                                        type={doc.type ?? doc.mimeType ?? '—'}
                                        date={formatDate(doc.date ?? doc.createdAt)}
                                        size={typeof doc.size === 'string' ? doc.size : formatSize(doc.sizeBytes)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
