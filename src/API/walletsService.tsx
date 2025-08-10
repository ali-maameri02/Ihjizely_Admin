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
  walletId: string; // Add this
  name: string;
  balance: string;
  registrationDate: string;
  email: string;
};
export type AddFundsRequest = {
  walletId: string;  // Changed from walletId to userId
  amount: number;
  currency: string;
  description: string;
  paymentMethod?: 'Adfali' | 'PayPal' | 'Stripe' | 'Masarat'; // Made optional
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
            walletId: wallet.walletId, // Add this line
            name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Unknown User',
            balance: `${wallet.amount} ${wallet.currency}`,
            registrationDate: new Date().toLocaleDateString(),
            email: userDetails.email || `${wallet.userId.substring(0, 8)}@example.com`
          });
        } catch (userError) {
          console.error(`Failed to fetch user details for wallet ${wallet.walletId}`, userError);
          walletRows.push({
            id: this.convertUserIdToNumber(wallet.userId),
            walletId: wallet.walletId, // Add this line
            name: 'Unknown User',
            balance: `${wallet.amount} ${wallet.currency}`,
            registrationDate: new Date().toLocaleDateString(),
            email: `${wallet.userId.substring(0, 8)}@example.com`
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
  
      // Validate the request
      if (!request.walletId) {
        throw new Error('Wallet ID is required');
      }
      if (isNaN(request.amount) || request.amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
  
      const url = `${import.meta.env.VITE_API_URL}/Transactions/admin/add-funds/${request.walletId}`;
  
      const response = await axios.post<TransactionResponse>(
        url,
        {
          amount: request.amount,
          currency: request.currency || 'LYD',
          description: request.description || 'Admin funds addition'
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
        let errorMessage = 'Failed to add funds';
        
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = 'Wallet not found';
              break;
            case 401:
              errorMessage = 'Unauthorized';
              break;
            case 400:
              errorMessage = error.response.data?.message || 'Invalid request data';
              break;
            default:
              errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      throw new Error('An unexpected error occurred');
    }
  },

  convertUserIdToNumber(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
};