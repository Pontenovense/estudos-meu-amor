import { useState, useMemo } from 'react';
import type { Anotacao } from '../types/database';
import { useMaterias } from '../hooks/useMaterias';
import { useAnotacoes } from '../hooks/useAnotacoes';
import { FileText, Plus, Edit3, Trash2, X, Save, BookOpen } from 'lucide-react';

interface AnotacoesPageProps { userId: string; }

export function AnotacoesPage({ userId }: AnotacoesPageProps) {
  const { materias } = useMaterias(userId);
  const { anotacoes, create, update, remove } = useAnotacoes(userId);

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [filterMateria, setFilterMateria] = useState('all');

  const allNotes = useMemo(() => {
    if (filterMateria === 'all') return anotacoes;
    return anotacoes.filter(n => n.materia_id === filterMateria);
  }, [anotacoes, filterMateria]);

  const resetForm = () => { setTitulo(''); setConteudo(''); setSelectedMateria(materias[0]?.id || ''); setEditingId(null); setShowEditor(false); };

  const handleSave = async () => {
    if (!titulo.trim()) return;
    if (editingId) { await update(editingId, { titulo, conteudo, materia_id: selectedMateria }); }
    else { await create({ materia_id: selectedMateria, titulo, conteudo }); }
    resetForm();
  };

  const handleEdit = (note: Anotacao) => {
    setTitulo(note.titulo); setConteudo(note.conteudo); setSelectedMateria(note.materia_id); setEditingId(note.id); setShowEditor(true);
  };

  const handleDelete = async (id: string) => { if (confirm('Tem certeza que deseja excluir esta anotação?')) { await remove(id); } };

  if (showEditor) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto animate-fadeIn">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Anotação' : 'Nova Anotação'}</h1>
          <button onClick={resetForm} className="btn-secondary text-sm"><X className="w-4 h-4" /> Cancelar</button>
        </div>
        <div className="glass-card p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da anotação..." required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Matéria</label>
              <select value={selectedMateria} onChange={e => setSelectedMateria(e.target.value)}>
                {materias.length === 0 && <option value="">Cadastre uma matéria primeiro</option>}
                {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Conteúdo</label>
            <div className="border-2 border-purple-100 rounded-xl overflow-hidden focus-within:border-purple-400 transition-all">
              <div className="flex items-center gap-1 p-2 bg-purple-50/50 border-b border-purple-100 flex-wrap">
                <button type="button" onClick={() => setConteudo(c => c + '**texto em negrito**')} className="px-2.5 py-1 rounded text-xs font-bold text-gray-600 hover:bg-purple-100 transition-colors">B</button>
                <button type="button" onClick={() => setConteudo(c => c + '*texto em itálico*')} className="px-2.5 py-1 rounded text-xs italic text-gray-600 hover:bg-purple-100 transition-colors">I</button>
                <button type="button" onClick={() => setConteudo(c => c + '\n\n## Subtítulo\n')} className="px-2.5 py-1 rounded text-xs text-gray-600 hover:bg-purple-100 transition-colors">H2</button>
                <button type="button" onClick={() => setConteudo(c => c + '\n- Item da lista')} className="px-2.5 py-1 rounded text-xs text-gray-600 hover:bg-purple-100 transition-colors">• Lista</button>
                <button type="button" onClick={() => setConteudo(c => c + '\n---\n')} className="px-2.5 py-1 rounded text-xs text-gray-600 hover:bg-purple-100 transition-colors">— Linha</button>
              </div>
              <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Escreva suas anotações aqui... Use Markdown para formatação."
                rows={12} className="editor-textarea w-full p-4 text-sm" style={{ minHeight: '250px', resize: 'vertical', outline: 'none' }} />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> {editingId ? 'Salvar alterações' : 'Criar anotação'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="w-7 h-7 text-purple-500" /> Anotações</h1>
          <p className="text-gray-500 text-sm mt-1">Suas notas organizadas por matéria</p>
        </div>
        <button onClick={() => { setSelectedMateria(materias[0]?.id || ''); setShowEditor(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Nova Anotação</span><span className="sm:hidden">Nova</span>
        </button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterMateria} onChange={e => setFilterMateria(e.target.value)} className="text-sm">
          <option value="all">Todas as matérias</option>
          {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <span className="text-sm text-gray-500">{allNotes.length} anotações</span>
      </div>
      {allNotes.length === 0 ? (
        <div className="glass-card p-10 md:p-12 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-purple-400" /></div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhuma anotação encontrada</h3>
          <p className="text-gray-500 text-sm">Comece criando suas primeiras anotações!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {allNotes.map((note, i) => {
            const mat = materias.find(m => m.id === note.materia_id);
            const preview = note.conteudo.replace(/[#*_\-\[\]()]/g, '').slice(0, 150);
            const dateStr = new Date(note.data_atualizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <div key={note.id} className="glass-card p-4 md:p-5 card-hover animate-fadeIn cursor-pointer group" style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleEdit(note)}>
                <div className="flex items-start justify-between mb-2.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {mat && (<><div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: mat.cor_personalizada }} />
                      <span className="text-xs text-gray-500 truncate">{mat.nome}</span></>)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(note); }} className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-1.5 line-clamp-1 text-sm">{note.titulo}</h3>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{preview || 'Anotação vazia'}</p>
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">{dateStr}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
