import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Report {
  id: string;
  userId: string;
  reason: string;
  content: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  value: T[];
  isSuccess: boolean;
  isFailure: boolean;
  error: {
    code: string;
    message: string;
  };
}

export const reportsService = {
  getAllReports: async (): Promise<Report[]> => {
    const response = await axios.get<ApiResponse<Report>>(`${API_BASE_URL}/Reports`);
    return response.data.value;
  },

  getReportById: async (id: string): Promise<Report> => {
    const response = await axios.get<Report>(`${API_BASE_URL}/Reports/${id}`);
    return response.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/Reports/${id}`);
  }
};