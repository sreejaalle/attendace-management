import { create } from 'zustand';
import api from '../utils/api';

const useAttendanceStore = create((set, get) => ({
  todayStatus: null,
  myHistory: [],
  mySummary: null,
  allAttendance: [],
  teamSummary: null,
  todayTeamStatus: null,
  isLoading: false,
  error: null,

  // Employee actions
  checkIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/attendance/checkin');
      set({ todayStatus: response.data.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-in failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/attendance/checkout');
      set({ todayStatus: response.data.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-out failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  getTodayStatus: async () => {
    try {
      const response = await api.get('/attendance/today');
      set({ todayStatus: response.data.data });
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  },

  getMyHistory: async (month, year) => {
    set({ isLoading: true });
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await api.get('/attendance/my-history', { params });
      set({ myHistory: response.data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getMySummary: async (month, year) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await api.get('/attendance/my-summary', { params });
      set({ mySummary: response.data.data });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  },

  // Manager actions
  getAllAttendance: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/attendance/all', { params: filters });
      set({ allAttendance: response.data.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getEmployeeAttendance: async (employeeId, month, year) => {
    set({ isLoading: true });
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      
      const response = await api.get(`/attendance/employee/${employeeId}`, { params });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  getTeamSummary: async (month, year, department) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (department) params.department = department;
      
      const response = await api.get('/attendance/summary', { params });
      set({ teamSummary: response.data.data });
    } catch (error) {
      console.error('Error fetching team summary:', error);
    }
  },

  getTodayTeamStatus: async () => {
    try {
      const response = await api.get('/attendance/today-status');
      set({ todayTeamStatus: response.data.data });
    } catch (error) {
      console.error('Error fetching team status:', error);
    }
  },

  exportAttendance: async (filters = {}) => {
    try {
      const response = await api.get('/attendance/export', { 
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Export failed' };
    }
  },

  clearError: () => set({ error: null })
}));

export default useAttendanceStore;
