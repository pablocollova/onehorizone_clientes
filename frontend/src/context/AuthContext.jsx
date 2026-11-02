import React, { createContext, useContext, useState } from 'react';
import { apiPost } from '../lib/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const loading = false;
    const [logoutError, setLogoutError] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    const login = async (username, password) => {
        const data = await apiPost('/api/auth/login', { username, password });
        const userData = data.user;
        const newToken = data.token;
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', newToken);
        return userData;
    };

    const logout = async () => {
        setLogoutError(null);
        setLoggingOut(true);
        try {
            if (localStorage.getItem('token')) await apiPost('/api/auth/logout', {});
        } catch (error) {
            if (error.status !== 401) {
                setLogoutError('No pudimos revocar la sesión. Comprobá la conexión e intentá de nuevo.');
                return;
            }
        } finally {
            setLoggingOut(false);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    /** Always returns the freshest token from localStorage */
    const getToken = () => localStorage.getItem('token');

    return (
        <AuthContext.Provider value={{ user, token, login, logout, logoutError, loggingOut, loading, getToken }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
