'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/lib/api';

interface UseBFFOptions<T> {
  fetcher: () => Promise<T>;
  refreshInterval?: number;
  deps?: unknown[];
}

interface UseBFFResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastFetchedAt: Date | null;
}

export function useBFF<T>(
  optionsOrFetcher: UseBFFOptions<T> | (() => Promise<T>),
  deps?: unknown[],
  refreshInterval?: number,
): UseBFFResult<T> {
  const isFunction = typeof optionsOrFetcher === 'function';
  const fetcher = isFunction ? optionsOrFetcher : optionsOrFetcher.fetcher;
  const resolvedDeps = isFunction ? (deps ?? []) : (optionsOrFetcher.deps ?? []);
  const resolvedInterval = isFunction
    ? (refreshInterval ?? 0)
    : (optionsOrFetcher.refreshInterval ?? 0);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ← Dùng ref để giữ fetcher, tránh tạo mới mỗi render
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(); // ← gọi qua ref
      if (mountedRef.current) {
        setData(result as T);
        setLastFetchedAt(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Unknown error'
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resolvedDeps); // ← bỏ fetcher khỏi deps, chỉ giữ resolvedDeps

  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    if (resolvedInterval > 0) {
      timerRef.current = setInterval(doFetch, resolvedInterval);
    }
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [doFetch, resolvedInterval]);

  return { data, loading, error, refresh: doFetch, lastFetchedAt };
}