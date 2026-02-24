import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Anotacao } from '../types/database';

export function useAnotacoes(userId: string | undefined) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('anotacoes')
      .select('*')
      .eq('user_id', userId)
      .order('data_atualizacao', { ascending: false });
    setAnotacoes((data as Anotacao[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getByMateria = useCallback((materiaId: string) => {
    return anotacoes.filter(a => a.materia_id === materiaId);
  }, [anotacoes]);

  const create = useCallback(async (input: {
    materia_id: string; titulo: string; conteudo: string;
  }) => {
    if (!userId) return;
    const now = new Date().toISOString();
    await supabase.from('anotacoes').insert({
      user_id: userId, ...input,
      data_criacao: now, data_atualizacao: now,
    });
    await fetchAll();
  }, [userId, fetchAll]);

  const update = useCallback(async (id: string, updates: {
    titulo?: string; conteudo?: string; materia_id?: string;
  }) => {
    await supabase.from('anotacoes').update({
      ...updates,
      data_atualizacao: new Date().toISOString(),
    }).eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('anotacoes').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  return { anotacoes, loading, getByMateria, create, update, remove, refresh: fetchAll };
}
