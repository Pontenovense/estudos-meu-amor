import { useState, useCallback } from 'react';
import type { Page } from './types/database';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { MateriasPage } from './pages/MateriasPage';
import { PlanejamentoPage } from './pages/PlanejamentoPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { AnotacoesPage } from './pages/AnotacoesPage';
import { ProgressoPage } from './pages/ProgressoPage';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { isSupabaseConfigured } from './lib/supabase';

export function App() {
  const { user, loading, signOut, userName } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setCurrentPage('dashboard');
  }, [signOut]);

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 50%, #eff6ff 100%)' }}>
        <div className="glass-card p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-purple-200">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Configuração Necessária</h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Para usar o Estudos Meu Amor, configure as variáveis de ambiente do Supabase.
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-left text-sm font-mono mb-6 overflow-x-auto">
            <p className="text-green-400"># Crie um arquivo .env na raiz do projeto:</p>
            <p className="text-gray-300 mt-2">VITE_SUPABASE_URL=<span className="text-yellow-300">https://seu-projeto.supabase.co</span></p>
            <p className="text-gray-300">VITE_SUPABASE_ANON_KEY=<span className="text-yellow-300">sua-anon-key</span></p>
            <p className="text-gray-300">VITE_GEMINI_API_KEY=<span className="text-yellow-300">sua-chave-gemini</span></p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-left text-sm">
            <p className="font-semibold text-purple-700 mb-2">📋 Passo a passo:</p>
            <ol className="text-purple-600 space-y-1 list-decimal list-inside">
              <li>Crie um projeto em <a href="https://supabase.com" target="_blank" className="underline font-medium">supabase.com</a></li>
              <li>Execute o script SQL (supabase-schema.sql)</li>
              <li>Copie a URL e Anon Key do projeto</li>
              <li>Adicione no arquivo .env</li>
              <li>Reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-purple-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const userId = user.id;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard userId={userId} userName={userName} navigateTo={navigateTo} />;
      case 'materias': return <MateriasPage userId={userId} />;
      case 'planejamento': return <PlanejamentoPage userId={userId} />;
      case 'pomodoro': return <PomodoroPage userId={userId} />;
      case 'flashcards': return <FlashcardsPage userId={userId} />;
      case 'anotacoes': return <AnotacoesPage userId={userId} />;
      case 'progresso': return <ProgressoPage userId={userId} />;
      default: return <Dashboard userId={userId} userName={userName} navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar currentPage={currentPage} navigateTo={navigateTo} onLogout={handleLogout} userName={userName} />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full animate-slideInLeft">
            <Sidebar currentPage={currentPage} navigateTo={navigateTo} onLogout={handleLogout} userName={userName} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-purple-50 transition-colors" aria-label="Abrir menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Estudos Meu Amor</h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <div className="animate-fadeIn" key={currentPage}>{renderPage()}</div>
        </main>
      </div>
      <MobileNav currentPage={currentPage} navigateTo={navigateTo} />
    </div>
  );
}
