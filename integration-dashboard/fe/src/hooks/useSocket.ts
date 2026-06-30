'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BFF_WS_URL } from '@/lib/api';
import type { WSMessage, WSEventType } from '@/types';

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseSocketOptions {
  onMessage?: (msg: WSMessage) => void;
  onEvent?: (type: WSEventType, data: unknown) => void;
  autoReconnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { onMessage, onEvent, autoReconnect = true } = options;
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    try {
      const ws = new WebSocket(BFF_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus('connected');
        console.log('[WS] Connected to BFF');
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg: WSMessage = JSON.parse(event.data);
          setLastMessage(msg);
          onMessage?.(msg);
          if (msg.type !== 'ping') {
            onEvent?.(msg.type, msg.data);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus('disconnected');
        console.log('[WS] Disconnected from BFF');
        if (autoReconnect) {
          reconnectTimer.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setStatus('error');
        ws.close();
      };
    } catch {
      setStatus('error');
    }
  }, [onMessage, onEvent, autoReconnect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, lastMessage };
}