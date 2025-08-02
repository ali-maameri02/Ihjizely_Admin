// api/wallets.ts
import axios from 'axios';
import { authService } from './auth';
import { usersService } from './UsersService';

export type Wallet = {
  walletId: string;
  userId: string;
  amount: number;
  currency: string;
};

export type WalletRow = {
  id: number;
  name: string;
  balance: string;
  registrationDate: string;
  email: string;
};

export const walletsService = {
    async getAllWallets(): Promise<WalletRow[]> {
        try {
          const token = authService.getAuthToken();
          if (!token) {
            throw new Error('No authentication token found');
          }
    
          const response = await axios.get<Wallet>(`${import.meta.env.VITE_API_URL}/Wallets/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': '*/*'
            }
          });
    
          if (!response.data) {
            throw new Error('No data returned from API');
          }
    
          // Since the API returns a single wallet, we'll create an array with one item
          const wallet = response.data;
          
          try {
            const userDetails = await usersService.getUserById(wallet.userId);
            return [{
              id: 1,
              name: `${userDetails.firstName} ${userDetails.lastName}`,
              balance: `${wallet.amount} ${wallet.currency}`,
              registrationDate: new Date().toLocaleDateString(),
              email: `${wallet.userId.substring(0, 8)}@example.com`
            }];
          } catch (error) {
            console.error(`Failed to fetch user details for wallet ${wallet.walletId}`, error);
            return [{
              id: 1,
              name: wallet.userId,
              balance: `${wallet.amount} ${wallet.currency}`,
              registrationDate: new Date().toLocaleDateString(),
              email: `${wallet.userId.substring(0, 8)}@example.com`
            }];
          }
        } catch (error: any) {
          console.error('Error in walletsService.getAllWallets:', error);
          
          let errorMessage = 'An unexpected error occurred';
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch wallets';
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          throw new Error(errorMessage);
        }
      },
  async getWalletByUserId(userId: string): Promise<Wallet> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<Wallet>(`${import.meta.env.VITE_API_URL}/Wallets/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch wallet');
      }
      throw new Error('An unexpected error occurred');
    }
  }
};