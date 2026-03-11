import { useState, useMemo } from 'react';
import type { Flashcard } from '../types/database';
import { useMaterias } from '../hooks/useMaterias';
import { useFlashcards } from '../hooks/useFlashcards';
import { useProgresso } from '../hooks/useProgresso';
import { supabase } from '../lib/supabase';
import { Brain, Plus, Sparkles, Eye, Check, X, Trash2, RotateCcw, Wand2 } from 'lucide-react';

interface FlashcardsPageProps { userId: string; }
type ViewMode = 'list' | 'create' | 'ai' | 'review';

export function FlashcardsPage({ userId }: FlashcardsPageProps) {
  const { materias } = useMaterias(userId);
  const { flashcards, create, recordReview, remove, refresh } = useFlashcards(userId);
  const { addFlashcardReview } = useProgresso(userId);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [dificuldade, setDificuldade] = useState<string>('medio');
  const [aiText, setAiText] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filterMateria, setFilterMateria] = useState('all');
  const [showResult, setShowResult] = useState(false);
  const [resultCorrect, setResultCorrect] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');

  const allCards = useMemo(() => {
    if (filterMateria === 'all') return flashcards;
    return flashcards.filter(c => c.materia_id === filterMateria);
  }, [flashcards, filterMateria]);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim() || !resposta.trim()) return;
    await create({ 
      materia_id: selectedMateria, 
      pergunta, 
      resposta, 
      alternativas: [],
      resposta_correta: resposta,
      criado_por_ia: false, 
      nivel_dificuldade: dificuldade 
    });
    setPergunta(''); setResposta('');
  };

  // Função de geração usando Edge Function do Supabase
  const handleAiGenerate = async () => {
    if (!selectedMateria) { alert('Por favor, selecione uma matéria.'); return; }
    if (!aiText.trim() && !aiTopic.trim()) { alert('Por favor, insira um texto base ou um tópico.'); return; }
    
    setAiLoading(true);
    try {
      const materiaSelecionada = materias.find(m => m.id === selectedMateria);
      const nomeMateria = materiaSelecionada?.nome || 'Matéria';

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          materia: nomeMateria,
          materia_id: selectedMateria,
          topico_especifico: aiTopic.trim(),
          texto_base: aiText.trim(),
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar flashcards.');
      }

      const data = await response.json();
      await refresh();
      
      setAiText(''); setAiTopic('');
      alert(`✅ ${data.count || 10} flashcards criados com sucesso!`);
      setViewMode('list');
    } catch (err) { 
      console.error('Erro na geração:', err);
      alert(`❌ Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`); 
    }
    finally { setAiLoading(false); }
  };

  const startReview = (cards?: Flashcard[]) => {
    const toReview = cards || allCards;
    if (toReview.length === 0) { alert('Nenhum flashcard para revisar.'); return; }
    const shuffled = [...toReview].sort(() => Math.random() - 0.5);
    setReviewCards(shuffled); setReviewIndex(0); setShowAnswer(false); setViewMode('review');
    setShowResult(false);
    setSelectedAlternative('');
  };

  // Função para verificar a resposta selecionada
  const handleAnswerSelect = (alternative: string) => {
    const card = reviewCards[reviewIndex];
    const correctAnswer = (card.resposta_correta || card.resposta).trim();
    
    // Verificar se a alternativa selecionada é exatamente igual à resposta correta
    const isCorrect = alternative.trim() === correctAnswer;
    
    setSelectedAlternative(alternative);
    setResultCorrect(isCorrect);
    setShowResult(true);
  };

  const handleReviewAnswer = async () => {
    const card = reviewCards[reviewIndex];
    await recordReview(card.id, resultCorrect);
    await addFlashcardReview(resultCorrect);
    
    if (reviewIndex < reviewCards.length - 1) { 
      setReviewIndex(i => i + 1); 
      setShowAnswer(false); 
      setShowResult(false);
      setSelectedAlternative('');
    }
    else { 
      setViewMode('list'); 
      alert('🎉 Revisão concluída! Parabéns!'); 
    }
  };

  const handleDelete = async (id: string) => { await remove(id); };

  // ======== REVIEW VIEW ========
  if (viewMode === 'review' && reviewCards.length > 0) {
    const card = reviewCards[reviewIndex];
    const mat = materias.find(m => m.id === card.materia_id);
    const temAlternativas = card.alternativas && card.alternativas.length > 0;
    const correctAnswer = card.resposta_correta || card.resposta;
    
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setViewMode('list')} className="btn-secondary text-sm">← Voltar</button>
          <span className="text-sm text-gray-500 font-medium">{reviewIndex + 1} / {reviewCards.length}</span>
        </div>
        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${((reviewIndex + 1) / reviewCards.length) * 100}%` }} />
        </div>
        <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center animate-scaleIn" style={{ minHeight: '300px' }}>
          {mat && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: mat.cor_personalizada }} />
              <span className="text-xs text-gray-500">{mat.nome}</span>
            </div>
          )}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <p className="text-xs text-purple-500 font-medium mb-2 uppercase tracking-wider">Pergunta</p>
            <p className="text-lg md:text-xl font-bold text-gray-800 mb-6 leading-relaxed">{card.pergunta}</p>
            
            {/* Mostrar alternativas para seleção */}
            {temAlternativas && !showResult && (
              <div className="w-full space-y-2 mb-4">
                {card.alternativas.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(alt)}
                    className="w-full p-3 text-left text-sm bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            )}
            
            {/* Resultado da verificação */}
            {showResult && (
              <div className="w-full animate-fadeIn">
                <div className={`flex items-center justify-center gap-2 py-3 rounded-xl mb-4 ${resultCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {resultCorrect ? (
                    <><Check className="w-6 h-6" /> Você acertou!</>
                  ) : (
                    <><X className="w-6 h-6" /> Você errou!</>
                  )}
                </div>
                
                <div className="w-16 h-0.5 bg-purple-200 mx-auto mb-4" />
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Resposta Correta</p>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-semibold">{correctAnswer}</p>
              </div>
            )}
          </div>
          
          {/* Botão para próximo cartão */}
          {showResult && (
            <div className="flex gap-3 md:gap-4 mt-6 w-full animate-fadeIn">
              <button onClick={handleReviewAnswer} className="btn-primary w-full">
                Próximo cartão →
              </button>
            </div>
          )}
        </div>
        {card.criado_por_ia && (
          <p className="text-center text-xs text-purple-400 flex items-center justify-center gap-1"><Sparkles className="w-3 h-3" /> Gerado por IA</p>
        )}
      </div>
    );
  }

  // ======== MAIN VIEW ========
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Brain className="w-7 h-7 text-purple-500" /> Flashcards</h1>
          <p className="text-gray-500 text-sm mt-1">Estude com cartões de memorização</p>
        </div>
        <button onClick={() => startReview()} className="btn-secondary text-sm" disabled={allCards.length === 0}>
          <RotateCcw className="w-4 h-4" /> Revisar ({allCards.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <button onClick={() => { setViewMode(viewMode === 'create' ? 'list' : 'create'); setSelectedMateria(materias[0]?.id || ''); }}
          className={`glass-card p-4 md:p-5 card-hover text-left transition-all ${viewMode === 'create' ? 'ring-2 ring-purple-300' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg flex-shrink-0">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0"><h3 className="font-bold text-gray-800 text-sm md:text-base">Criar Manualmente</h3><p className="text-xs md:text-sm text-gray-500">Pergunta e resposta</p></div>
          </div>
        </button>
        <button onClick={() => { setViewMode(viewMode === 'ai' ? 'list' : 'ai'); setSelectedMateria(materias[0]?.id || ''); }}
          className={`glass-card p-4 md:p-5 card-hover text-left transition-all ${viewMode === 'ai' ? 'ring-2 ring-purple-300' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg flex-shrink-0">
              <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0"><h3 className="font-bold text-gray-800 text-sm md:text-base">Gerar com IA</h3><p className="text-xs md:text-sm text-gray-500">Google Gemini API</p></div>
          </div>
        </button>
      </div>

      {viewMode === 'create' && (
        <div className="glass-card p-5 md:p-6 animate-scaleIn">
          <h3 className="font-bold text-gray-800 mb-4">Novo Flashcard</h3>
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Matéria</label>
              <select value={selectedMateria} onChange={e => setSelectedMateria(e.target.value)}>
                {materias.length === 0 && <option value="">Cadastre uma matéria primeiro</option>}
                {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Pergunta</label>
              <textarea value={pergunta} onChange={e => setPergunta(e.target.value)} placeholder="Digite a pergunta..." rows={3} required style={{ minHeight: '80px', maxHeight: '150px' }} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Resposta</label>
              <textarea value={resposta} onChange={e => setResposta(e.target.value)} placeholder="Digite a resposta..." rows={3} required style={{ minHeight: '80px', maxHeight: '150px' }} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Dificuldade</label>
              <select value={dificuldade} onChange={e => setDificuldade(e.target.value)}>
                <option value="facil">Fácil</option><option value="medio">Médio</option><option value="dificil">Difícil</option>
              </select></div>
            <button type="submit" className="btn-primary w-full">Criar Flashcard</button>
          </form>
        </div>
      )}

      {viewMode === 'ai' && (
        <div className="glass-card p-5 md:p-6 animate-scaleIn">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Geração com IA</h3>
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
              ℹ️ A geração de flashcards agora é feita automaticamente pelo sistema. 
              Não é necessário inserir nenhuma chave de API.
            </p>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Matéria</label>
              <select value={selectedMateria} onChange={e => setSelectedMateria(e.target.value)}>
                {materias.length === 0 && <option value="">Cadastre uma matéria primeiro</option>}
                {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tópico específico</label>
              <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Ex: Fotossíntese, Revolução Francesa..." /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Ou texto base</label>
              <textarea value={aiText} onChange={e => setAiText(e.target.value)} placeholder="Cole um texto para a IA transformar em flashcards..." rows={5} style={{ minHeight: '100px', maxHeight: '200px' }} /></div>
            <button onClick={handleAiGenerate} disabled={aiLoading} className="btn-primary w-full">
              {aiLoading ? (<><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Gerando flashcards...</>) : (<><Wand2 className="w-4 h-4" /> Gerar Flashcards com IA</>)}
            </button>
          </div>
        </div>
      )}

      {(viewMode === 'list' || viewMode === 'create' || viewMode === 'ai') && (
        <div className="flex items-center gap-3 flex-wrap">
          <select value={filterMateria} onChange={e => setFilterMateria(e.target.value)} className="text-sm">
            <option value="all">Todas as matérias</option>
            {materias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <span className="text-sm text-gray-500">{allCards.length} flashcards</span>
        </div>
      )}

      {(viewMode === 'list' || viewMode === 'create' || viewMode === 'ai') && (
        <>
          {allCards.length === 0 ? (
            <div className="glass-card p-10 md:p-12 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4"><Brain className="w-8 h-8 text-purple-400" /></div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhum flashcard encontrado</h3>
              <p className="text-gray-500 text-sm">Crie flashcards manualmente ou com IA!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {allCards.map((card, i) => {
                const mat = materias.find(m => m.id === card.materia_id);
                const accuracy = card.vezes_revisado > 0 ? Math.round((card.acertos / card.vezes_revisado) * 100) : null;
                const temAlternativas = card.alternativas && card.alternativas.length > 0;
                return (
                  <div key={card.id} className="glass-card p-4 md:p-5 card-hover animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start justify-between mb-2.5 gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {mat && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: mat.cor_personalizada }} />}
                        <span className="text-xs text-gray-500 truncate">{mat?.nome || 'Sem matéria'}</span>
                        {card.criado_por_ia && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0"><Sparkles className="w-3 h-3" /> IA</span>}
                        {temAlternativas && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">Q</span>}
                      </div>
                      <button onClick={() => handleDelete(card.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="font-medium text-gray-800 text-sm mb-1.5 line-clamp-2">{card.pergunta}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{card.resposta}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${card.nivel_dificuldade === 'facil' ? 'bg-green-50 text-green-600' : card.nivel_dificuldade === 'medio' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                        {card.nivel_dificuldade === 'facil' ? 'Fácil' : card.nivel_dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                      </span>
                      {accuracy !== null && <span className={`text-xs font-medium ${accuracy >= 70 ? 'text-green-500' : accuracy >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{accuracy}% acertos</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
