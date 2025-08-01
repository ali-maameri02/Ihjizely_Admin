import axios from 'axios';
import { authService } from './auth';
import { unitsService } from './UnitsService';

const API_URL = import.meta.env.VITE_API_URL;

export interface Booking {
  id: string;
  clientId: string;
  name: string;
  phoneNumber: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: string;
  status: string;
  reservedAt: string;
  propertyDetails?: PropertyDetails; // Add this new interface
}

export interface PropertyDetails {
  id: string;
  title: string;
  type: string;
  subtype?: string;
  roomNumber?: string;
  images?: Array<{ url: string }>;
}

export const reservationService = {
  async getAllBookings(): Promise<Booking[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<Booking[]>(`${API_URL}/Bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      // Fetch property details for each booking
      const bookingsWithDetails = await Promise.all(
        response.data.map(async (booking) => {
          try {
            const property = await unitsService.getUnitById(booking.propertyId);
            return {
              ...booking,
              propertyDetails: this.transformPropertyToDetails(property)
            };
          } catch (error) {
            console.error(`Failed to fetch property details for ${booking.propertyId}:`, error);
            return booking; // Return booking without details if fetch fails
          }
        })
      );

      // Sort by reservedAt (newest first)
      return bookingsWithDetails.sort((a, b) => 
        new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  async getRecentBookings(limit = 2): Promise<Booking[]> {
    const bookings = await this.getAllBookings();
    return bookings.slice(0, limit);
  },

  transformPropertyToDetails(property: any): PropertyDetails {
    return {
      id: property.id,
      title: property.title,
      type: property.type,
      subtype: property.details?.subType || property.details?.type,
      roomNumber: property.details?.roomNumber || property.details?.unitNumber,
      images: property.images
    };
  }
};