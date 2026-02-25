import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    AlertCircle,
    TrendingUp,
    DownloadCloud
} from 'lucide-react';
import { motion } from 'framer-motion';


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
            <button className="text-primary hover:text-accent font-medium text-sm p-2 rounded-full hover:bg-gray-100 transition-colors" title="Download">
                <DownloadCloud size={18} />
            </button>
        </td>
    </tr>
);

export const Dashboard = () => {
    console.log("Dashboard rendered");
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-primary mb-2">Financial Overview</h1>
                <p className="text-text-dark/60">Welcome back, Juan. Here is what's happening with your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Balance Card */}
                <StatCard
                    title="Current Balance"
                    value="€12,450.00"
                    trend="+5.2%"
                    trendUp={true}
                    icon={TrendingUp}
                    className="md:col-span-5"
                />

                {/* Secondary Stats */}
                <StatCard
                    title="Balance by Location"
                    value="€4,200.00"
                    trend="+2.1%"
                    trendUp={true}
                    icon={TrendingUp}
                    className="md:col-span-4"
                />

                <StatCard
                    title="Pending Invoices"
                    value="3"
                    trend="Due soon"
                    trendUp={false}
                    icon={AlertCircle}
                    className="md:col-span-3"
                />
            </div>

            {/* Recent Documents Section */}
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
                            <DocumentRow name="Annual Tax Return 2024" type="PDF Document" date="Oct 24, 2024" size="2.4 MB" />
                            <DocumentRow name="Property Lease Agreement" type="Legal Contract" date="Oct 20, 2024" size="1.8 MB" />
                            <DocumentRow name="Utility Invoice - Oct" type="Invoice" date="Oct 15, 2024" size="450 KB" />
                            <DocumentRow name="Residency Application" type="Form" date="Sep 28, 2024" size="3.2 MB" />
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
