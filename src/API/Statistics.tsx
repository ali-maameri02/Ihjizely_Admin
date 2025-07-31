import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface StatisticsData {
  totalUsers: number;
  businessOwners: number;
  clients: number;
  totalProperties: number;
  reserved: number;
}

export const fetchStatistics = async (token: string): Promise<StatisticsData> => {
  try {
    const [businessOwnersRes, clientsRes, propertiesRes] = await Promise.all([
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
      })
    ]);

    const businessOwnersCount = businessOwnersRes.data;
    const clientsCount = clientsRes.data;
    const totalUsers = businessOwnersCount + clientsCount;

    return {
      totalUsers,
      businessOwners: businessOwnersCount,
      clients: clientsCount,
      totalProperties: propertiesRes.data.length,
      reserved: 0 // TODO: Implement with actual endpoint
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw new Error('Failed to fetch statistics');
  }
};