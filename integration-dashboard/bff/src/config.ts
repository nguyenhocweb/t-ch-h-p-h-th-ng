import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  hrApiUrl: process.env.HR_API_URL || 'http://localhost:8000/api',
  payrollApiUrl: process.env.PAYROLL_API_URL || 'http://localhost:5000/api',
  cacheTtl: parseInt(process.env.CACHE_TTL || '30', 10),
  wsPollInterval: parseInt(process.env.WS_POLL_INTERVAL || '15000', 10),
};