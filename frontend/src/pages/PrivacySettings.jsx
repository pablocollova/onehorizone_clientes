import React, { useState } from 'react';
import { Download, Eye, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const PrivacySettings = () => {
    const [userData, setUserData] = useState(null);
    const [viewingData, setViewingData] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchMyData = async () => {
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gdpr/me/data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Could not load personal data (HTTP ${res.status})`);
            const data = await res.json();
            if (data.user) {
                setUserData(data.user);
                setFormData({
                    name: data.user.name,
                    phone: data.user.phone || '',
                    address: data.user.address || ''
                });
                setViewingData(true);
            }
        } catch (e) {
            console.error(e);
            setError(e.message || 'Could not load personal data');
        }
    };

    const handleExportData = async () => {
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gdpr/me/export`, {
            headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Export failed with HTTP ${res.status}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-gdpr-data.json';
            document.body.appendChild(a);
            a.click();    
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            setError(e.message || 'Could not export personal data');
        }
    };

    const handleRectify = async () => {
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/gdpr/me/rectify`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.ok) {
                setUserData(data.user);
                setIsEditing(false);
                alert("Data updated successfully.");
            }
        } catch (e) {
            console.error(e);
            setError(e.message || 'Could not update personal data');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("WARNING: This will anonymize your personal data and disable your account. This action cannot be undone. Are you sure?")) {
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/api/gdpr/me/delete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`Could not delete account (HTTP ${res.status})`);
                if (res.ok) {
                    alert("Your account has been deleted.");
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    window.location.href = "/";
                }
            } catch (e) {
                console.error(e);
                setError(e.message || 'Could not delete account');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <h1 className="text-3xl font-bold text-primary mb-2">Privacy & GDPR Settings</h1>
            <p className="text-text-dark/70 mb-8">Manage your personal data, consents, and account status.</p>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Access Data */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Eye size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Right to Access</h3>
                    <p className="text-sm text-text-dark/70 mb-6 flex-grow">View all personal data we currently hold about you in our systems.</p>
                    <Button variant="outline" className="w-full" onClick={fetchMyData}>View My Data</Button>
                </div>

                {/* Export Data */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Download size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Right to Portability</h3>
                    <p className="text-sm text-text-dark/70 mb-6 flex-grow">Download an exact, machine-readable copy (JSON) of your data.</p>
                    <Button variant="outline" className="w-full" onClick={handleExportData}>Export JSON</Button>
                </div>

                {/* Rectify Data */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <Edit3 size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Right to Rectification</h3>
                    <p className="text-sm text-text-dark/70 mb-6 flex-grow">Fix any inaccurate or incomplete personal data attached to your account.</p>
                    <Button variant="outline" className="w-full" onClick={() => { fetchMyData(); setIsEditing(true); }}>Edit Data</Button>
                </div>

                {/* Erasure */}
                <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-rose-700 mb-2">Right to Erasure</h3>
                    <p className="text-sm text-rose-700/70 mb-6 flex-grow">Permanently anonymize your personal data and disable your account.</p>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDeleteAccount}>Forget Me</Button>
                </div>
            </div>

            {/* Data Viewing & Editing Section */}
            {viewingData && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-primary">Your Personal Data</h2>
                        <Button variant="outline" size="sm" onClick={() => setViewingData(false)}>Close</Button>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">ID:</span> <span className="col-span-2 text-text-dark/70">{userData?.id}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Username:</span> <span className="col-span-2 text-text-dark/70">{userData?.username}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Name:</span> <span className="col-span-2 text-text-dark/70">{userData?.name}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Email:</span> <span className="col-span-2 text-text-dark/70">{userData?.email || 'N/A'}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Phone:</span> <span className="col-span-2 text-text-dark/70">{userData?.phone || 'N/A'}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Address:</span> <span className="col-span-2 text-text-dark/70">{userData?.address || 'N/A'}</span></div>
                            <div className="grid grid-cols-3 border-b py-2"><span className="font-semibold text-text-dark">Doc Type/Number:</span> <span className="col-span-2 text-text-dark/70">{userData?.docType || 'N/A'} / {userData?.docNumber || 'N/A'}</span></div>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-bold mb-2">Recent Consents:</h4>
                                {userData?.consentLogs?.length > 0 ? (
                                    <ul className="text-sm text-text-dark/70 space-y-1">
                                        {userData.consentLogs.slice(0, 5).map(log => (
                                            <li key={log.id}>{new Date(log.createdAt).toLocaleString()}: {log.type} = {log.value ? 'Granted' : 'Revoked'}</li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-text-dark/50">No consent logs found.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleRectify}>Save Changes</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
