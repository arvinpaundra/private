/**
 * API Client for backend communication
 * Provides a centralized axios wrapper with error handling
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { deleteSession, getToken } from './auth';
import { redirect } from 'next/navigation';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  errors?: Array<Record<string, string>>;
  meta: {
    code: number;
    message: string;
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
    public errors?: Array<Record<string, string>>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token from cookies
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Make an API request to the backend
 */
export async function apiRequest<T = any>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>({
      url: endpoint,
      ...config,
    });

    // Extract data from wrapped response
    return response.data.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const data = axiosError.response?.data;
      const status = axiosError.response?.status;

      // Handle 400 errors - return errors array if exists, otherwise meta.message
      if (status === 400) {
        const errors =
          data?.errors && Array.isArray(data.errors) ? data.errors : undefined;
        const errorMessage = data?.meta?.message || 'Permintaan tidak valid.';
        throw new ApiError(errorMessage, status, data, errors);
      }

      // Handle 401 errors - unauthorized, clear session and redirect to login
      if (status === 401) {
        await deleteSession();
        redirect('/login');
      }

      // Get error from meta.message or fallback for other status codes
      const errorMessage =
        data?.meta?.message ||
        axiosError.message ||
        `HTTP error! status: ${status}`;

      throw new ApiError(errorMessage, status, data);
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error
        ? error.message
        : 'Wah, ada yang aneh nih! Coba lagi ya.',
      undefined,
      error
    );
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      data: body,
    }),

  put: <T = any>(endpoint: string, body?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      data: body,
    }),

  patch: <T = any>(endpoint: string, body?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      data: body,
    }),

  delete: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
};

export { ApiError, axiosInstance };
