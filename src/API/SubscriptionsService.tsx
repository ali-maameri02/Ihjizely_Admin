import axios from 'axios';
import { authService } from './auth';

export type SubscriptionPlan = {
  id: string;
  name: string;
  duration: string; // Backend returns this as TimeSpan
  amount: number;
  currency: string;
  isActive: boolean;
  maxAds?: number;
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
export type UserDetails = {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    isVerified: boolean;
  };
  
export const subscriptionsService = {

    async getUserDetails(userId: string): Promise<UserDetails> {
        try {
          const token = authService.getAuthToken();
          if (!token) throw new Error('No authentication token found');
          
          const response = await axios.get<UserDetails>(
            `${import.meta.env.VITE_API_URL}/Users/${userId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }
          );
          
          return response.data;
        } catch (error) {
          throw this.handleApiError(error, 'Failed to fetch user details');
        }
      },
    
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

  async getSubscriptionsWithPlans(): Promise<(Subscription & { planName: string })[]> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const subscriptionsWithPlans = await Promise.all(
        subscriptions.map(async (sub) => {
          const plan = await this.getPlanById(sub.planId);
          return {
            ...sub,
            planName: plan.name
          };
        })
      );
      return subscriptionsWithPlans;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch subscriptions with plans');
    }
  },

  handleApiError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
  },

  

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.get<SubscriptionPlan[]>(
        `${import.meta.env.VITE_API_URL}/Subscriptions/plans`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Plans response:', response); // Add logging
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error); // Detailed error logging
      throw this.handleApiError(error, 'Failed to fetch plans');
    }
  },
  
// In SubscriptionsService.tsx, update the createPlan method:
// In SubscriptionsService.tsx, update the createPlan and updatePlan methods:

// Update the createPlan method:
async createPlan(newPlan: {
  name: string;
  durationInDays: number; // Change to number
  amount: number;
  currency: string;
  maxAds?: number;
}): Promise<SubscriptionPlan> {
  try {
    const token = authService.getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    const response = await axios.post<SubscriptionPlan>(
      `${import.meta.env.VITE_API_URL}/Subscriptions/plans`,
      newPlan, // Send the object directly as it matches the API schema
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw this.handleApiError(error, 'Failed to create plan');
  }
},

// Update the updatePlan method:
async updatePlan(planId: string, updates: {
  name?: string;
  durationInDays?: number;
  amount?: number;
  currency?: string;
  maxAds?: number;
}): Promise<SubscriptionPlan> {
  try {
    const token = authService.getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    // Create full plan object including planId as required by API
    const requestBody = {
      planId: planId, // Include planId as required by PATCH endpoint
      ...updates
    };
    
    const response = await axios.patch<SubscriptionPlan>(
      `${import.meta.env.VITE_API_URL}/Subscriptions/plans/${planId}`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw this.handleApiError(error, 'Failed to update plan');
  }
},
// Add this method to the subscriptionsService object in SubscriptionsService.tsx
async deletePlan(planId: string): Promise<void> {
  try {
    const token = authService.getAuthToken();
    if (!token) throw new Error('No authentication token found');
    
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/Subscriptions/plans/${planId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
  } catch (error) {
    throw this.handleApiError(error, 'Failed to delete plan');
  }
}
};



