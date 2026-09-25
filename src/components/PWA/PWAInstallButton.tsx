import React, { useState } from 'react';
import { Download, Smartphone, Package } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'hero' | 'minimal';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstalled } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    setModalOpen(true);
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${className}`}
        >
          <Package className="w-5 h-5 text-emerald-200" />
          <span>Baixar APK Celular (.apk)</span>
          <span className="bg-emerald-900/60 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
            Android
          </span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  if (variant === 'minimal') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar APK</span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-900/30 transition active:scale-95 cursor-pointer ${className}`}
        title="Baixar APK ou Instalar no Celular"
      >
        <Package className="w-3.5 h-3.5 text-emerald-200" />
        <span className="hidden sm:inline">Baixar APK Celular</span>
        <span className="sm:hidden">Baixar APK</span>
      </button>
      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
