import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Copy,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import type { Quote, QuoteStatus, CompanySettings } from '../../types';
import {
  formatCurrency,
  formatDateBR,
  generateQuotePDF,
  shareQuoteWhatsAppWithPdf,
  shareQuoteWhatsApp,
} from '../../services/pdfGenerator';

interface QuotesListProps {
  quotes: Quote[];
  settings: CompanySettings;
  onNewQuote: () => void;
  onViewQuote: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onUpdateStatus: (id: string, status: QuoteStatus) => void;
}

export const QuotesList: React.FC<QuotesListProps> = ({
  quotes,
  settings,
  onNewQuote,
  onViewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

  // Obter clientes únicos para o filtro
  const uniqueClients = useMemo(() => {
    const names = new Set<string>();
    quotes.forEach((q) => {
      if (q.clientName) names.add(q.clientName);
    });
    return Array.from(names).sort();
  }, [quotes]);

  // Filtragem e pesquisa avançada
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchSearch =
        q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.responsible && q.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.notes && q.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
      const matchClient = clientFilter === 'ALL' || q.clientName === clientFilter;

      return matchSearch && matchStatus && matchClient;
    });
  }, [quotes, searchTerm, statusFilter, clientFilter]);

  const statusBadges: Record<
    QuoteStatus,
    { label: string; bg: string; text: string; icon: React.FC<{ className?: string }> }
  > = {
    RASCUNHO: { label: 'Rascunho', bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
    ENVIADO: { label: 'Enviado', bg: 'bg-sky-100', text: 'text-sky-800', icon: Send },
    APROVADO: { label: 'Aprovado', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2 },
    RECUSADO: { label: 'Recusado', bg: 'bg-rose-100', text: 'text-rose-800', icon: XCircle },
    EXPIRADO: { label: 'Expirado', bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle },
  };

  const handleDownloadPdf = async (q: Quote) => {
    await generateQuotePDF(q, settings, 'download');
  };

  const handleWhatsApp = (q: Quote) => {
    shareQuoteWhatsAppWithPdf(q, settings);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-red-600" />
            HISTÓRICO DE ORÇAMENTOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pesquise, filtre, edite, duplique, gere PDF e envie propostas para clientes
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Busca por texto */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nº, cliente, responsável, observação..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          {/* Filtro por Status */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Todos os Status ({quotes.length})</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADO">Enviado</option>
              <option value="APROVADO">Aprovado</option>
              <option value="RECUSADO">Recusado</option>
              <option value="EXPIRADO">Expirado</option>
            </select>
          </div>

          {/* Filtro por Cliente */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Todos os Clientes</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Badges de filtro rápido por status */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({quotes.length})
          </button>
          {(['RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO'] as QuoteStatus[]).map((st) => {
            const count = quotes.filter((q) => q.status === st).length;
            const badge = statusBadges[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === st
                    ? 'bg-red-600 text-white shadow-xs'
                    : `${badge.bg} ${badge.text} hover:opacity-80`
                }`}
              >
                <span>{badge.label}</span>
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista / Tabela de Orçamentos */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nº / Data</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-3">Validade</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Valor Total</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {filteredQuotes.map((quote) => {
                const badge = statusBadges[quote.status] || statusBadges.RASCUNHO;
                const StatusIcon = badge.icon;

                return (
                  <tr
                    key={quote.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Número e Data */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        Nº {quote.number}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateBR(quote.date)}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {quote.clientName}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">
                        {quote.items.length} item(ns): {quote.items.map(i => i.productService).slice(0, 2).join(', ')}
                        {quote.items.length > 2 ? '...' : ''}
                      </div>
                    </td>

                    {/* Validade */}
                    <td className="py-3.5 px-3 text-slate-700 text-xs font-medium">
                      {formatDateBR(quote.validUntil)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <select
                        value={quote.status}
                        onChange={(e) => onUpdateStatus(quote.id, e.target.value as QuoteStatus)}
                        className={`text-xs font-black px-2.5 py-1 rounded-full border-none cursor-pointer focus:ring-2 focus:ring-red-500 ${badge.bg} ${badge.text}`}
                      >
                        <option value="RASCUNHO">RASCUNHO</option>
                        <option value="ENVIADO">ENVIADO</option>
                        <option value="APROVADO">APROVADO</option>
                        <option value="RECUSADO">RECUSADO</option>
                        <option value="EXPIRADO">EXPIRADO</option>
                      </select>
                    </td>

                    {/* Valor Total */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {formatCurrency(quote.total)}
                      </div>
                      {quote.discount > 0 && (
                        <div className="text-[11px] text-red-600 font-semibold">
                          Desc. {formatCurrency(quote.discount)}
                        </div>
                      )}
                    </td>

                    {/* Ações Requisitadas: Abrir, Editar, Duplicar, Gerar PDF, Compartilhar, Alterar Status */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Abrir */}
                        <button
                          onClick={() => onViewQuote(quote)}
                          title="Visualizar Proposta"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Gerar PDF */}
                        <button
                          onClick={() => handleDownloadPdf(quote)}
                          title="Baixar PDF do Orçamento"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={() => handleWhatsApp(quote)}
                          title="Enviar via WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                        >
                          <Phone className="w-4 h-4" />
                        </button>

                        {/* Duplicar */}
                        <button
                          onClick={() => onDuplicateQuote(quote)}
                          title="Duplicar Orçamento"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => onEditQuote(quote)}
                          title="Editar Orçamento"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir o orçamento Nº ${quote.number}?`)) {
                              onDeleteQuote(quote.id);
                            }
                          }}
                          title="Excluir Orçamento"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">Nenhum orçamento encontrado.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajuste os filtros de pesquisa ou crie um novo orçamento.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
