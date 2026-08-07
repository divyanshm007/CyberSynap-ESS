import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { getAll, insert, update, remove, query } from '@/services/storage.service';
import type { DB } from '@/services/storage.service';
import toast from 'react-hot-toast';

type Collection = keyof DB;

export function useCRUD<T extends { id: string; createdAt?: string; updatedAt?: string }>(
  collection: Collection,
) {
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback((): T[] => getAll<T>(collection), [collection]);

  const fetchWhere = useCallback(
    (pred: (item: T) => boolean): T[] => query<T>(collection, pred),
    [collection],
  );

  const create = useCallback(
    (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const record = { ...data, id: uuid(), createdAt: now, updatedAt: now } as unknown as T;
        insert<T>(collection, record);
        return record;
      } finally {
        setLoading(false);
      }
    },
    [collection],
  );

  const edit = useCallback(
    (id: string, patch: Partial<T>): T => {
      setLoading(true);
      try {
        return update<T>(collection, id, patch);
      } finally {
        setLoading(false);
      }
    },
    [collection],
  );

  const destroy = useCallback(
    (id: string, successMsg?: string): void => {
      remove(collection, id);
      if (successMsg) toast.success(successMsg);
    },
    [collection],
  );

  return { fetchAll, fetchWhere, create, edit, destroy, loading };
}
