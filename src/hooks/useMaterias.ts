import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Materia } from '../types/database';

export function useMaterias(userId: string | undefined) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterias = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('materias')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    setMaterias((data as Materia[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchMaterias(); }, [fetchMaterias]);

  const create = useCallback(async (nome: string, descricao: string, cor: string) => {
    if (!userId) return;
    await supabase.from('materias').insert({
      user_id: userId, nome, descricao, cor_personalizada: cor,
    });
    await fetchMaterias();
  }, [userId, fetchMaterias]);

  const update = useCallback(async (id: string, updates: { nome?: string; descricao?: string; cor_personalizada?: string }) => {
    await supabase.from('materias').update(updates).eq('id', id);
    await fetchMaterias();
  }, [fetchMaterias]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('flashcards').delete().eq('materia_id', id);
    await supabase.from('anotacoes').delete().eq('materia_id', id);
    await supabase.from('planejamentos').delete().eq('materia_id', id);
    await supabase.from('materias').delete().eq('id', id);
    await fetchMaterias();
  }, [fetchMaterias]);

  const getById = useCallback((id: string) => {
    return materias.find(m => m.id === id);
  }, [materias]);

  return { materias, loading, create, update, remove, getById, refresh: fetchMaterias };
}
