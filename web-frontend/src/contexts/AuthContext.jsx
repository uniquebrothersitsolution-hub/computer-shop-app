import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, data } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);

            return { success: true };
        } catch (error) {
            let errorMsg = 'Login failed';
            if (!error.response) {
                errorMsg = '📡 Backend unreachable. Please check your internet or Render status.';
            } else {
                errorMsg = error.response?.data?.message || 'Invalid username or password';
            }
            return {
                success: false,
                message: errorMsg
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!user,
        isOwner: user?.role === 'owner',
        isEmployee: user?.role === 'employee'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
