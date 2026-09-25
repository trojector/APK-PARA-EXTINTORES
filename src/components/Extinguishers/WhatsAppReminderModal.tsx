import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Phone,
  AlertTriangle,
  Flame,
  Check,
  Copy,
  Clock,
  MessageCircle,
} from 'lucide-react';
import type { FireExtinguisher, Client, CompanySettings } from '../../types';
import { formatDateBR } from '../../services/pdfGenerator';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  extinguisher: FireExtinguisher | null;
  client: Client | null;
  settings: CompanySettings;
  allClientExtinguishers?: FireExtinguisher[];
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  extinguisher,
  client,
  settings,
  allClientExtinguishers = [],
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');

  // Filtrar extintores que precisam de recarga do cliente
  const urgentExtinguishers = allClientExtinguishers.filter((e) => {
    if (e.status === 'VENCIDO') return true;
    if (!e.nextRechargeDate) return false;
    const d = new Date(e.nextRechargeDate);
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return d <= in30;
  });

  const generateSingleMessage = (ext: FireExtinguisher, cl: Client | null, phone: string) => {
    const isExpired =
      ext.status === 'VENCIDO' ||
      (ext.nextRechargeDate && new Date(ext.nextRechargeDate) < new Date());

    const clientName = cl?.name || ext.clientName;
    const formattedDate = formatDateBR(ext.nextRechargeDate);

    if (isExpired) {
      return `⚠️ *EXTINTORES JUAZEIRO — AVISO URGENTE DE VENCIMENTO* ⚠️

Olá, *${clientName}*!

Identificamos em nosso sistema de controle que o extintor sob sua responsabilidade está com a *recarga VENCIDA*:

🧯 *Extintor:* ${ext.number}${ext.patrimonyNumber ? ` (Patrimônio: ${ext.patrimonyNumber})` : ''}
📍 *Localização:* ${ext.location}
🏷️ *Tipo / Capacidade:* ${ext.type} • ${ext.capacity}
📅 *Vencimento da Recarga:* *${formattedDate}*
🚨 *Status:* *VENCIDO — Necessita de recarga imediata*

Extintores vencidos comprometem a segurança do seu patrimônio e podem gerar autuações dos órgãos fiscalizadores e Corpo de Bombeiros.

Podemos agendar a retirada e recarga com equipamentos de reserva para sua empresa?

💬 Responda esta mensagem ou ligue para agendarmos:
📞 *Telefone:* ${settings.phone}
💬 *WhatsApp:* ${settings.whatsapp}
📍 *Extintores Juazeiro - CNPJ:${settings.cnpj}*
🏢 ${settings.address} - ${settings.neighborhood} - ${settings.city}-${settings.state}
👷 *Resp. Técnico:* ${settings.responsibleName}`;
    }

    return `🔔 *EXTINTORES JUAZEIRO — LEMBRETE DE VENCIMENTO DE RECARGA* 🔔

Olá, *${clientName}*!

Gostaríamos de lembrar que a recarga do extintor abaixo vencerá em breve:

🧯 *Extintor:* ${ext.number}${ext.patrimonyNumber ? ` (Patrimônio: ${ext.patrimonyNumber})` : ''}
📍 *Localização:* ${ext.location}
🏷️ *Tipo / Capacidade:* ${ext.type} • ${ext.capacity}
📅 *Próxima Recarga:* *${formattedDate}*

Para manter seu estabelecimento sempre seguro e em total conformidade com as normas técnicas vigentes, recomendamos a programação antecipada da recarga.

Gostaria de receber uma proposta comercial sem compromisso?

📞 *Telefone:* ${settings.phone}
💬 *WhatsApp:* ${settings.whatsapp}
📍 *Extintores Juazeiro - CNPJ:${settings.cnpj}*
🏢 ${settings.address} - ${settings.neighborhood} - ${settings.city}-${settings.state}
👷 *Resp. Técnico:* ${settings.responsibleName}`;
  };

  const generateMultiMessage = (cl: Client | null, exts: FireExtinguisher[]) => {
    const clientName = cl?.name || 'Cliente';
    const listText = exts
      .map((e, i) => {
        const isExp =
          e.status === 'VENCIDO' ||
          (e.nextRechargeDate && new Date(e.nextRechargeDate) < new Date());
        return `  ${i + 1}. *${e.number}* (${e.type} ${e.capacity})
     Local: ${e.location}
     Vencimento: ${formatDateBR(e.nextRechargeDate)} ${isExp ? '❌ *VENCIDO*' : '⚠️ *A Vencer*'}`;
      })
      .join('\n\n');

    return `⚠️ *EXTINTORES JUAZEIRO — RELATÓRIO DE EXTINTORES PARA RECARGA* ⚠️

Olá, *${clientName}*!

Fizemos um levantamento dos equipamentos sob sua responsabilidade e identificamos extintores que necessitam de manutenção/recarga:

${listText}

Para garantir a proteção de sua equipe e instalações em ${settings.city}/${settings.state} e região, estamos à disposição para efetuar a recarga e manutenção preventiva com emissão de laudo técnico.

Podemos preparar um orçamento personalizado para este lote?

📞 *Telefone:* ${settings.phone}
💬 *WhatsApp:* ${settings.whatsapp}
📍 *Extintores Juazeiro - CNPJ:${settings.cnpj}*
🏢 ${settings.address} - ${settings.neighborhood} - ${settings.city}-${settings.state}
👷 *Resp. Técnico:* ${settings.responsibleName}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    const rawPhone = client?.phone || '';
    setPhoneNumber(rawPhone);

    if (mode === 'MULTI' && urgentExtinguishers.length > 0) {
      setMessage(generateMultiMessage(client, urgentExtinguishers));
    } else if (extinguisher) {
      setMessage(generateSingleMessage(extinguisher, client, rawPhone));
    }
  }, [isOpen, extinguisher, client, mode]);

  if (!isOpen || (!extinguisher && urgentExtinguishers.length === 0)) return null;

  const handleSendWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);

    const url =
      cleanPhone.length >= 10
        ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isExpired =
    extinguisher &&
    (extinguisher.status === 'VENCIDO' ||
      (extinguisher.nextRechargeDate && new Date(extinguisher.nextRechargeDate) < new Date()));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="bg-emerald-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Enviar Lembrete de Recarga via WhatsApp
              </h2>
              <p className="text-xs text-emerald-100">
                Notificação automática para o cliente sobre extintores vencidos ou a vencer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Seletor de Modo se houver múltiplos extintores do cliente */}
          {urgentExtinguishers.length > 1 && (
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('SINGLE');
                  if (extinguisher) {
                    setMessage(generateSingleMessage(extinguisher, client, phoneNumber));
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  mode === 'SINGLE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apenas Este Extintor ({extinguisher?.number})
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('MULTI');
                  setMessage(generateMultiMessage(client, urgentExtinguishers));
                }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  mode === 'MULTI'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lote Completo do Cliente ({urgentExtinguishers.length} extintores)
              </button>
            </div>
          )}

          {/* Card Resumo do Extintor */}
          {mode === 'SINGLE' && extinguisher && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {extinguisher.number}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {extinguisher.type} • {extinguisher.capacity}
                  </span>
                </div>
                <p className="text-slate-600">
                  <span className="font-semibold">Local:</span> {extinguisher.location}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Cliente:</span> {client?.name || extinguisher.clientName}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isExpired
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isExpired ? 'VENCIDO' : 'A VENCER'}
                </span>
                <p className="text-[11px] font-bold text-slate-700 mt-1">
                  Vence: {formatDateBR(extinguisher.nextRechargeDate)}
                </p>
              </div>
            </div>
          )}

          {/* Campo Telefone do Cliente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Número do WhatsApp do Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(88) 99999-9999"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Confirme o número com DDD. Você pode alterá-lo caso o cliente use outro contato.
            </p>
          </div>

          {/* Prévia da Mensagem (Editável) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mensagem Formatada para Envio
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-sans focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Ações */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/30 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Enviar via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
