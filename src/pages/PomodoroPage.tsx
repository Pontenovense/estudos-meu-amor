import { useState, useEffect, useRef, useCallback } from 'react';
import { useMaterias } from '../hooks/useMaterias';
import { usePomodoro } from '../hooks/usePomodoro';
import { Timer, Play, Pause, RotateCcw, Settings, Coffee, Brain } from 'lucide-react';

interface PomodoroPageProps { userId: string; }
type TimerState = 'idle' | 'running' | 'paused';
type TimerMode = 'foco' | 'pausa';

export function PomodoroPage({ userId }: PomodoroPageProps) {
  const [focoDuration, setFocoDuration] = useState(25);
  const [pausaDuration, setPausaDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [state, setState] = useState<TimerState>('idle');
  const [mode, setMode] = useState<TimerMode>('foco');
  const [currentCompleted, setCurrentCompleted] = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { materias } = useMaterias(userId);
  const { todaySessions, salvarSessao } = usePomodoro(userId);

  const totalDuration = mode === 'foco' ? focoDuration * 60 : pausaDuration * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completeSession = useCallback(() => {
    if (mode === 'foco') {
      salvarSessao(focoDuration, selectedMateria || undefined);
      setCurrentCompleted(c => c + 1);
      alert('Sessão de foco concluída! Hora da pausa.');
      setMode('pausa');
      setTimeLeft(pausaDuration * 60);
      setState('idle');
    } else {
      alert('Pausa concluída! Pronto para focar novamente.');
      setMode('foco');
      setTimeLeft(focoDuration * 60);
      setState('idle');
    }
  }, [mode, focoDuration, pausaDuration, selectedMateria, salvarSessao]);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { if (intervalRef.current) clearInterval(intervalRef.current); completeSession(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state, completeSession]);

  const start = () => setState('running');
  const pause = () => setState('paused');
  const reset = () => { setState('idle'); setTimeLeft(mode === 'foco' ? focoDuration * 60 : pausaDuration * 60); if (intervalRef.current) clearInterval(intervalRef.current); };
  const applySettings = () => { setTimeLeft(focoDuration * 60); setMode('foco'); setState('idle'); setShowSettings(false); };

  const size = 260; const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Timer className="w-7 h-7 text-purple-500" /> Pomodoro</h1>
          <p className="text-gray-500 text-sm mt-1">Foco e produtividade</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-500 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="glass-card p-5 md:p-6 animate-scaleIn">
          <h3 className="font-bold text-gray-800 mb-4">Configurações</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Foco (min)</label>
              <input type="number" value={focoDuration} onChange={e => setFocoDuration(Math.max(1, Number(e.target.value)))} min={1} max={120} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pausa (min)</label>
              <input type="number" value={pausaDuration} onChange={e => setPausaDuration(Math.max(1, Number(e.target.value)))} min={1} max={30} /></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1.5">Matéria (opcional)</label>
            <select value={selectedMateria} onChange={e => setSelectedMateria(e.target.value)}>
              <option value="">Sem matéria específica</option>
              {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <button onClick={applySettings} className="btn-primary mt-4 w-full">Aplicar</button>
        </div>
      )}

      <div className="glass-card p-6 md:p-8 flex flex-col items-center animate-fadeIn">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full mb-6 md:mb-8 ${mode === 'foco' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
          {mode === 'foco' ? <Brain className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
          <span className="text-sm font-medium">{mode === 'foco' ? 'Tempo de Foco' : 'Tempo de Pausa'}</span>
        </div>
        <div className="relative mb-6 md:mb-8" style={{ width: `${size}px`, height: `${size}px`, maxWidth: '80vw', maxHeight: '80vw' }}>
          <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3e8ff" strokeWidth={strokeWidth} />
            <circle cx={center} cy={center} r={radius} fill="none" stroke={mode === 'foco' ? '#8b5cf6' : '#10b981'}
              strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-bold text-gray-800 tabular-nums">{formatTime(timeLeft)}</span>
            <span className="text-xs md:text-sm text-gray-500 mt-2">{mode === 'foco' ? `${focoDuration} min de foco` : `${pausaDuration} min de pausa`}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={reset} className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all hover:scale-105" title="Resetar">
            <RotateCcw className="w-5 h-5" />
          </button>
          {state === 'running' ? (
            <button onClick={pause} className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all hover:scale-105" title="Pausar">
              <Pause className="w-7 h-7 md:w-8 md:h-8" />
            </button>
          ) : (
            <button onClick={start} className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 hover:shadow-xl transition-all hover:scale-105" title="Iniciar">
              <Play className="w-7 h-7 md:w-8 md:h-8 ml-0.5" />
            </button>
          )}
          <div className="p-3 rounded-xl bg-gray-100 text-gray-600 min-w-[48px] text-center" title="Sessões concluídas">
            <span className="text-sm font-bold">{currentCompleted}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="glass-card p-4 md:p-5 text-center">
          <p className="text-2xl md:text-3xl font-bold text-purple-600">{todaySessions.length + currentCompleted}</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Sessões hoje</p>
        </div>
        <div className="glass-card p-4 md:p-5 text-center">
          <p className="text-2xl md:text-3xl font-bold text-purple-600">
            {((todaySessions.reduce((s, x) => s + x.duracao, 0) + currentCompleted * focoDuration) / 60).toFixed(1)}h
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Horas focadas</p>
        </div>
      </div>
    </div>
  );
}
