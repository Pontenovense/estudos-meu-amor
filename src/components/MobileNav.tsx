import type { Page } from '../types/database';
import { LayoutDashboard, BookOpen, Timer, Brain, BarChart3 } from 'lucide-react';

interface MobileNavProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const mobileItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { page: 'materias', label: 'Matérias', icon: BookOpen },
  { page: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { page: 'flashcards', label: 'Cards', icon: Brain },
  { page: 'progresso', label: 'Progresso', icon: BarChart3 },
];

export function MobileNav({ currentPage, navigateTo }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-purple-100 pb-safe">
      <div className="flex items-center justify-around py-1.5 px-1">
        {mobileItems.map(({ page, label, icon: Icon }) => {
          const isActive = currentPage === page;
          return (
            <button key={page} onClick={() => navigateTo(page)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-100 scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium truncate max-w-full">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
