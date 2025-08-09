// locationsService.tsx
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const locationsService = {
  getAllLocations: async (): Promise<LocationRow[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Locations`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch locations');
      throw error;
    }
  },

  getLocationById: async (id: string): Promise<LocationRow> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Locations/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch location');
      throw error;
    }
  },

  addLocation: async (locationData: Omit<LocationRow, 'id'>): Promise<LocationRow> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/Locations`, locationData);
      toast.success('Location added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add location');
      throw error;
    }
  },

  updateLocation: async (id: string, locationData: Partial<LocationRow>): Promise<LocationRow> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/Locations/${id}`, locationData);
      toast.success('Location updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update location');
      throw error;
    }
  },

  deleteLocation: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/Locations/${id}`);
      toast.success('Location deleted successfully');
    } catch (error) {
      toast.error('Failed to delete location');
      throw error;
    }
  }
};

export interface LocationRow {
  id: string;
  city: string;
  state: string;
  country: string;
}