import React from 'react';
import {
  LayoutDashboard,
  Users,
  Flame,
  Wrench,
  FileSpreadsheet,
  ClipboardCheck,
  FileCheck,
  Menu as MenuIcon,
} from 'lucide-react';

export type TabType =
  | 'INICIO'
  | 'CLIENTES'
  | 'EXTINTORES'
  | 'SERVICOS'
  | 'ORCAMENTOS'
  | 'CHECKLIST'
  | 'NOTA_FISCAL'
  | 'MENU';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  openQuotesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  openQuotesCount = 0,
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'INICIO', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'CLIENTES', label: 'CLIENTES', icon: Users },
    { id: 'EXTINTORES', label: 'EXTINTORES', icon: Flame },
    { id: 'SERVICOS', label: 'SERVIÇOS', icon: Wrench },
    {
      id: 'ORCAMENTOS',
      label: 'ORÇAMENTOS',
      icon: FileSpreadsheet,
      badge: openQuotesCount > 0 ? openQuotesCount : undefined,
    },
    { id: 'CHECKLIST', label: 'CHECKLIST NBR', icon: ClipboardCheck },
    { id: 'NOTA_FISCAL', label: 'NOTA FISCAL', icon: FileCheck },
    { id: 'MENU', label: 'MENU', icon: MenuIcon },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between md:justify-start md:space-x-4 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap rounded-lg my-1 ${
                  isActive
                    ? 'text-red-600 bg-red-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>

                {item.badge !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
