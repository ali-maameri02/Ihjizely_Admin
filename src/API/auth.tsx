import axios from 'axios';

// Define types for your API responses and data
type LoginCredentials = {
  phoneNumber: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/Users/login', credentials);
      
      // Save token to localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Decode token to get user info (you might want to use jwt-decode library)
        // For now, we'll just store the raw token
      }
      
      return response.data;
    } catch (error) {
      // Handle error appropriately
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  logout(): void {
    // Clear authentication data from localStorage
    localStorage.removeItem('accessToken');
    // You might have other items to clear
  },

  getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  },
};