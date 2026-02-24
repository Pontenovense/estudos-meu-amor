import { useMemo } from 'react';
import { useProgresso } from '../hooks/useProgresso';
import { useFlashcards } from '../hooks/useFlashcards';
import { BarChart3, Clock, Brain, Target, Flame, TrendingUp, Award } from 'lucide-react';

interface ProgressoPageProps { userId: string; }

export function ProgressoPage({ userId }: ProgressoPageProps) {
  const { progresso, getWeeklyHours, getStreak } = useProgresso(userId);
  const { flashcards } = useFlashcards(userId);

  const data = useMemo(() => {
    const weeklyData = getWeeklyHours();
    const totalWeeklyHours = weeklyData.reduce((sum: number, d: { horas: number }) => sum + d.horas, 0);
    const streak = getStreak();
    const totalMinutes = progresso.reduce((s, p) => s + p.minutos_estudados, 0);
    const totalFlashcardsReviewed = progresso.reduce((s, p) => s + p.flashcards_revisados, 0);
    const totalFlashcardsCorrect = progresso.reduce((s, p) => s + p.flashcards_acertos, 0);
    const totalPomodoroSessions = progresso.reduce((s, p) => s + p.sessoes_pomodoro, 0);
    const accuracyRate = totalFlashcardsReviewed > 0 ? Math.round((totalFlashcardsCorrect / totalFlashcardsReviewed) * 100) : 0;
    const totalFlashcards = flashcards.length;

    const monthlyData: { semana: string; horas: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      let weekHours = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date(); date.setDate(date.getDate() - (w * 7 + d));
        const dateStr = date.toISOString().split('T')[0];
        const dayP = progresso.find(p => p.data === dateStr);
        if (dayP) weekHours += dayP.minutos_estudados / 60;
      }
      monthlyData.push({ semana: `Sem ${4 - w}`, horas: Math.round(weekHours * 10) / 10 });
    }

    return { weeklyData, totalWeeklyHours, streak, totalMinutes, totalFlashcardsReviewed, accuracyRate, totalPomodoroSessions, totalFlashcards, monthlyData };
  }, [progresso, flashcards, getWeeklyHours, getStreak]);

  const totalHours = Math.round((data.totalMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="w-7 h-7 text-purple-500" /> Progresso</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe sua evolução nos estudos</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-slideUp">
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-purple-500" /></div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{totalHours}h</p>
          <p className="text-xs text-gray-500 mt-1">Total estudado</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3"><Flame className="w-5 h-5 text-orange-500" /></div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{data.streak}</p>
          <p className="text-xs text-gray-500 mt-1">Dias seguidos</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3"><Brain className="w-5 h-5 text-green-500" /></div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{data.totalFlashcardsReviewed}</p>
          <p className="text-xs text-gray-500 mt-1">Cards revisados</p>
        </div>
        <div className="glass-card p-4 md:p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3"><Target className="w-5 h-5 text-blue-500" /></div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{data.accuracyRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Taxa de acerto</p>
        </div>
      </div>

      <div className="glass-card p-5 md:p-6 animate-slideUp anim-delay-1">
        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-500" /> Horas de estudo por dia</h3>
        <div className="flex items-end gap-2 md:gap-4" style={{ height: '160px' }}>
          {data.weeklyData.map((d: { dia: string; horas: number }, i: number) => {
            const maxH = Math.max(...data.weeklyData.map((x: { horas: number }) => x.horas), 0.5);
            const height = (d.horas / maxH) * 100;
            const isToday = i === data.weeklyData.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500">{d.horas > 0 ? `${d.horas}h` : ''}</span>
                <div className={`w-full rounded-lg md:rounded-xl transition-all duration-700 ${isToday ? 'shadow-md' : ''}`}
                  style={{ height: `${d.horas > 0 ? Math.max(height, 8) : 8}%`, background: d.horas > 0 ? (isToday ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)') : '#f3e8ff', minHeight: '8px' }} />
                <span className={`text-[10px] md:text-xs font-medium ${isToday ? 'text-purple-600 font-bold' : 'text-gray-500'}`}>{d.dia}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slideUp anim-delay-2">
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Tendência mensal</h3>
          <div className="flex items-end gap-4 md:gap-6" style={{ height: '120px' }}>
            {data.monthlyData.map((w, i) => {
              const maxH = Math.max(...data.monthlyData.map(x => x.horas), 0.5);
              const height = (w.horas / maxH) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] md:text-xs font-semibold text-gray-500">{w.horas > 0 ? `${w.horas}h` : ''}</span>
                  <div className="w-full rounded-lg md:rounded-xl transition-all duration-500"
                    style={{ height: `${w.horas > 0 ? Math.max(height, 10) : 10}%`, background: w.horas > 0 ? 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)' : '#dbeafe', minHeight: '8px' }} />
                  <span className="text-[10px] md:text-xs text-gray-500 font-medium">{w.semana}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /> Conquistas</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Primeira sessão', done: data.totalPomodoroSessions > 0, icon: '🎯' },
              { label: '10 flashcards criados', done: data.totalFlashcards >= 10, icon: '🧠' },
              { label: '5 horas de estudo', done: totalHours >= 5, icon: '📚' },
              { label: 'Sequência de 3 dias', done: data.streak >= 3, icon: '🔥' },
              { label: '80% de acerto', done: data.accuracyRate >= 80 && data.totalFlashcardsReviewed > 0, icon: '⭐' },
              { label: 'Sequência de 7 dias', done: data.streak >= 7, icon: '🏆' },
              { label: '50 flashcards', done: data.totalFlashcards >= 50, icon: '💎' },
              { label: '20 horas de estudo', done: totalHours >= 20, icon: '🚀' },
            ].map((a, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${a.done ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100' : 'bg-gray-50/70 opacity-50'}`}>
                <span className="text-lg flex-shrink-0">{a.icon}</span>
                <span className={`text-sm font-medium flex-1 min-w-0 ${a.done ? 'text-gray-800' : 'text-gray-500'}`}>{a.label}</span>
                {a.done && <span className="text-xs text-green-500 font-bold flex-shrink-0">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
