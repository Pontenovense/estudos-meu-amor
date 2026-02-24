import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePlanejamentos } from '../hooks/usePlanejamentos';
import { useMaterias } from '../hooks/useMaterias';
import { Calendar, Plus, Check, X, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface PlanejamentoPageProps { userId: string; }

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeekDates(offset: number = 0) {
  const today = new Date();
  const current = new Date(today);
  current.setDate(current.getDate() + offset * 7);
  const dayOfWeek = current.getDay();
  const start = new Date(current);
  start.setDate(start.getDate() - dayOfWeek);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(d.getDate() + i); dates.push(d); }
  return dates;
}

function formatDate(d: Date): string { return d.toISOString().split('T')[0]; }

export function PlanejamentoPage({ userId }: PlanejamentoPageProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [titulo, setTitulo] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [duracao, setDuracao] = useState(60);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const { materias } = useMaterias(userId);
  const { getByWeek, create, update, remove } = usePlanejamentos(userId);

  const plans = useMemo(() => getByWeek(formatDate(weekDates[0]), formatDate(weekDates[6])), [getByWeek, weekDates]);

  const handleAdd = (date: string) => {
    setSelectedDate(date); setTitulo(''); setMateriaId(materias[0]?.id || ''); setDuracao(60); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    await create({ materia_id: materiaId, titulo, data: selectedDate, duracao });
    setShowForm(false);
  };

  const toggleComplete = async (id: string, current: boolean) => { await update(id, { concluido: !current }); };
  const handleDelete = async (id: string) => { await remove(id); };

  const today = formatDate(new Date());
  const weekLabel = useMemo(() => {
    const s = weekDates[0]; const e = weekDates[6];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
  }, [weekDates]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-purple-500" /> Planejamento Semanal
        </h1>
        <p className="text-gray-500 text-sm mt-1">Organize seus blocos de estudo</p>
      </div>

      <div className="glass-card p-3 md:p-4 flex items-center justify-between">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-500 transition-colors flex-shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center min-w-0">
          <p className="font-bold text-gray-800 text-sm md:text-base truncate">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-purple-500 hover:text-purple-700 transition-colors">Voltar para esta semana</button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-500 transition-colors flex-shrink-0">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {weekDates.map((date, i) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const dayPlans = plans.filter(p => p.data === dateStr);
          return (
            <div key={dateStr} className={`glass-card p-3 md:p-4 transition-all ${isToday ? 'ring-2 ring-purple-300 bg-purple-50/50' : ''}`} style={{ minHeight: '120px' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-0">
                  <p className={`text-xs font-medium ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>
                    <span className="lg:hidden">{DIAS_SEMANA[i]}</span>
                    <span className="hidden lg:inline">{DIAS_CURTOS[i]}</span>
                  </p>
                  <p className={`text-lg font-bold ${isToday ? 'text-purple-700' : 'text-gray-800'}`}>{date.getDate()}</p>
                </div>
                <button onClick={() => handleAdd(dateStr)} className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                {dayPlans.map(p => {
                  const mat = materias.find(m => m.id === p.materia_id);
                  return (
                    <div key={p.id} className={`p-2 rounded-lg text-xs border transition-all ${p.concluido ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white border-gray-100 hover:border-purple-200'}`}>
                      <div className="flex items-start gap-1.5">
                        <button onClick={() => toggleComplete(p.id, p.concluido)}
                          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${p.concluido ? 'bg-green-400 border-green-400 text-white' : 'border-gray-300 hover:border-purple-400'}`}>
                          {p.concluido && <Check className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${p.concluido ? 'line-through text-gray-400' : 'text-gray-700'}`}>{p.titulo}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: mat?.cor_personalizada || '#8b5cf6' }} />
                            <span className="text-gray-500 truncate">{mat?.nome || '—'}</span>
                            <span className="text-gray-400 ml-auto flex-shrink-0">{p.duracao}min</span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(p.id)} className="p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-glass-card max-w-lg w-full">
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" /> Novo Bloco de Estudo
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título do bloco</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Revisar capítulo 3" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Matéria</label>
                {materias.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">⚠️ Cadastre uma matéria primeiro na aba "Matérias"</div>
                ) : (
                  <select value={materiaId} onChange={e => setMateriaId(e.target.value)}>
                    {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Duração (minutos)</span>
                </label>
                <input type="number" value={duracao} onChange={e => setDuracao(Number(e.target.value))} min={5} max={480} />
                <div className="flex gap-2 mt-2">
                  {[15, 30, 45, 60, 90, 120].map(d => (
                    <button key={d} type="button" onClick={() => setDuracao(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${duracao === d ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {d}min
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={materias.length === 0}>Criar Bloco</button>
              </div>
            </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
