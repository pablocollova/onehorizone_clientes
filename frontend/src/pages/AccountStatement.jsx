import React from 'react';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';

const tasks = [
    { date: 'Oct 25, 2024', ref: 'INV-2024-001', desc: 'Monthly Concierge Fee', type: 'Debit', amount: '-€450.00', status: 'Completed' },
    { date: 'Oct 24, 2024', ref: 'DEP-9921', desc: 'Retainer Deposit', type: 'Credit', amount: '+€2,000.00', status: 'Completed' },
    { date: 'Oct 20, 2024', ref: 'INV-2024-002', desc: 'Legal Consultation', type: 'Debit', amount: '-€150.00', status: 'Pending' },
    { date: 'Oct 15, 2024', ref: 'UTIL-882', desc: 'Electricity Bill (Madrid)', type: 'Debit', amount: '-€89.50', status: 'Completed' },
    { date: 'Oct 01, 2024', ref: 'INV-2024-003', desc: 'Property Management', type: 'Debit', amount: '-€300.00', status: 'Completed' },
];

export const AccountStatement = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">Account Statement</h1>
                    <p className="text-text-dark/60">View and download your transaction history.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-4 pl-6 pr-3 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Date</th>
                                <th className="text-left px-3 py-4 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Reference</th>
                                <th className="text-left px-3 py-4 text-xs font-semibold text-text-dark/50 uppercase tracking-wider w-1/3">Description</th>
                                <th className="text-left px-3 py-4 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Type</th>
                                <th className="text-right px-3 py-4 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Amount</th>
                                <th className="text-center px-3 py-4 pr-6 text-xs font-semibold text-text-dark/50 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tasks.map((task, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pl-6 pr-3 text-sm text-text-dark/70 font-medium">{task.date}</td>
                                    <td className="px-3 py-4 text-sm text-text-dark/60 font-mono">{task.ref}</td>
                                    <td className="px-3 py-4 text-sm text-text-dark">{task.desc}</td>
                                    <td className="px-3 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${task.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {task.type}
                                        </span>
                                    </td>
                                    <td className={`px-3 py-4 text-sm text-right font-medium ${task.type === 'Credit' ? 'text-green-600' : 'text-text-dark'}`}>
                                        {task.amount}
                                    </td>
                                    <td className="px-3 py-4 pr-6 text-center">
                                        <span className={`inline-block w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-400'}`} title={task.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
