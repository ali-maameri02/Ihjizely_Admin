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
  walletId: string;
};

export type AddFundsRequest = {
  walletId: string;  // Add this

  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'Adfali' | 'PayPal' | 'Stripe' | 'Masarat';
};

export type TransactionResponse = {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  timestamp: string;
  description: string;
};

export const walletsService = {
  async getAllWallets(): Promise<WalletRow[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<Wallet[]>(`${import.meta.env.VITE_API_URL}/Wallets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data returned from API');
      }

      const wallets = response.data;
      const walletRows: WalletRow[] = [];

      for (const wallet of wallets) {
        try {
          const userDetails = await usersService.getUserById(wallet.userId);
          walletRows.push({
            id: this.convertUserIdToNumber(wallet.userId),
            name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Unknown User',
            balance: `${wallet.amount} ${wallet.currency}`,
            registrationDate: new Date().toLocaleDateString(),
            email: userDetails.email || `${wallet.userId.substring(0, 8)}@example.com`,
            walletId: wallet.walletId
          });
        } catch (userError) {
          console.error(`Failed to fetch user details for wallet ${wallet.walletId}`, userError);
          walletRows.push({
            id: this.convertUserIdToNumber(wallet.userId),
            name: 'Unknown User',
            balance: `${wallet.amount} ${wallet.currency}`,
            registrationDate: new Date().toLocaleDateString(),
            email: `${wallet.userId.substring(0, 8)}@example.com`,
            walletId: wallet.walletId
          });
        }
      }

      return walletRows;
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
  },

  async addFunds(request: AddFundsRequest): Promise<TransactionResponse> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await axios.post<TransactionResponse>(
        `${import.meta.env.VITE_API_URL}/Wallets/add-funds`, // Use walletId in URL
        {
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          paymentMethod: request.paymentMethod
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to add funds');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // Helper function to convert string ID to number
   convertUserIdToNumber(userId: string): number {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
};