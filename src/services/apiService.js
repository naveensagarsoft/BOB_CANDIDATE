import axios from 'axios';
import { applyInterceptors } from './interceptor';

const RAZOR_BASE_URL=process.env.REACT_APP_RAZOR_BASE_URL;
const MASTER_BASE_URLs=process.env.REACT_APP_MASTER_BASE_URLs;
const CANDIDATE_BASE_URL = process.env.REACT_APP_CANDIDATE_BASE_URL;



const razorpayapi = axios.create({
  baseURL: RAZOR_BASE_URL,
  headers: {
    "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const mastersapi = axios.create({
  baseURL: MASTER_BASE_URLs,
  headers: {
    "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const candidateApi = axios.create({
  baseURL: CANDIDATE_BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  // timeout: 30000,
  withCredentials: true
});

const candidateApiMultipart = axios.create({
  baseURL: CANDIDATE_BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "multipart/form-data",
  },
  // timeout: 30000,
  withCredentials: true
});

const candidateApiWOContentType = axios.create({
  baseURL: CANDIDATE_BASE_URL,
  headers: {
    "X-Client": "candidate",
  },
  withCredentials: true
});

applyInterceptors(razorpayapi);
applyInterceptors(mastersapi);
applyInterceptors(candidateApi);
applyInterceptors(candidateApiMultipart);
applyInterceptors(candidateApiWOContentType);

export const apiService = {};
export {
  razorpayapi,
  mastersapi,
  candidateApi,
  candidateApiMultipart,
  candidateApiWOContentType
};

export default apiService;
