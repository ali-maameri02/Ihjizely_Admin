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

      return response.data.map((user, index) => ({
        id: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        username: user.phoneNumber,
        role: user.role,
        email: `${user.phoneNumber}@example.com`,
        date: new Date().toLocaleDateString(),
        image: user.profilePictureUrl || ''
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  async getUserById(userId: string): Promise<{
    [x: string]: string; firstName: string; lastName: string 
}> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<ApiUser>(`${import.meta.env.VITE_API_URL}/Users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      return {
        firstName: response.data.firstName,
        lastName: response.data.lastName
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};