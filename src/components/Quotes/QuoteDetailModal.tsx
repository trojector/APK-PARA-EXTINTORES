import React, { useState } from 'react';
import {
  X,
  FileText,
  Share2,
  Printer,
  Copy,
  Edit,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  Phone,
  Flame,
  Check,
} from 'lucide-react';
import type { Quote, CompanySettings, QuoteStatus } from '../../types';
import {
  formatCurrency,
  formatDateBR,
  generateQuotePDF,
  shareQuoteWhatsAppWithPdf,
  shareQuoteWhatsApp,
  shareQuoteGeneral,
} from '../../services/pdfGenerator';

interface QuoteDetailModalProps {
  quote: Quote;
  settings: CompanySettings;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (quote: Quote) => void;
  onDuplicate: (quote: Quote) => void;
  onUpdateStatus: (id: string, status: QuoteStatus) => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  settings,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onUpdateStatus,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateQuotePDF(quote, settings, 'download');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateQuotePDF(quote, settings, 'share');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setIsGeneratingPdf(true);
      await shareQuoteWhatsAppWithPdf(quote, settings);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareGeneral = async () => {
    const res = await shareQuoteGeneral(quote, settings);
    if (res === 'copied') {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    }
  };

  const statusConfigs: Record<
    QuoteStatus,
    { label: string; bg: string; text: string; icon: React.FC<{ className?: string }> }
  > = {
    RASCUNHO: { label: 'RASCUNHO', bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
    ENVIADO: { label: 'ENVIADO', bg: 'bg-sky-100', text: 'text-sky-800', icon: Send },
    APROVADO: { label: 'APROVADO', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
    RECUSADO: { label: 'RECUSADO', bg: 'bg-rose-100', text: 'text-rose-800', icon: XCircle },
    EXPIRADO: { label: 'EXPIRADO', bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle },
  };

  const currentStatusConfig = statusConfigs[quote.status] || statusConfigs.RASCUNHO;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none">
        
        {/* Barra de Ações Superior (Escondida na Impressão) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                ORÇAMENTO Nº {quote.number}
              </h2>
              <p className="text-[11px] text-slate-400">
                {quote.clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Selector */}
            <select
              value={quote.status}
              onChange={(e) => onUpdateStatus(quote.id, e.target.value as QuoteStatus)}
              className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="RASCUNHO">RASCUNHO</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="APROVADO">APROVADO</option>
              <option value="RECUSADO">RECUSADO</option>
              <option value="EXPIRADO">EXPIRADO</option>
            </select>

            <button
              onClick={() => onEdit(quote)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              title="Editar Orçamento"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={() => onDuplicate(quote)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              title="Duplicar Orçamento"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Botões Principais de Ação Requisitados: GERAR PDF, COMPARTILHAR PDF, ENVIAR WHATSAPP, COMPARTILHAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. GERAR PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Gerando...' : 'GERAR PDF'}</span>
            </button>

            {/* 2. COMPARTILHAR PDF */}
            <button
              onClick={handleSharePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4 text-red-400" />
              <span>COMPARTILHAR PDF</span>
            </button>

            {/* 3. ENVIAR WHATSAPP */}
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>ENVIAR WHATSAPP</span>
            </button>

            {/* 4. COMPARTILHAR */}
            <button
              onClick={handleShareGeneral}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold transition"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>COMPARTILHAR</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CORPO DO ORÇAMENTO (Layout limpo, fiel ao Requisito 6) */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Cabeçalho da Empresa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                  Extintores Juazeiro
                </h1>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Extintores Juazeiro - CNPJ:{settings.cnpj} - {settings.address} - {settings.neighborhood} - {settings.city}-{settings.state}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Responsável Técnico: <span className="font-semibold text-slate-800">{quote.responsible || settings.responsibleName}</span> • Fone: {settings.phone} • WhatsApp: {settings.whatsapp}
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                PROPOSTA COMERCIAL
              </span>
              <span className="text-xl sm:text-2xl font-black text-red-600">
                ORÇAMENTO Nº {quote.number}
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${currentStatusConfig.bg} ${currentStatusConfig.text}`}
                >
                  {quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Cliente e Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cliente:
              </span>
              <div className="font-extrabold text-slate-900 text-base">
                {quote.clientName}
              </div>
              {quote.clientDocument && (
                <p className="text-xs text-slate-600 mt-0.5">
                  CNPJ/CPF: {quote.clientDocument}
                </p>
              )}
              {quote.clientPhone && (
                <p className="text-xs text-slate-600">
                  Telefone: {quote.clientPhone}
                </p>
              )}
              {quote.clientAddress && (
                <p className="text-xs text-slate-500">
                  Endereço: {quote.clientAddress}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data:
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatDateBR(quote.date)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Validade:
                </span>
                <span className="font-bold text-red-600 text-sm">
                  {formatDateBR(quote.validUntil)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Responsável:
                </span>
                <span className="font-semibold text-slate-700 text-xs">
                  {quote.responsible || settings.responsibleName}
                </span>
              </div>
            </div>
          </div>

          {/* TABELA DE ITENS (Requisito 6: DESCRIÇÃO | QTD | VALOR | TOTAL) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">DESCRIÇÃO</th>
                  <th className="py-3 px-3 text-center">QTD</th>
                  <th className="py-3 px-3 text-center">UN</th>
                  <th className="py-3 px-4 text-right">VALOR</th>
                  <th className="py-3 px-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {quote.items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice - (item.discount || 0);
                  return (
                    <tr
                      key={item.id || index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{item.productService}</div>
                        {item.description && (
                          <div className="text-xs text-slate-500 font-normal mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500 text-xs">
                        {item.unit || 'UN'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Desconto e Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Observações */}
            <div className="w-full sm:max-w-md bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Observações:
              </span>
              <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {quote.notes || 'Nenhuma observação informada.'}
              </p>
              {quote.paymentTerms && (
                <p className="text-xs font-semibold text-slate-700 mt-2">
                  Forma de Pagamento: {quote.paymentTerms}
                </p>
              )}
              {quote.warranty && (
                <p className="text-xs text-slate-500">
                  Garantia: {quote.warranty}
                </p>
              )}
            </div>

            {/* Totais */}
            <div className="w-full sm:w-72 bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(quote.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Desconto:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(quote.discount || 0)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-base font-extrabold text-slate-900">
                  TOTAL:
                </span>
                <span className="text-xl font-black text-red-600">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 max-w-xs mx-auto">
                <p className="font-bold text-slate-900">{quote.clientName}</p>
                <p className="text-slate-500 text-[11px]">De acordo / Assinatura do Cliente</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Data: ____/____/2026</p>
              </div>
            </div>
            <div>
              <div className="border-t border-dashed border-slate-400 pt-2 max-w-xs mx-auto">
                <p className="font-bold text-slate-900">{quote.responsible || settings.responsibleName}</p>
                <p className="text-slate-500 text-[11px]">{settings.name} • {settings.responsibleRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Criado em: {new Date(quote.createdAt).toLocaleString('pt-BR')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
