import React from 'react';
import { Flame, Shield, Plus, FileText, Bell } from 'lucide-react';
import type { CompanySettings } from '../types';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface HeaderProps {
  settings: CompanySettings;
  onNewQuote: () => void;
  onNewExtinguisher: () => void;
  expiredExtinguishersCount: number;
  onViewExtinguishers: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onNewQuote,
  onNewExtinguisher,
  expiredExtinguishersCount,
  onViewExtinguishers,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Empresa */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md shadow-red-950/40 border border-red-400/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  EXTINTORES
                </span>
                <span className="font-bold text-lg text-red-500">
                  JUAZEIRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Shield className="w-3 h-3 text-red-400" />
                {settings.city || 'Juazeiro'} - {settings.state || 'BA'}
              </p>
            </div>
          </div>

          {/* Ações Rápidas no Header */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Alerta de extintores vencidos */}
            {expiredExtinguishersCount > 0 && (
              <button
                onClick={onViewExtinguishers}
                title={`${expiredExtinguishersCount} extintor(es) vencido(s)`}
                className="relative p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/50 hover:bg-red-900/60 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Bell className="w-4 h-4 animate-pulse text-red-400" />
                <span className="hidden sm:inline">{expiredExtinguishersCount} Vencido(s)</span>
                <span className="sm:hidden absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {expiredExtinguishersCount}
                </span>
              </button>
            )}

            {/* Botão Novo Extintor */}
            <button
              onClick={onNewExtinguisher}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-slate-300" />
              Novo Extintor
            </button>

            {/* Botão Instalar no Celular */}
            <PWAInstallButton />

            {/* Botão Novo Orçamento */}
            <button
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-900/30 transition transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Novo Orçamento</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
