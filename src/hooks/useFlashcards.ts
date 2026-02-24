import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Flashcard } from '../types/database';

export function useFlashcards(userId: string | undefined) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    setFlashcards((data as Flashcard[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getByMateria = useCallback((materiaId: string) => {
    return flashcards.filter(f => f.materia_id === materiaId);
  }, [flashcards]);

  const create = useCallback(async (input: {
    materia_id: string; pergunta: string; resposta: string;
    criado_por_ia: boolean; nivel_dificuldade: string;
  }) => {
    if (!userId) return;
    await supabase.from('flashcards').insert({
      user_id: userId, ...input,
      vezes_revisado: 0, acertos: 0, erros: 0,
    });
    await fetchAll();
  }, [userId, fetchAll]);

  const createMany = useCallback(async (items: {
    materia_id: string; pergunta: string; resposta: string;
    criado_por_ia: boolean; nivel_dificuldade: string;
  }[]) => {
    if (!userId) return;
    const rows = items.map(item => ({
      user_id: userId, ...item,
      vezes_revisado: 0, acertos: 0, erros: 0,
    }));
    await supabase.from('flashcards').insert(rows);
    await fetchAll();
  }, [userId, fetchAll]);

  const recordReview = useCallback(async (id: string, acertou: boolean) => {
    const card = flashcards.find(f => f.id === id);
    if (!card) return;
    await supabase.from('flashcards').update({
      vezes_revisado: card.vezes_revisado + 1,
      acertos: card.acertos + (acertou ? 1 : 0),
      erros: card.erros + (acertou ? 0 : 1),
    }).eq('id', id);
    await fetchAll();
  }, [flashcards, fetchAll]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('flashcards').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  return { flashcards, loading, getByMateria, create, createMany, recordReview, remove, refresh: fetchAll };
}
