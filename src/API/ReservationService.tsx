// Updated ReservationService.ts
import axios from 'axios';
import { authService } from './auth';
import { unitsService } from './UnitsService';

const API_URL = import.meta.env.VITE_API_URL;

export interface PropertyDetails {
  id: string;
  title: string;
  type: string;
  subtype?: string;
  images?: { url: string }[]; // Changed from 'image' to 'images' array
  roomNumber?: string; // Added roomNumber
}

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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
  reservedAt: string;
  propertyDetails?: PropertyDetails;
}

export const reservationService = {
  async getAllBookings(): Promise<Booking[]> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get<Booking[]>(`${API_URL}/Bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const bookingsWithDetails = await Promise.all(
        response.data.map(async (booking) => {
          try {
            const property = await unitsService.getUnitById(booking.propertyId);
            return {
              ...booking,
              propertyDetails: {
                id: property.id,
                title: property.title,
                type: property.type,
                subtype: property.details?.subType,
                images: property.images,
                roomNumber: property.details?.roomNumber
              }
            };
          } catch (error) {
            console.error(`Failed to fetch property details for ${booking.propertyId}`, error);
            return booking;
          }
        })
      );

      return bookingsWithDetails.sort((a, b) => 
        new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime() 
      );
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch bookings');
    }
  },

  async getRecentBookings(): Promise<Booking[]> {
    const allBookings = await this.getAllBookings();
    return allBookings.slice(0, 3); // Return only the 5 most recent bookings
  },

  async updateBookingStatus(bookingId: string, newStatus: 'Pending' | 'Confirmed' | 'Rejected' | 'Completed'): Promise<Booking> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');

      // Validate the booking ID is a valid UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingId)) {
        throw new Error('Invalid booking ID format');
      }

      const response = await axios.patch<Booking>(
        `${API_URL}/Bookings/${bookingId}/status`,
        { newStatus }, // Make sure this matches exactly what the API expects
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
console.log(response.data)
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error Details:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to update booking status');
      }
      throw error;
    }
  },
  handleApiError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
  }
};