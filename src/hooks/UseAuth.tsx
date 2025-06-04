import { useState, useEffect } from 'react';
import type { User } from '../types/User';

const TOKEN_KEY = 'jwt_token';



function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            const payload = parseJwt(token);
            if (payload) {
                setUser({
                    id: typeof payload.id === 'number' ? payload.id : 0,
                    username: typeof payload.sub === 'string' ? payload.sub : '',
                    roles: Array.isArray(payload.roles) ? payload.roles as string[] : [],
                });
            } else {
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        const payload = parseJwt(token);
        if (payload) {
            setUser({
                id: typeof payload.id === 'number' ? payload.id : 0,
                username: typeof payload.sub === 'string' ? payload.sub : '',
                roles: Array.isArray(payload.roles) ? payload.roles as string[] : [],
            });
        }
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    };

    const isAuthenticated = !!user;

    return { user, isAuthenticated, login, logout, loading };
}