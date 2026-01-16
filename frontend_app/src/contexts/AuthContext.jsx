import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user details
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data);
                    }
                } catch (error) {
                    console.error("Session expired or invalid:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', { email, password });
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { token } = response.data;
                const user = response.data.data.user; // Correctly access nested user object
                localStorage.setItem('token', token);
                setUser(user);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Login failed:", error.response?.data);
            let errorMessage = error.response?.data?.message || 'Login failed. Please check credentials.';

            // Append validation errors if present
            if (error.response?.data?.errors) {
                const validationMessages = error.response.data.errors.map(e => e.msg).join(', ');
                errorMessage += `: ${validationMessages}`;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
