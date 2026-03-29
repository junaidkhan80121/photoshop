// API Configuration
// Backend URL is loaded from environment variables

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  ADJUST: `${API_BASE_URL}/adjust`,
  FILTER: `${API_BASE_URL}/filter`,
  CROP: `${API_BASE_URL}/crop`,
  ROTATE: `${API_BASE_URL}/rotate`,
  FLIP: `${API_BASE_URL}/flip`,
};

export default API_BASE_URL;
