// API/StatisticsService.ts
import axios from 'axios';
// import { authService } from './auth';
import { reservationService } from './ReservationService';

const API_URL = import.meta.env.VITE_API_URL;

export interface StatisticsData {
  totalUsers: number;
  businessOwners: number;
  clients: number;
  totalProperties: number;
  reserved: number; // This will now represent confirmed bookings count
}

export const fetchStatistics = async (token: string): Promise<StatisticsData> => {
  try {
    const [businessOwnersRes, clientsRes, propertiesRes, allBookings] = await Promise.all([
      axios.get(`${API_URL}/Users/count-by-role?role=BusinessOwner`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      }),
      axios.get(`${API_URL}/Users/count-by-role?role=Client`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      }),
      axios.get(`${API_URL}/AllProperties/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      }),
      // Use reservationService to get all bookings
      reservationService.getAllBookings()
    ]);

    const businessOwnersCount = businessOwnersRes.data;
    const clientsCount = clientsRes.data;
    const totalUsers = businessOwnersCount + clientsCount;
    
    // Filter confirmed bookings from the reservationService response
    const confirmedBookingsCount = allBookings.filter(
      (booking) => booking.status === 'Confirmed'
    ).length;

    return {
      totalUsers,
      businessOwners: businessOwnersCount,
      clients: clientsCount,
      totalProperties: propertiesRes.data.length,
      reserved: confirmedBookingsCount // Using the actual confirmed bookings count
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw new Error('Failed to fetch statistics');
  }
};