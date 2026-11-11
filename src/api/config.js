// Optional API base — most edits now run on the client for realtime feel.
// Backend remains available for heavier server-only ops if configured.
const API_BASE_URL = process.env.REACT_APP_API_URL?.trim() || '';

const buildUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : '');

export const API_ENDPOINTS = {
  ADJUST: buildUrl('/adjust'),
  FILTER: buildUrl('/filter'),
  CROP: buildUrl('/crop'),
  ROTATE: buildUrl('/rotate'),
  FLIP: buildUrl('/flip'),
};

export const hasApi = Boolean(API_BASE_URL);

export default API_BASE_URL;
