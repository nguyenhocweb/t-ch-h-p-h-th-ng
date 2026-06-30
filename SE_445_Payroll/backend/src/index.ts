import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import kyLuongRoutes from './routes/ky-luong.routes';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ky-luong', kyLuongRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
