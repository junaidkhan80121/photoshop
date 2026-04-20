// API configuration loaded only from environment variables.
const API_BASE_URL = process.env.REACT_APP_API_URL?.trim();

if (!API_BASE_URL) {
  throw new Error(
    'Missing REACT_APP_API_URL. Define it in frontend .env or your deployment environment.'
  );
}

const buildUrl = (path) => `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  ADJUST: buildUrl('/adjust'),
  FILTER: buildUrl('/filter'),
  CROP: buildUrl('/crop'),
  ROTATE: buildUrl('/rotate'),
  FLIP: buildUrl('/flip'),
};

export default API_BASE_URL;
