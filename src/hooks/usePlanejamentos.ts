import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Planejamento } from '../types/database';

export function usePlanejamentos(userId: string | undefined) {
  const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('planejamentos')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true });
    setPlanejamentos((data as Planejamento[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getByWeek = useCallback((start: string, end: string) => {
    return planejamentos.filter(p => p.data >= start && p.data <= end);
  }, [planejamentos]);

  const create = useCallback(async (input: {
    materia_id: string; titulo: string; data: string; duracao: number;
  }) => {
    if (!userId) return;
    await supabase.from('planejamentos').insert({
      user_id: userId, ...input, concluido: false,
    });
    await fetchAll();
  }, [userId, fetchAll]);

  const update = useCallback(async (id: string, updates: { concluido?: boolean; titulo?: string; duracao?: number }) => {
    await supabase.from('planejamentos').update(updates).eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('planejamentos').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  return { planejamentos, loading, getByWeek, create, update, remove, refresh: fetchAll };
}
