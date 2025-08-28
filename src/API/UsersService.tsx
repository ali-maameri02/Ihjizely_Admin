// api/users.ts
import axios from 'axios';
import { authService } from './auth';

export type ApiUser = {
  [x: string]: any;
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  profilePictureUrl: string;
  isBlocked: boolean;
};

export type UserRow = {
  id: string;
  name: string;
  username: string;
  role: string;
  email: string;
  date: string;
  image: string;
  isBlocked: boolean;
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
  
      return response.data.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.phoneNumber,
        role: user.role,
        email: `${user.phoneNumber}@example.com`,
        date: new Date().toLocaleDateString(),
        image: user.profilePictureUrl || '',
        isBlocked: user.isBlocked
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
  },

// In your usersService.ts
// api/users.ts
async blockUser(userId: string): Promise<void> {
  try {
    const token = authService.getAuthToken();
    if (!token) throw new Error('No authentication token found');

    // First try direct block
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/Users/${userId}/report-violation`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status >= 200 && response.status < 300) {
        return; // Success
      }
    } catch (directError) {
      console.log('Direct block failed, trying report-violation');
      // If direct block fails, try report-violation
      await this.reportUserViolation(userId, "Admin requested block");
    }
  } catch (error) {
    console.error('Block user error:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to block user'
        : 'An unexpected error occurred'
    );
  }
},

async reportUserViolation(userId: string, reason: string): Promise<void> {
  try {
    const token = authService.getAuthToken();
    if (!token) throw new Error('No authentication token found');

    // Remove UUID validation since backend may accept different formats
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/Users/${userId}/report-violation`,
      { reason },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Report violation error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error('Invalid user ID - please try again');
      }
      throw new Error(error.response?.data?.message || 'Failed to report violation');
    }
    throw new Error('An unexpected error occurred');
  }
},

  async unblockUser(userId: string): Promise<void> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/Users/${userId}/unblock`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to unblock user');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/Users/${userId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'

          }
        }
      );

      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};