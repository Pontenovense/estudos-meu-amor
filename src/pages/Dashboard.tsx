import { useMemo } from 'react';
import type { Page } from '../types/database';
import { useMaterias } from '../hooks/useMaterias';
import { useFlashcards } from '../hooks/useFlashcards';
import { useProgresso } from '../hooks/useProgresso';
import { useMotivacional } from '../hooks/useMotivacional';
import { usePlanejamentos } from '../hooks/usePlanejamentos';
import { Timer, Brain, BookOpen, Flame, Clock, Target, Sparkles, TrendingUp } from 'lucide-react';

interface DashboardProps {
  userId: string;
  userName: string;
  navigateTo: (page: Page) => void;
}

export function Dashboard({ userId, userName, navigateTo }: DashboardProps) {
  const { materias, getById } = useMaterias(userId);
  const { flashcards } = useFlashcards(userId);
  const { getWeeklyHours, getStreak, getTodayProgress } = useProgresso(userId);
  const { getDailyPhrase } = useMotivacional(userId);
  const { planejamentos } = usePlanejamentos(userId);

  const weeklyData = useMemo(() => getWeeklyHours(), [getWeeklyHours]);
  const totalWeeklyHours = useMemo(() => weeklyData.reduce((sum, d) => sum + d.horas, 0), [weeklyData]);
  const streak = useMemo(() => getStreak(), [getStreak]);
  const frase = useMemo(() => getDailyPhrase(), [getDailyPhrase]);
  const todayProgress = useMemo(() => getTodayProgress(), [getTodayProgress]);

  const today = new Date().toISOString().split('T')[0];
  const pendingPlans = useMemo(() =>
    planejamentos.filter(p => p.data === today && !p.concluido),
    [planejamentos, today]
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          {getGreeting()},{' '}
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{firstName}</span>! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Pronto(a) para mais um dia de estudos?</p>
      </div>

      <div className="glass-card p-5 md:p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-purple-100 animate-slideUp">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-700 italic leading-relaxed text-sm md:text-base">"{frase.texto}"</p>
            <p className="text-sm text-purple-500 mt-2 font-medium">— {frase.autor}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-slideUp anim-delay-1">
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{totalWeeklyHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-500 mt-1">Horas esta semana</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <Brain className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{flashcards.length}</p>
          <p className="text-xs text-gray-500 mt-1">Flashcards criados</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{streak}</p>
          <p className="text-xs text-gray-500 mt-1">Dias seguidos</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{todayProgress.sessoes_pomodoro}</p>
          <p className="text-xs text-gray-500 mt-1">Pomodoros hoje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 animate-slideUp anim-delay-2">
        <button onClick={() => navigateTo('pomodoro')} className="glass-card p-5 md:p-6 card-hover text-left group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center shadow-lg shadow-red-200 group-hover:scale-105 transition-transform flex-shrink-0">
              <Timer className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">Iniciar Pomodoro</h3>
              <p className="text-sm text-gray-500">Comece uma sessão de foco agora</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigateTo('flashcards')} className="glass-card p-5 md:p-6 card-hover text-left group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform flex-shrink-0">
              <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">Criar Flashcards</h3>
              <p className="text-sm text-gray-500">Manual ou com IA</p>
            </div>
          </div>
        </button>
      </div>

      <div className="glass-card p-5 md:p-6 animate-slideUp anim-delay-3">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Horas de estudo da semana
        </h3>
        <div className="flex items-end gap-2 md:gap-3" style={{ height: '150px' }}>
          {weeklyData.map((d, i) => {
            const maxH = Math.max(...weeklyData.map(x => x.horas), 0.5);
            const height = (d.horas / maxH) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] md:text-xs font-medium text-gray-500">
                  {d.horas > 0 ? `${d.horas}h` : ''}
                </span>
                <div className="w-full rounded-lg md:rounded-xl transition-all duration-500"
                  style={{
                    height: `${d.horas > 0 ? Math.max(height, 8) : 8}%`,
                    background: d.horas > 0 ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : '#f3e8ff',
                    minHeight: '8px',
                  }} />
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">{d.dia}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slideUp anim-delay-4">
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500" />
            Tarefas de hoje
          </h3>
          {pendingPlans.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Nenhuma tarefa pendente para hoje 🎉</p>
              <button onClick={() => navigateTo('planejamento')} className="text-sm text-purple-500 mt-2 hover:text-purple-700 transition-colors">
                Criar planejamento →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingPlans.slice(0, 5).map(p => {
                const materia = getById(p.materia_id);
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: materia?.cor_personalizada || '#8b5cf6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{p.titulo}</p>
                      <p className="text-xs text-gray-500">{p.duracao} min • {materia?.nome || 'Sem matéria'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Suas matérias
          </h3>
          {materias.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Nenhuma matéria cadastrada ainda</p>
              <button onClick={() => navigateTo('materias')} className="text-sm text-purple-500 mt-2 hover:text-purple-700 transition-colors">
                Adicionar matéria →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {materias.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                    style={{ backgroundColor: m.cor_personalizada }}>{m.nome.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{m.nome}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
