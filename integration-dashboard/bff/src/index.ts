import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { initWebSocket } from './ws/broadcaster';

import overviewRouter from './routes/overview';
import workforceRouter from './routes/workforce';
import payrollRouter from './routes/payroll';
import reportsRouter from './routes/reports';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'integration-dashboard-bff',
    timestamp: new Date().toISOString(),
    upstreams: {
      hr: config.hrApiUrl,
      payroll: config.payrollApiUrl,
    },
  });
});

// BFF routes
app.use('/bff/overview', overviewRouter);
app.use('/bff/workforce', workforceRouter);
app.use('/bff/payroll', payrollRouter);
app.use('/bff/reports', reportsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route không tồn tại' });
});

// Khởi động HTTP + WebSocket cùng 1 server
const server = http.createServer(app);
initWebSocket(server);

server.listen(config.port, () => {
  console.log(`\n🚀 BFF running on http://localhost:${config.port}`);
  console.log(`   Health: http://localhost:${config.port}/health`);
  console.log(`   HR API: ${config.hrApiUrl}`);
  console.log(`   Payroll API: ${config.payrollApiUrl}\n`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});