import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Materia } from '../types/database';
import { useMaterias } from '../hooks/useMaterias';
import { useFlashcards } from '../hooks/useFlashcards';
import { useAnotacoes } from '../hooks/useAnotacoes';
import { Plus, Edit3, Trash2, BookOpen, Brain, FileText, X } from 'lucide-react';

interface MateriasPageProps { userId: string; }

const CORES = [
  '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e879f9',
];

export function MateriasPage({ userId }: MateriasPageProps) {
  const { materias, create, update, remove } = useMaterias(userId);
  const { flashcards } = useFlashcards(userId);
  const { anotacoes } = useAnotacoes(userId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState(CORES[0]);

  const resetForm = useCallback(() => {
    setNome(''); setDescricao(''); setCor(CORES[0]); setEditingId(null); setShowForm(false);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    if (editingId) {
      await update(editingId, { nome, descricao, cor_personalizada: cor });
    } else {
      await create(nome, descricao, cor);
    }
    resetForm();
  };

  const handleEdit = (m: Materia) => {
    setNome(m.nome); setDescricao(m.descricao); setCor(m.cor_personalizada);
    setEditingId(m.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria? Todos os flashcards e anotações associados também serão removidos.')) {
      await remove(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-purple-500" /> Matérias
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas disciplinas de estudo</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Matéria</span><span className="sm:hidden">Nova</span>
        </button>
      </div>

      {showForm && createPortal(
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-glass-card max-w-lg w-full">
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'Editar Matéria' : 'Nova Matéria'}</h2>
              <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da matéria</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Matemática" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição <span className="font-normal text-gray-400">(opcional)</span></label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes sobre a matéria..." rows={3} style={{ minHeight: '80px', maxHeight: '150px' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Cor da matéria</label>
                <div className="flex flex-wrap gap-3">
                  {CORES.map(c => (
                    <button key={c} type="button" onClick={() => setCor(c)}
                      className={`w-9 h-9 rounded-xl transition-all duration-200 ${cor === c ? 'ring-3 ring-offset-2 ring-purple-400 scale-115' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Salvar Alterações' : 'Criar Matéria'}</button>
              </div>
            </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {materias.length === 0 ? (
        <div className="glass-card p-10 md:p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhuma matéria cadastrada</h3>
          <p className="text-gray-500 text-sm mb-4">Comece adicionando suas matérias de estudo!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar matéria</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((m, i) => {
            const fcCount = flashcards.filter(f => f.materia_id === m.id).length;
            const noteCount = anotacoes.filter(a => a.materia_id === m.id).length;
            return (
              <div key={m.id} className="glass-card p-5 card-hover animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
                    style={{ backgroundColor: m.cor_personalizada }}>{m.nome.charAt(0).toUpperCase()}</div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(m)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-1 truncate">{m.nome}</h3>
                {m.descricao && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.descricao}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> {fcCount} flashcards</span>
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {noteCount} notas</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
