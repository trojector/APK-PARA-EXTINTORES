import React from 'react';
import {
  FileText,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Share2,
} from 'lucide-react';
import type { DashboardStats, Quote, FireExtinguisher, CompanySettings } from '../types';
import { formatCurrency, formatDateBR, shareQuoteWhatsAppWithPdf, shareQuoteWhatsApp } from '../services/pdfGenerator';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface DashboardProps {
  stats: DashboardStats;
  recentQuotes: Quote[];
  expiringExtinguishers: FireExtinguisher[];
  settings: CompanySettings;
  onNavigate: (tab: 'INICIO' | 'CLIENTES' | 'EXTINTORES' | 'SERVICOS' | 'ORCAMENTOS' | 'MENU') => void;
  onNewQuote: (prefillClientId?: string, prefillNotes?: string) => void;
  onNewExtinguisher: () => void;
  onViewQuote: (quote: Quote) => void;
  onGeneratePdf: (quote: Quote) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  recentQuotes,
  expiringExtinguishers,
  settings,
  onNavigate,
  onNewQuote,
  onNewExtinguisher,
  onViewQuote,
  onGeneratePdf,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Boas-Vindas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            EXTINTORES JUAZEIRO • GESTÃO & ORÇAMENTOS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Painel de Controle Operacional
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Gerencie extintores, inspeções técnicas e emita orçamentos profissionais em PDF com agilidade para Juazeiro/BA e Vale do São Francisco.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNewQuote()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-900/40 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Orçamento
            </button>
            <button
              onClick={onNewExtinguisher}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-sm font-bold transition"
            >
              <Flame className="w-4 h-4 text-red-400" />
              Cadastrar Extintor
            </button>
            <button
              onClick={() => onNavigate('CHECKLIST' as any)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Checklist NBR 12962
            </button>
            <button
              onClick={() => onNavigate('NOTA_FISCAL' as any)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Emissor NFS-e
            </button>
            <button
              onClick={() => onNavigate('ORCAMENTOS')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
            >
              Ver Orçamentos
              <ArrowRight className="w-4 h-4" />
            </button>

            <PWAInstallButton variant="hero" />
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: ORÇAMENTOS (Requisito 11) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-600" />
              ORÇAMENTOS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Desempenho e indicadores dos orçamentos da empresa
            </p>
          </div>
          <button
            onClick={() => onNavigate('ORCAMENTOS')}
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Acessar Módulo Completo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Cards Requisitados de Orçamentos */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Orçamentos em Aberto (Rascunho) */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Em Aberto
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.quotesOpen}
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-medium">
              Rascunhos em elaboração
            </p>
          </div>

          {/* 2. Orçamentos Enviados */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enviados
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.quotesSent}
            </div>
            <p className="text-[11px] text-sky-700 mt-1 font-medium">
              Aguardando retorno do cliente
            </p>
          </div>

          {/* 3. Orçamentos Aprovados */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-100 bg-emerald-50/20 shadow-xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Aprovados
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {stats.quotesApproved}
            </div>
            <p className="text-[11px] text-emerald-800 mt-1 font-bold">
              {formatCurrency(stats.totalApprovedAmount)}
            </p>
          </div>

          {/* 4. Orçamentos Recusados */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recusados
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.quotesRejected}
            </div>
            <p className="text-[11px] text-rose-700 mt-1 font-medium">
              Não aprovados pelo cliente
            </p>
          </div>

          {/* 5. Valor Total dos Orçamentos */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl p-4 sm:p-5 text-white shadow-md shadow-red-900/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-100 uppercase tracking-wider">
                Valor Total
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white truncate">
              {formatCurrency(stats.totalQuotesAmount)}
            </div>
            <p className="text-[11px] text-red-100 mt-1 font-medium">
              Total emitido no período
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO OPERACIONAL: EXTINTORES E CLIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Extintores */}
        <div
          onClick={() => onNavigate('EXTINTORES')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-red-600 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.extinguishersTotal}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Extintores Cadastrados
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              {stats.extinguishersActive} em dia
            </span>
            {stats.extinguishersExpired > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                {stats.extinguishersExpired} vencidos
              </span>
            )}
          </div>
        </div>

        {/* Alerta de Vencimentos */}
        <div
          onClick={() => onNavigate('EXTINTORES')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
              Revisar <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats.extinguishersExpiringSoon}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Recargas a Vencer em 30 Dias
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Oportunidades imediatas de orçamentos de recarga
          </p>
        </div>

        {/* Clientes Atendidos */}
        <div
          onClick={() => onNavigate('CLIENTES')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
              Gerenciar <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.clientsTotal}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Clientes Cadastrados
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Empresas, condomínios e indústrias da região
          </p>
        </div>
      </div>

      {/* GRID DUPLO: ORÇAMENTOS RECENTES + EXTINTORES PARA RECARGA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Orçamentos Recentes
              </h3>
            </div>
            <button
              onClick={() => onNavigate('ORCAMENTOS')}
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Ver histórico completo →
            </button>
          </div>

          <div className="space-y-3">
            {recentQuotes.slice(0, 4).map((quote) => (
              <div
                key={quote.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      Nº {quote.number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        quote.status === 'APROVADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : quote.status === 'ENVIADO'
                          ? 'bg-sky-100 text-sky-800'
                          : quote.status === 'RECUSADO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                    {quote.clientName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{formatDateBR(quote.date)}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(quote.total)}
                    </span>
                    <span>•</span>
                    <span>{quote.items.length} item(ns)</span>
                  </div>
                </div>

                {/* Ações rápidas */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onViewQuote(quote)}
                    title="Visualizar Proposta"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => onGeneratePdf(quote)}
                    title="Baixar PDF"
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareQuoteWhatsAppWithPdf(quote, settings)}
                    title="Enviar Orçamento e PDF no WhatsApp"
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {recentQuotes.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum orçamento cadastrado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Extintores a Vencer / Vencidos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Extintores com Recarga Urgente
              </h3>
            </div>
            <button
              onClick={() => onNavigate('EXTINTORES')}
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Ver todos →
            </button>
          </div>

          <div className="space-y-3">
            {expiringExtinguishers.slice(0, 4).map((ext) => (
              <div
                key={ext.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {ext.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {ext.type} • {ext.capacity}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ext.status === 'VENCIDO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ext.status === 'VENCIDO' ? 'VENCIDO' : 'A VENCER'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                    {ext.clientName}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    Local: {ext.location} | Recarga até: {formatDateBR(ext.nextRechargeDate)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    onNewQuote(
                      ext.clientId,
                      `Proposta gerada a partir do extintor ${ext.number} (${ext.type} ${ext.capacity}) localizado em: ${ext.location}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition"
                >
                  Orçar Recarga
                </button>
              </div>
            ))}

            {expiringExtinguishers.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Todos os extintores estão regulares!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
