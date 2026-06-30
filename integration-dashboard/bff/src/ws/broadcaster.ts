import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { config } from '../config';
import { flushAll } from '../cache';
import { getHROverview } from '../services/hr.service';
import { getPayrollDashboard } from '../services/payroll.service';
import type { WSMessage } from '../types';

let wss: WebSocketServer | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] Client connected. Total:', wss!.clients.size);

    // Gửi ping ngay khi connect
    send(ws, { type: 'ping', timestamp: new Date().toISOString() });

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(String(msg));
        if (parsed.type === 'ping') {
          send(ws, { type: 'ping', timestamp: new Date().toISOString() });
        }
      } catch {
        // ignore bad messages
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected. Total:', wss!.clients.size);
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  // Bắt đầu polling định kỳ
  startPolling();
  console.log(`[WS] Server ready at ws://localhost:${config.port}/ws`);
}

function send(ws: WebSocket, msg: WSMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(msg: WSMessage): void {
  if (!wss) return;
  const payload = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

let lastHRHash = '';
let lastPayrollHash = '';

function startPolling(): void {
  if (pollTimer) clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    if (!wss || wss.clients.size === 0) return;

    try {
      const [hrRes, payrollRes] = await Promise.allSettled([
        getHROverview(),
        getPayrollDashboard(),
      ]);

      // Kiểm tra HR có thay đổi không
      if (hrRes.status === 'fulfilled') {
        const hash = JSON.stringify({
          total: hrRes.value.tong_nhan_vien,
          active: hrRes.value.dang_lam_viec,
          today: hrRes.value.cham_cong_hom_nay,
        });
        if (hash !== lastHRHash) {
          lastHRHash = hash;
          flushAll(); // xóa cache để FE lấy data mới
          broadcast({
            type: 'overview_update',
            data: { source: 'hr', summary: JSON.parse(hash) },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Kiểm tra Payroll có thay đổi không
      if (payrollRes.status === 'fulfilled') {
        const hash = JSON.stringify({
          total: payrollRes.value.totalSalaryExpected,
          ky: payrollRes.value.totalDepartments,
        });
        if (hash !== lastPayrollHash) {
          lastPayrollHash = hash;
          flushAll();
          broadcast({
            type: 'payroll_update',
            data: { source: 'payroll', summary: JSON.parse(hash) },
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('[WS] Poll error:', err instanceof Error ? err.message : err);
    }
  }, config.wsPollInterval);

  console.log(`[WS] Polling every ${config.wsPollInterval / 1000}s`);
}

export function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}