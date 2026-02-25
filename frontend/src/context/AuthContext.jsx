import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        return new Promise((resolve, reject) => {
            // Mock network delay
            setTimeout(() => {
                if (username === 'Juan' && password === '12345') {
                    const userData = { name: 'Juan', role: 'client', avatar: 'https://ui-avatars.com/api/?name=Juan&background=0D8ABC&color=fff' };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
