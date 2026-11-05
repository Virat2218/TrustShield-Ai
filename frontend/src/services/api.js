import axios from 'axios';

// Support both same-origin reverse-proxy (/api) and external backend deployment (VITE_API_URL)
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.trim() === '' || envUrl.trim() === '/api') {
    return '/api';
  }
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Bearer token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustshield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to prevent HTML documents from being parsed as valid JSON responses
api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!DOCTYPE html>') || response.data.includes('<html'))
    ) {
      const err = new Error(
        'Backend API returned an HTML document instead of JSON. Ensure your live backend is running and VITE_API_URL is configured in your deployment settings.'
      );
      err.isConfigurationError = true;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (
      error.response &&
      typeof error.response.data === 'string' &&
      (error.response.data.includes('<!DOCTYPE html>') || error.response.data.includes('<html'))
    ) {
      error.message =
        'Backend API route could not be reached (received HTML page). Check VITE_API_URL and deployment routing.';
    }
    return Promise.reject(error);
  }
);

// Phase 1 APIs
export const analyzeMessage = async (message) => {
  const response = await api.post('/analyze-message', { message });
  return response.data;
};

export const analyzeUrl = async (url) => {
  const response = await api.post('/analyze-url', { url });
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Phase 2: Feature 1 - Screenshot Analyzer
export const analyzeScreenshot = async (file, manualText = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (manualText && manualText.trim()) {
    formData.append('manual_text', manualText.trim());
  }
  const response = await api.post('/analyze-screenshot', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Phase 2: Feature 2 - Fake News Verification
export const verifyNews = async (claim) => {
  const response = await api.post('/verify-news', { claim });
  return response.data;
};

// Phase 2: Feature 3 - Authentication
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const requestPasswordReset = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const confirmPasswordReset = resetPassword;

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

// Phase 2: Feature 4 - Scan History
export const getScanHistory = async (params = {}) => {
  const response = await api.get('/history', { params });
  return response.data;
};

export const getScanStats = async () => {
  const response = await api.get('/history/stats');
  return response.data;
};

export const getScanDetail = async (scanId) => {
  const response = await api.get(`/history/${scanId}`);
  return response.data;
};

export const deleteScanRecord = async (scanId) => {
  const response = await api.delete(`/history/${scanId}`);
  return response.data;
};

// Phase 2: Feature 5 - Downloadable PDF Reports
export const downloadPdfReport = async (payload) => {
  const response = await api.post('/generate-pdf', payload, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TrustShield-Report-${payload.report_type || 'scan'}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadScanPdf = async (scanId, scanType = 'scan') => {
  const response = await api.get(`/download-report/${scanId}`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TrustShield-${scanType}-Scan-${scanId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Phase 2: Feature 6 - AI Safety Chatbot
export const sendChatMessage = async (message, context = null, history = null) => {
  const response = await api.post('/chat', { message, context, history });
  return response.data;
};

// Phase 3: Feature 1 - Scam Awareness Quiz
export const getQuizCategories = async () => {
  const response = await api.get('/quiz/categories');
  return response.data;
};

export const getQuizQuestions = async (category = 'all', difficulty = 'Beginner', limit = 5) => {
  const response = await api.get('/quiz/questions', {
    params: { category, difficulty, limit },
  });
  return response.data;
};

export const submitQuiz = async (payload) => {
  const response = await api.post('/quiz/submit', payload);
  return response.data;
};

export const getQuizHistory = async () => {
  const response = await api.get('/quiz/history');
  return response.data;
};

// Phase 3: Feature 2 - Community Scam Reporting
export const submitCommunityReport = async (formData) => {
  const response = await api.post('/community/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getUserReports = async () => {
  const response = await api.get('/community/reports');
  return response.data;
};

export const getUserReportDetail = async (reportId) => {
  const response = await api.get(`/community/reports/${reportId}`);
  return response.data;
};

export const deleteUserReport = async (reportId) => {
  const response = await api.delete(`/community/reports/${reportId}`);
  return response.data;
};

export const getReportAttachmentBlobUrl = async (reportId) => {
  const response = await api.get(`/community/reports/${reportId}/attachment`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
};

// Phase 3: Feature 3 - Admin Dashboard
export const getAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getAdminUsers = async (search = '') => {
  const response = await api.get('/admin/users', {
    params: search ? { search } : {},
  });
  return response.data;
};

export const updateAdminUser = async (userId, data) => {
  const response = await api.patch(`/admin/users/${userId}`, data);
  return response.data;
};

export const getAdminReports = async (statusFilter = 'all') => {
  const response = await api.get('/admin/reports', {
    params: statusFilter ? { status_filter: statusFilter } : {},
  });
  return response.data;
};

export const moderateAdminReport = async (reportId, data) => {
  const response = await api.patch(`/admin/reports/${reportId}`, data);
  return response.data;
};

export const createAdminAlert = async (data) => {
  const response = await api.post('/admin/alerts', data);
  return response.data;
};

export const deleteAdminAlert = async (alertId) => {
  const response = await api.delete(`/admin/alerts/${alertId}`);
  return response.data;
};

export const createAdminQuizQuestion = async (data) => {
  const response = await api.post('/admin/quiz/questions', data);
  return response.data;
};

export const deleteAdminQuizQuestion = async (questionId) => {
  const response = await api.delete(`/admin/quiz/questions/${questionId}`);
  return response.data;
};

// Phase 3: Feature 4 - Scam Alerts Center
export const getPublicAlerts = async (params = {}) => {
  const response = await api.get('/alerts', { params });
  return response.data;
};

export const getPublicAlertDetail = async (alertId) => {
  const response = await api.get(`/alerts/${alertId}`);
  return response.data;
};

export const getAlertCategories = async () => {
  const response = await api.get('/alerts/categories');
  return response.data;
};

export default api;
