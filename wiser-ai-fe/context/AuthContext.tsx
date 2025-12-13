'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'MANAGER' | 'ADMIN';
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session
        const token = Cookies.get('accessToken');
        const userData = Cookies.get('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Failed to parse user data from cookie', e);
                Cookies.remove('accessToken');
                Cookies.remove('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (data: any) => {
        try {
            const res = await api.post('/auth/signin', data);
            console.log('DEBUG_LOGIN_RESPONSE:', res);

            // Robust extraction: Handle wrapped (NestJS Interceptor) or unwrapped response
            const body = res.data;
            const authData = body.data || body;

            console.log('DEBUG_AUTH_DATA_EXTRACTED:', authData);

            const { accessToken, refreshToken } = authData;

            if (!accessToken) {
                console.error('LOGIN_CRITICAL_ERROR: AccessToken is missing in response!');
                alert('Login Error: Server returned success but no token found.');
                return;
            }

            console.log('DEBUG_SETTING_COOKIE:', accessToken.substring(0, 15) + '...');
            Cookies.set('accessToken', accessToken, { expires: 1 });

            // Fetch Profile
            const profileRes = await api.get('/users/profile');
            const user = profileRes.data.data;

            // Normalize user data if needed (backend returns {id, email, roles...})
            // Our frontend expects 'role' (singular) for the context interface currently?
            // Interface says: role: 'USER' | 'MANAGER' | 'ADMIN';
            // Backend returns: roles: Role[]
            // We map: if includes ADMIN -> ADMIN, else MANAGER -> MANAGER, else USER.

            const roles = user.roles || [];
            let role = 'USER';
            if (roles.includes('ADMIN')) role = 'ADMIN';
            else if (roles.includes('MANAGER')) role = 'MANAGER';

            const userData = { ...user, role };

            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
            setUser(userData);
            router.push('/summary');
        } catch (error) {
            console.error('Login failed', error);
            throw error; // Re-throw to be handled by Login Page
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        }
        Cookies.remove('accessToken');
        Cookies.remove('user');
        setUser(null);
        router.push('/');
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            const user = res.data.data;
            const roles = user.roles || [];
            let role = 'USER';
            if (roles.includes('ADMIN')) role = 'ADMIN';
            else if (roles.includes('MANAGER')) role = 'MANAGER';

            const userData = { ...user, role };
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
            setUser(userData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, refreshProfile: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
