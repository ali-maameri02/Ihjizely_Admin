// api/users.ts
import axios from 'axios';
import { authService } from './auth';

export type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  profilePictureUrl: string;
};

// This matches your UserRow type from data-table.tsx
export type UserRow = {
  id: number;
  name: string;
  username: string;
  role: string;
  email: string;
  date: string;
  image: string;
};

export const usersService = {
  async getAllUsers(): Promise<UserRow[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<ApiUser[]>(`${import.meta.env.VITE_API_URL}/Users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      // Transform API data to match your UserRow type
      return response.data.map((user, index) => ({
        id: index + 1, // Generate sequential ID since API doesn't provide numeric ID
        name: `${user.firstName} ${user.lastName}`,
        username: user.phoneNumber, // Using phone as username
        role: user.role,
        email: `${user.phoneNumber}@example.com`, // Mock email
        date: new Date().toLocaleDateString(), // Mock date
        image: user.profilePictureUrl || ''
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw new Error('An unexpected error occurred');
    }
  },
  
};


