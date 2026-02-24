import type { Page } from '../types/database';
import {
  LayoutDashboard, BookOpen, Calendar, Timer, Brain,
  FileText, BarChart3, LogOut, X, GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  onLogout: () => void;
  userName: string;
  onClose?: () => void;
}

const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { page: 'materias', label: 'Matérias', icon: BookOpen },
  { page: 'planejamento', label: 'Planejamento', icon: Calendar },
  { page: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { page: 'flashcards', label: 'Flashcards', icon: Brain },
  { page: 'anotacoes', label: 'Anotações', icon: FileText },
  { page: 'progresso', label: 'Progresso', icon: BarChart3 },
];

export function Sidebar({ currentPage, navigateTo, onLogout, userName, onClose }: SidebarProps) {
  return (
    <div className="w-72 h-screen bg-white/95 backdrop-blur-xl border-r border-purple-100 flex flex-col overflow-y-auto">
      <div className="p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Estudos do Meu Amor</h1>
            <p className="text-xs text-gray-400 truncate">Organize seus estudos</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-purple-50 lg:hidden flex-shrink-0">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
      <div className="mx-4 mb-4 p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 truncate text-sm">{userName}</p>
            <p className="text-xs text-purple-500">Estudante</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ page, label, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button key={page} onClick={() => navigateTo(page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{label}</span>
              {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-white/50 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-purple-50 flex-shrink-0">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200">
          <LogOut className="w-5 h-5 flex-shrink-0" /><span>Sair</span>
        </button>
      </div>
    </div>
  );
}
