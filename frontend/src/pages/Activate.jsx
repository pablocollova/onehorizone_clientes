import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../lib/api';
import { CheckCircle } from 'lucide-react';

export const Activate = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        address: '',
        docType: '',
        docNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activated, setActivated] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            // Use apiPost — reads token from localStorage (or no auth header needed for this public endpoint)
            const data = await apiPost('/api/auth/activate', {
                token,
                password: formData.password,
                profile: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    docType: formData.docType,
                    docNumber: formData.docNumber
                }
            });

            // Store session correctly (same keys as AuthContext / Login)
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            setActivated(true);

            // Redirect based on role — short delay so user sees success state
            setTimeout(() => {
                const role = data.user?.role;
                window.location.href = role === 'PLATFORM_ADMIN'
                    ? '/app/admin/clients'
                    : '/app/dashboard';
            }, 1500);

        } catch (err) {
            setError(err.message || 'Activation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
                    <p className="text-gray-600">No activation token provided in the URL.</p>
                </div>
            </div>
        );
    }

    if (activated) {
        return (
            <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={36} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-dark mb-2">Account Activated!</h2>
                    <p className="text-gray-500 text-sm">Redirecting you now…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-bg flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <span className="text-white text-2xl font-bold">OH</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-dark">Activate Account</h1>
                <p className="mt-2 text-sm text-gray-600 max-w-sm">
                    Set up your secure password and complete your profile to access One Horizon.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-gray-100">
                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={formData.docType}
                                onChange={e => setFormData({ ...formData, docType: e.target.value })}
                                placeholder="Passport, ID..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={formData.docNumber}
                                onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-medium text-text-dark mb-4">Security</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Activating Account…' : 'Activate & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};
