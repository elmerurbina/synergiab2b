import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 15000,
    headers: {
        Accept: 'application/json',
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // Add JWT token if exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle Content-Type for FormData
        if (config.data instanceof FormData) {
            // Let the browser set the Content-Type header with the correct boundary
            delete config.headers['Content-Type'];
            console.log('📸 FormData detected, removed Content-Type header');
            
            // Debug: Log FormData contents
            if (process.env.NODE_ENV === 'development') {
                for (let pair of config.data.entries()) {
                    console.log(`FormData: ${pair[0]} =`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
                }
            }
        } else if (config.data && typeof config.data === 'object') {
            config.headers['Content-Type'] = 'application/json';
            console.log('📝 JSON request:', config.data);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token refresh
        if (
            error.response?.status === 401 &&
            !originalRequest.url.includes('/auth/refresh/') &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axiosInstance.post('/auth/refresh/', {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // Save new token
                localStorage.setItem('access_token', access);

                // Update header for next requests
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;

                processQueue(null, access);

                return axiosInstance(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                // Clear session
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                // Redirect to login only if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 415 Unsupported Media Type - Debug
        if (error.response?.status === 415) {
            console.error('❌ 415 Error - Unsupported Media Type');
            console.error('Request Content-Type:', originalRequest.headers['Content-Type']);
            console.error('Request data type:', originalRequest.data instanceof FormData ? 'FormData' : typeof originalRequest.data);
            console.error('Full request config:', originalRequest);
        }

        // Handle 400 Bad Request - Validation errors
        if (error.response?.status === 400) {
            console.error('❌ 400 Error - Validation Failed');
            console.error('Error details:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;