import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Share2,
  CheckCircle,
  X,
  Copy,
  ExternalLink,
  Flame,
  PlusSquare,
  MoreVertical,
  MessageCircle,
  Package,
  Layers,
  Send,
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { APK_BASE64, APK_FILENAME, APK_SIZE_KB } from '../../apkData';


interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'apk' | 'whatsapp' | 'browser';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<TabType>('apk');
  const [copied, setCopied] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');

  if (!isOpen) return null;

  const cleanAppUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0].replace(/\/$/, '')
      : 'https://ais-pre-vv443vvyrcxwakxkhtgfxs-751690768326.us-east1.run.app';

  const apkUrl = `${cleanAppUrl}/extintoresjuazeiro.apk`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    apkUrl
  )}&bgcolor=ffffff&color=0f172a&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyApkUrl = () => {
    navigator.clipboard.writeText(apkUrl);
    setCopiedApkUrl(true);
    setTimeout(() => setCopiedApkUrl(false), 2500);
  };

  const handleDownloadDirectApk = (filename: string = 'app-debug.apk') => {
    try {
      const byteCharacters = atob(APK_BASE64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback
      window.location.href = `/${filename}`;
    }
  };


  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `🔥 *APLICATIVO EXTINTORES JUAZEIRO (ANDROID .APK)*\n\nBaixe e instale o aplicativo oficial no seu celular Android:\n👉 ${apkUrl}\n\n*Como instalar:*\n1. Toque no link acima para baixar o arquivo extintoresjuazeiro.apk;\n2. Se aparecer aviso do Android, confirme em "Fazer o download mesmo assim";\n3. Abra o arquivo e clique em "Instalar". Pronto!`
    );

    let waUrl = `https://api.whatsapp.com/send?text=${message}`;
    if (cleanPhone) {
      const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${message}`;
    }

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 my-6 relative flex flex-col max-h-[92vh]">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
            <Flame className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Instalar Aplicativo
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                APK Oficial Pronto
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Extintores Juazeiro • Pacote instalável direto para celular
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 mt-3 gap-1 overflow-x-auto text-[11px] sm:text-xs font-bold">
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 pt-1 px-3 transition flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>1. Baixar APK Android (.apk)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-2.5 pt-1 px-3 transition flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>2. Enviar APK por WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('browser')}
            className={`pb-2.5 pt-1 px-3 transition flex items-center gap-1.5 border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'browser'
                ? 'border-slate-800 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-slate-600" />
            <span>3. iPhone (iOS Safari)</span>
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1 text-slate-700">
          {/* ABA 1: BAIXAR APK ANDROID */}
          {activeTab === 'apk' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Box de Download em Destaque */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      APK
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-emerald-950">
                        extintoresjuazeiro.apk
                      </h3>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Versão 1.0.0 Oficial • Assinado e Pronto para Instalar
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Seguro
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadDirectApk('app-debug.apk')}
                    className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    <span>BAIXAR APP-DEBUG.APK ({APK_SIZE_KB} KB)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDirectApk('extintoresjuazeiro.apk')}
                    className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-black text-xs shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer text-center border border-slate-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>EXTINTORESJUAZEIRO.APK</span>
                  </button>
                </div>


                <div className="flex items-center justify-between text-[11px] text-emerald-900 pt-0.5 px-1">
                  <span>ID: <strong>com.extintoresjuazeiro.app</strong></span>
                  <button
                    onClick={handleCopyApkUrl}
                    className="font-bold underline hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedApkUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>
              </div>

              {/* Passo a Passo para Instalar o APK no Celular */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Como instalar o APK no seu celular Android:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Clique no botão verde acima para baixar o arquivo</p>
                      <p className="text-[11px] text-slate-500">O download do <code>extintoresjuazeiro.apk</code> começará na hora.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Se o Android exibir "O arquivo pode ser nocivo":</p>
                      <p className="text-[11px] text-slate-500">
                        Isso é o aviso de segurança padrão do Android para qualquer aplicativo fora da Play Store. Toque com tranquilidade em <strong className="text-slate-800">"Fazer o download mesmo assim"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">Abra o arquivo baixado e toque em "Instalar"</p>
                      <p className="text-[11px] text-slate-500">
                        Se o celular pedir autorização para <em>"Instalar apps de fontes desconhecidas"</em>, basta autorizar o Chrome e clicar em <strong>Instalar</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code para baixar o APK no celular */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code do APK"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-400">
                    Aponte a câmera para baixar direto no celular
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Escaneie este QR Code com o seu smartphone Android para iniciar o download do arquivo <strong>.apk</strong> diretamente no aparelho.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: ENVIAR POR WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Mande o APK direto para o seu WhatsApp
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      Receba o link de download direto no seu celular para instalar em 1 clique
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendWhatsApp} className="space-y-2.5 pt-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Número do WhatsApp (com DDD) ou deixe em branco para escolher no WhatsApp:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="Ex: 74 98845-7721"
                      className="flex-1 px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-700/30 transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar no WhatsApp</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <p className="font-bold text-slate-800">
                  Link direto de download do APK para compartilhar:
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-300 font-mono text-[11px] text-slate-700 select-all break-all">
                  {apkUrl}
                </div>
                <button
                  onClick={handleCopyApkUrl}
                  className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline pt-0.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedApkUrl ? 'Link Copiado com Sucesso!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 3: IPHONE (IOS SAFARI) */}
          {activeTab === 'browser' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Apple className="w-4 h-4 text-slate-900" />
                  <span>Instalação no iPhone / iPad (iOS)</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  O sistema iOS da Apple não suporta arquivos .apk (exclusivo do Android). No iPhone, o aplicativo é instalado diretamente pelo navegador Safari:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                <ol className="space-y-2 pl-4 list-decimal font-medium">
                  <li>
                    Abra o link do sistema no navegador <strong>Safari</strong> do iPhone:
                    <div className="text-[11px] font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200 my-1 select-all break-all">
                      {cleanAppUrl}
                    </div>
                  </li>
                  <li>
                    Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima ⎋ na barra inferior).
                  </li>
                  <li>
                    Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong> (+).
                  </li>
                  <li>
                    Toque em <strong>"Adicionar"</strong> no canto superior direito.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 truncate max-w-full">
            Pacote: <span className="font-semibold text-slate-700">br.com.extintoresjuazeiro.app</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
