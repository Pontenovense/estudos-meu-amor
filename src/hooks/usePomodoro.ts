import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SessaoPomodoro } from '../types/database';

export function usePomodoro(userId: string | undefined) {
  const [sessoes, setSessoes] = useState<SessaoPomodoro[]>([]);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('sessoes_pomodoro')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    setSessoes((data as SessaoPomodoro[]) || []);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const todaySessions = sessoes.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.data.startsWith(today) && s.tipo === 'foco';
  });

  const salvarSessao = useCallback(async (duracao: number, materiaId?: string) => {
    if (!userId) return;
    await supabase.from('sessoes_pomodoro').insert({
      user_id: userId,
      materia_id: materiaId || null,
      duracao,
      data: new Date().toISOString(),
      tipo: 'foco',
    });

    // Also update progresso_diario
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('progresso_diario')
      .select('*')
      .eq('user_id', userId)
      .eq('data', today)
      .limit(1);

    const prog = (existing as Array<{ id: string; minutos_estudados: number; sessoes_pomodoro: number }>)?.[0];
    if (prog) {
      await supabase.from('progresso_diario').update({
        minutos_estudados: prog.minutos_estudados + duracao,
        sessoes_pomodoro: prog.sessoes_pomodoro + 1,
      }).eq('id', prog.id);
    } else {
      await supabase.from('progresso_diario').insert({
        user_id: userId,
        data: today,
        minutos_estudados: duracao,
        sessoes_pomodoro: 1,
        flashcards_revisados: 0,
        flashcards_acertos: 0,
      });
    }

    await fetchAll();
  }, [userId, fetchAll]);

  return { sessoes, todaySessions, salvarSessao, refresh: fetchAll };
}
