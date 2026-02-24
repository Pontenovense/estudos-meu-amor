import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProgressoDiario } from '../types/database';

export function useProgresso(userId: string | undefined) {
  const [progresso, setProgresso] = useState<ProgressoDiario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('progresso_diario')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    setProgresso((data as ProgressoDiario[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getWeeklyHours = useCallback(() => {
    const result: { dia: string; horas: number }[] = [];
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayP = progresso.find(p => p.data === dateStr);
      result.push({
        dia: diasSemana[date.getDay()],
        horas: dayP ? Math.round((dayP.minutos_estudados / 60) * 10) / 10 : 0,
      });
    }
    return result;
  }, [progresso]);

  const getStreak = useCallback(() => {
    if (progresso.length === 0) return 0;
    const sorted = [...progresso].sort((a, b) => b.data.localeCompare(a.data));
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);
    const todayStr = today.toISOString().split('T')[0];
    const studiedToday = sorted.find(p => p.data === todayStr && p.minutos_estudados > 0);
    if (!studiedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      const studiedYesterday = sorted.find(p => p.data === yesterdayStr && p.minutos_estudados > 0);
      if (!studiedYesterday) return 0;
    }
    const startDate = new Date(studiedToday ? today : checkDate);
    for (let i = 0; i < 365; i++) {
      const dateStr = startDate.toISOString().split('T')[0];
      const p = sorted.find(pr => pr.data === dateStr && pr.minutos_estudados > 0);
      if (p) { streak++; startDate.setDate(startDate.getDate() - 1); }
      else break;
    }
    return streak;
  }, [progresso]);

  const addFlashcardReview = useCallback(async (acertou: boolean) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('progresso_diario')
      .select('*')
      .eq('user_id', userId)
      .eq('data', today)
      .limit(1);
    const prog = (existing as Array<{ id: string; flashcards_revisados: number; flashcards_acertos: number }>)?.[0];
    if (prog) {
      await supabase.from('progresso_diario').update({
        flashcards_revisados: prog.flashcards_revisados + 1,
        flashcards_acertos: prog.flashcards_acertos + (acertou ? 1 : 0),
      }).eq('id', prog.id);
    } else {
      await supabase.from('progresso_diario').insert({
        user_id: userId, data: today,
        minutos_estudados: 0, sessoes_pomodoro: 0,
        flashcards_revisados: 1,
        flashcards_acertos: acertou ? 1 : 0,
      });
    }
    await fetchAll();
  }, [userId, fetchAll]);

  const getTodayProgress = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return progresso.find(p => p.data === today) || {
      id: '', user_id: userId || '', data: today,
      minutos_estudados: 0, flashcards_revisados: 0,
      flashcards_acertos: 0, sessoes_pomodoro: 0,
    };
  }, [progresso, userId]);

  return { progresso, loading, getWeeklyHours, getStreak, addFlashcardReview, getTodayProgress, refresh: fetchAll };
}
