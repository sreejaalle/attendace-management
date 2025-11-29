import { create } from 'zustand';
import api from '../utils/api';

const useDashboardStore = create((set) => ({
  employeeStats: null,
  managerStats: null,
  employees: [],
  isLoading: false,
  error: null,

  getEmployeeDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/dashboard/employee');
      set({ employeeStats: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getManagerDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/dashboard/manager');
      set({ managerStats: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getAllEmployees: async () => {
    try {
      const response = await api.get('/dashboard/employees');
      set({ employees: response.data.data });
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }
}));

export default useDashboardStore;
