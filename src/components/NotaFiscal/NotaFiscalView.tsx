import React, { useState } from 'react';
import {
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  HelpCircle,
  AlertCircle,
  FileText,
  Lock,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import type { CompanySettings } from '../../types';

interface NotaFiscalViewProps {
  settings: CompanySettings;
}

export const NotaFiscalView: React.FC<NotaFiscalViewProps> = ({ settings }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);

  const nfseUrl = 'https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional%2f';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenDirect = () => {
    window.open(nfseUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 text-white p-6 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Portal Oficial NFS-e Nacional • Receita Federal & SEFIN
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-blue-400" />
            Emissor Nacional de Nota Fiscal de Serviços (NFS-e)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Acesse o sistema governamental para emissão, consulta e cancelamento de notas fiscais eletrônicas de recarga, manutenção e serviços da <strong>Extintores Juazeiro</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenDirect}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <span>Abrir Emissor NFS-e</span>
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Cartões Rápidos: Dados Fiscais da Empresa para Facilitação de Preenchimento */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Dados Cadastrais da Empresa para Emissão
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">Clique para copiar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CNPJ */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">CNPJ Prestador</span>
              <p className="font-mono font-bold text-xs text-slate-900 mt-0.5">{settings.cnpj}</p>
            </div>
            <button
              onClick={() => copyToClipboard(settings.cnpj, 'cnpj')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Copiar CNPJ"
            >
              {copiedField === 'cnpj' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Razão Social */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Razão Social</span>
              <p className="font-semibold text-xs text-slate-900 mt-0.5 truncate max-w-[150px]">{settings.legalName || settings.name}</p>
            </div>
            <button
              onClick={() => copyToClipboard(settings.legalName || settings.name, 'razao')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Copiar Razão Social"
            >
              {copiedField === 'razao' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Município / UF */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Município Prestação</span>
              <p className="font-semibold text-xs text-slate-900 mt-0.5">{settings.city || 'Juazeiro'} - {settings.state || 'BA'}</p>
            </div>
            <button
              onClick={() => copyToClipboard(`${settings.city} - ${settings.state}`, 'cidade')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Copiar Cidade"
            >
              {copiedField === 'cidade' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* CNAE / Atividade Principal */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Atividade / Serviços</span>
              <p className="font-semibold text-xs text-slate-900 mt-0.5">Recarga & Manutenção</p>
            </div>
            <button
              onClick={() => copyToClipboard('Serviços de manutenção e recarga de extintores de incêndio', 'atividade')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Copiar Atividade"
            >
              {copiedField === 'atividade' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Acesso Seguro ao Emissor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">
              Conexão com o Portal Nacional (nfse.gov.br)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDirect}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir em Nova Aba</span>
            </button>
          </div>
        </div>

        {/* Informações e Instruções */}
        <div className="p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Acesso com Gov.br ou Certificado Digital</h4>
              <p className="text-xs text-slate-500 mt-1">
                Utilize seu login do Gov.br (Prata ou Ouro) ou o Certificado Digital e-CNPJ da Extintores Juazeiro.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Emissão Rápida de NFS-e</h4>
              <p className="text-xs text-slate-500 mt-1">
                Copie os dados do cliente (CNPJ e endereço) na aba <strong>CLIENTES</strong> ou <strong>ORÇAMENTOS</strong> e cole diretamente no emissor.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Vincular ao Checklist NBR</h4>
              <p className="text-xs text-slate-500 mt-1">
                Ao gerar a NFS-e, digite o número no campo <strong>Nota Fiscal</strong> do Relatório Técnico de Manutenção NBR para anexar aos registros.
              </p>
            </div>
          </div>

          {/* Card Central com Botão de Ação Destacado */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-700 text-center max-w-2xl mx-auto shadow-md">
            <FileCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg sm:text-xl font-black text-white">
              Emissor Nacional da Nota Fiscal de Serviços
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 max-w-lg mx-auto">
              Clique no botão abaixo para ser direcionado com segurança à página de login oficial da NFS-e Nacional:
            </p>

            <a
              href={nfseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
            >
              <span>ACESSAR EMISSOR NACIONAL NFS-E</span>
              <ExternalLink className="w-5 h-5" />
            </a>

            <p className="text-[11px] text-slate-400 mt-4 font-mono">
              https://www.nfse.gov.br/EmissorNacional/
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
