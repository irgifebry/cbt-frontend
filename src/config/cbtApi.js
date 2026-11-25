import axios from 'axios';
import { mapCbtError } from '../lib/cbtErrors.js';

// Klien terpisah untuk cbt-api. Tidak memasang interceptor Bearer:
// pada fase ini identitas peserta memakai ID sampel, bukan token LMS.
const cbtApi = axios.create({
  baseURL: import.meta.env.VITE_CBT_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

cbtApi.interceptors.response.use(
  (response) => response,
  (error) => {
    throw mapCbtError(error);
  },
);

export default cbtApi;
