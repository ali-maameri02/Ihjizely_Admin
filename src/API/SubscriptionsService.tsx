import axios from 'axios';
import { authService } from './auth';

export type SubscriptionPlan = {
  id: string;
  name: string;
  duration: string;
  amount: number;
  currency: string;
  isActive: boolean;
};

export type Subscription = {
  id: string;
  businessOwnerId: string;
  planId: string;
  startDate: string;
  endDate: string;
  price: {
    amount: number;
    currencyCode: string;
    currency: {
      code: string;
    };
  };
  maxAds: number;
  usedAds: number;
  isActive: boolean;
  hasAdQuota: boolean;
};

export const subscriptionsService = {
  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.get<Subscription[]>(
        `${import.meta.env.VITE_API_URL}/Subscriptions/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch subscriptions');
    }
  },

  async getPlanById(planId: string): Promise<SubscriptionPlan> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.get<{
        value: SubscriptionPlan;
        isSuccess: boolean;
        isFailure: boolean;
        error: { code: string; message: string };
      }>(
        `${import.meta.env.VITE_API_URL}/Subscriptions/plans/${planId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.error.message || 'Failed to fetch plan');
      }
      
      return response.data.value;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch subscription plan');
    }
  },

  async getSubscriptionsByOwner(ownerId: string): Promise<Subscription[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const allSubscriptions = await this.getAllSubscriptions();
      return allSubscriptions.filter(sub => sub.businessOwnerId === ownerId);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch subscriptions by owner');
    }
  },

  async getActiveSubscription(ownerId: string): Promise<Subscription | null> {
    try {
      const subscriptions = await this.getSubscriptionsByOwner(ownerId);
      const now = new Date();
      
      return subscriptions.find(sub => {
        const start = new Date(sub.startDate);
        const end = new Date(sub.endDate);
        return start <= now && end >= now && sub.isActive;
      }) || null;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch active subscription');
    }
  },

  handleApiError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
  }
};