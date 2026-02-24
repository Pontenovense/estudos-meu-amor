import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FraseMotivacional } from '../types/database';

const defaultFrases = [
  { texto: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', autor: 'Robert Collier' },
  { texto: 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', autor: 'Nelson Mandela' },
  { texto: 'Não importa quão devagar você vá, desde que não pare.', autor: 'Confúcio' },
  { texto: 'O conhecimento é o único recurso que cresce quando compartilhado.', autor: 'Desconhecido' },
  { texto: 'Cada dia é uma nova oportunidade para aprender algo incrível.', autor: 'StudyFlow' },
  { texto: 'A persistência é o caminho do êxito.', autor: 'Charles Chaplin' },
  { texto: 'Você não precisa ser perfeito, precisa ser persistente.', autor: 'StudyFlow' },
  { texto: 'Estudar é investir em si mesmo. Não há melhor investimento.', autor: 'Benjamin Franklin' },
  { texto: 'A disciplina é a ponte entre seus objetivos e suas conquistas.', autor: 'Jim Rohn' },
  { texto: 'Acredite em você. Cada hora de estudo te aproxima dos seus sonhos.', autor: 'StudyFlow' },
  { texto: 'O futuro pertence àqueles que se preparam para ele hoje.', autor: 'Malcolm X' },
  { texto: 'Grandes conquistas começam com pequenos passos diários.', autor: 'StudyFlow' },
  { texto: 'A mente que se abre a uma nova ideia jamais volta ao seu tamanho original.', autor: 'Albert Einstein' },
  { texto: 'Sua dedicação de hoje é o seu sucesso de amanhã.', autor: 'StudyFlow' },
  { texto: 'Nunca é tarde demais para ser aquilo que sempre desejou ser.', autor: 'George Eliot' },
];

export function useMotivacional(userId: string | undefined) {
  const [frases, setFrases] = useState<FraseMotivacional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('frases_motivacionais')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('personalizada', { ascending: false });

    const fetched = (data as FraseMotivacional[]) || [];
    if (fetched.length === 0) {
      // Seed default phrases
      const rows = defaultFrases.map(f => ({
        texto: f.texto, autor: f.autor, personalizada: false, user_id: null,
      }));
      await supabase.from('frases_motivacionais').insert(rows);
      const { data: seeded } = await supabase
        .from('frases_motivacionais')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`);
      setFrases((seeded as FraseMotivacional[]) || []);
    } else {
      setFrases(fetched);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getDailyPhrase = useCallback(() => {
    if (frases.length === 0) {
      return { id: '0', user_id: null, texto: defaultFrases[0].texto, autor: defaultFrases[0].autor, personalizada: false };
    }
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % frases.length;
    return frases[index];
  }, [frases]);

  const create = useCallback(async (texto: string, autor: string) => {
    if (!userId) return;
    await supabase.from('frases_motivacionais').insert({
      user_id: userId, texto, autor, personalizada: true,
    });
    await fetchAll();
  }, [userId, fetchAll]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('frases_motivacionais').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const customPhrases = frases.filter(f => f.personalizada && f.user_id === userId);
  const defaultPhrasesList = frases.filter(f => !f.personalizada);

  return { frases, loading, getDailyPhrase, create, remove, customPhrases, defaultPhrases: defaultPhrasesList, refresh: fetchAll };
}
