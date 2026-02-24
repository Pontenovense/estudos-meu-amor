import { useState, useMemo } from 'react';
import { useMotivacional } from '../hooks/useMotivacional';
import { Heart, Plus, Trash2, X, Sparkles, Quote } from 'lucide-react';

interface MotivacionalPageProps { userId: string; }

export function MotivacionalPage({ userId }: MotivacionalPageProps) {
  const { getDailyPhrase, create, remove, customPhrases, defaultPhrases: defaultPhrasesList, frases } = useMotivacional(userId);

  const [showForm, setShowForm] = useState(false);
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState('');

  const dailyPhrase = useMemo(() => getDailyPhrase(), [getDailyPhrase]);

  const openForm = () => { setTexto(''); setAutor(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setTexto(''); setAutor(''); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    await create(texto, autor.trim() || 'Eu');
    closeForm();
  };

  const handleDelete = async (id: string) => { await remove(id); };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Heart className="w-7 h-7 text-pink-500" /> Motivação</h1>
          <p className="text-gray-500 text-sm mt-1">Frases para inspirar seus estudos</p>
        </div>
        <button onClick={openForm} className="btn-primary">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nova Frase</span><span className="sm:hidden">Nova</span>
        </button>
      </div>

      <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-center animate-slideUp relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none"><Quote className="w-16 h-16 md:w-20 md:h-20 text-purple-500" /></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-5">
            <Sparkles className="w-3 h-3" /> Frase do dia
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-800 italic leading-relaxed mb-4">"{dailyPhrase.texto}"</p>
          <p className="text-purple-600 font-medium text-sm md:text-base">— {dailyPhrase.autor}</p>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500" /> Nova Frase Motivacional</h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sua frase motivacional</label>
                <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva uma frase que te motiva nos estudos..."
                  rows={4} required autoFocus style={{ minHeight: '100px', maxHeight: '200px' }} />
                <p className="text-xs text-gray-400 mt-1.5">{texto.length > 0 ? `${texto.length} caracteres` : 'Pode ser uma citação, mantra ou pensamento pessoal'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Autor <span className="font-normal text-gray-400">(opcional)</span></label>
                <input type="text" value={autor} onChange={e => setAutor(e.target.value)} placeholder="Quem disse? (deixe vazio para 'Eu')" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1"><Heart className="w-4 h-4" /> Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {customPhrases.length > 0 && (
        <div className="animate-slideUp anim-delay-1">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" /> Suas frases personalizadas</h3>
          <div className="space-y-3">
            {customPhrases.map((f, i) => (
              <div key={f.id} className="glass-card p-4 md:p-5 card-hover flex items-start gap-3 md:gap-4 animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0"><Heart className="w-5 h-5 text-pink-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{f.texto}"</p>
                  <p className="text-xs text-purple-500 mt-2 font-medium">— {f.autor}</p>
                </div>
                <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-slideUp anim-delay-2">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Todas as frases ({frases.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {defaultPhrasesList.map((f, i) => (
            <div key={f.id} className="glass-card p-4 md:p-5 card-hover animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
              <p className="text-sm text-gray-700 italic leading-relaxed mb-2">"{f.texto}"</p>
              <p className="text-xs text-purple-500 font-medium">— {f.autor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
