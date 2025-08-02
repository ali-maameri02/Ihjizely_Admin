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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
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

  async updateBookingStatus(bookingId: string, status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'): Promise<Booking> {
    try {
      const token = authService.getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axios.patch<Booking>(
        `${API_URL}/Bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to update booking status');
    }
  },

  handleApiError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
  }
};