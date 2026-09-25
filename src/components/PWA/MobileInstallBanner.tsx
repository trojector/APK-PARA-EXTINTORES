import React, { useState } from 'react';
import { Smartphone, X, Download, Flame, Package } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

export const MobileInstallBanner: React.FC = () => {
  const { isInstalled, isIOS } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/50 shadow-2xl animate-in slide-in-from-bottom duration-300 md:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shrink-0 shadow-md">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div className="truncate">
              <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                Extintores Juazeiro
                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">APK</span>
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                {isIOS ? 'Adicione à tela de início do iPhone' : 'Baixe o APK oficial para instalar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isIOS ? (
              <a
                href="/extintoresjuazeiro.apk"
                download="extintoresjuazeiro.apk"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar APK</span>
              </a>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title="Ajuda e opções"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
