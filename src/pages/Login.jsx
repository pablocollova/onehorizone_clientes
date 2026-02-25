import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, User } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('Juan');
    const [password, setPassword] = useState('12345');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/app/dashboard');
        } catch (err) {
            setError('Invalid credentials. Try Juan / 12345');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-bg relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10"
            >
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 text-text-dark/50 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 pt-6">
                    <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
                    <p className="text-text-dark/60">Enter your credentials to access the platform</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    <div className="text-center text-xs text-text-dark/40 mt-4">
                        Demo Credentials: Juan / 12345
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
