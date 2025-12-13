import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            const authHeader = 'Bearer ' + token;
            console.log('API_INTERCEPTOR: Sending Auth Header:', authHeader.substring(0, 50) + '...');
            config.headers.Authorization = authHeader;
        } else {
            console.log('No token found in cookies');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear cookies and redirect to login if unauthorized
            Cookies.remove('accessToken');
            Cookies.remove('user');
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
