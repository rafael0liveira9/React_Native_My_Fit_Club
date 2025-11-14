import { useState, useCallback } from 'react';
import { CacheManager } from '@/lib/cache';
import { SyncQueue } from '@/lib/syncQueue';

interface UseOptimisticAPIOptions {
  cacheKey?: string;
  cacheTTL?: number; // minutos
  useQueue?: boolean; // usar fila de sincronização
  optimistic?: boolean; // atualizar UI imediatamente
}

export function useOptimisticAPI<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * GET request com cache
   */
  const get = useCallback(async (
    url: string,
    options: UseOptimisticAPIOptions = {}
  ): Promise<T | null> => {
    const { cacheKey, cacheTTL = 5 } = options;

    try {
      // Tentar carregar do cache primeiro
      if (cacheKey) {
        const cached = await CacheManager.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      const axios = (await import('axios')).default;
      const response = await axios.get(url);
      const responseData = response.data as T;

      setData(responseData);

      // Salvar no cache
      if (cacheKey) {
        await CacheManager.set(cacheKey, responseData, cacheTTL);
      }

      setLoading(false);
      return responseData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * POST/PUT request com fila e optimistic update
   */
  const mutate = useCallback(async (
    url: string,
    payload: any,
    options: UseOptimisticAPIOptions & { method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' } = {}
  ): Promise<T | null> => {
    const {
      method = 'POST',
      cacheKey,
      useQueue = true,
      optimistic = true,
      cacheTTL = 5
    } = options;

    try {
      // Optimistic update - atualizar UI imediatamente
      if (optimistic && payload) {
        setData(payload as T);
      }

      // Se usar fila, adicionar na fila e retornar imediatamente
      if (useQueue) {
        await SyncQueue.add({
          type: 'generic',
          endpoint: url,
          method,
          data: payload
        });

        setLoading(false);

        // Invalidar cache se existir
        if (cacheKey) {
          await CacheManager.remove(cacheKey);
        }

        return payload as T;
      }

      // Se não usar fila, fazer requisição normal
      setLoading(true);
      setError(null);

      const axios = (await import('axios')).default;
      const response = await axios({
        method,
        url,
        data: payload
      });

      const responseData = response.data as T;
      setData(responseData);

      // Atualizar cache
      if (cacheKey) {
        await CacheManager.set(cacheKey, responseData, cacheTTL);
      }

      setLoading(false);
      return responseData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setLoading(false);

      // Reverter optimistic update em caso de erro
      if (optimistic) {
        setData(null);
      }

      return null;
    }
  }, []);

  /**
   * Invalida o cache
   */
  const invalidateCache = useCallback(async (cacheKey: string) => {
    await CacheManager.remove(cacheKey);
  }, []);

  /**
   * Recarrega os dados do cache
   */
  const loadFromCache = useCallback(async (cacheKey: string) => {
    const cached = await CacheManager.get<T>(cacheKey);
    if (cached) {
      setData(cached);
    }
    return cached;
  }, []);

  return {
    data,
    loading,
    error,
    get,
    mutate,
    invalidateCache,
    loadFromCache,
    setData
  };
}
