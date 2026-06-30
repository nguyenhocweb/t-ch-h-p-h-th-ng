import NodeCache from 'node-cache';
import { config } from './config';

const cache = new NodeCache({ stdTTL: config.cacheTtl, checkperiod: 10 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, ttl ?? config.cacheTtl);
}

export function deleteCached(key: string): void {
  cache.del(key);
}

export function flushAll(): void {
  cache.flushAll();
}