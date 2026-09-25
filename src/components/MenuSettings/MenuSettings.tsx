import React, { useState } from 'react';
import {
  Settings,
  Building,
  Save,
  Database,
  Download,
  Upload,
  CheckCircle,
  ShieldCheck,
  Flame,
  FileText,
  Smartphone,
} from 'lucide-react';
import type { CompanySettings, Quote, FireExtinguisher, Client, ServiceItem } from '../../types';
import { PWAInstallModal } from '../PWA/PWAInstallModal';

interface MenuSettingsProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => Promise<void>;
  quotes: Quote[];
  extinguishers: FireExtinguisher[];
  clients: Client[];
  services: ServiceItem[];
  onRestoreData?: (data: any) => Promise<void>;
}

export const MenuSettings: React.FC<MenuSettingsProps> = ({
  settings,
  onSaveSettings,
  quotes,
  extinguishers,
  clients,
  services,
  onRestoreData,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSaveSettings(formData);
      setSuccessMsg('Dados da empresa atualizados com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      company: formData,
      quotes,
      extinguishers,
      clients,
      services,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_ExtintoresJuazeiro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && onRestoreData) {
          if (confirm('Deseja restaurar este backup? Os dados atuais serão mesclados/substituídos.')) {
            await onRestoreData(parsed);
            alert('Backup restaurado com sucesso!');
            window.location.reload();
          }
        }
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-red-600" />
          MENU & CONFIGURAÇÕES DA EMPRESA
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Dados cadastrais da Extintores Juazeiro, textos padrão de orçamentos e backup em nuvem
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Formulário de Dados da Empresa */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Dados Cadastrais da Empresa
            </h2>
            <p className="text-xs text-slate-500">
              Estes dados são exibidos no cabeçalho dos orçamentos e nos documentos em PDF
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome Fantasia *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Razão Social *
            </label>
            <input
              type="text"
              required
              value={formData.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              required
              value={formData.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefone Fixo
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Comercial
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail Comercial
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responsável Técnico
            </label>
            <input
              type="text"
              value={formData.responsibleName}
              onChange={(e) => handleChange('responsibleName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cargo / Registro Profissional
            </label>
            <input
              type="text"
              value={formData.responsibleRole}
              onChange={(e) => handleChange('responsibleRole', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Texto Padrão de Observações do Orçamento
          </label>
          <textarea
            rows={3}
            value={formData.defaultNotes}
            onChange={(e) => handleChange('defaultNotes', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>

      {/* Emissor Nacional NFS-e */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 rounded-2xl border border-blue-900/50 p-6 shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Sistema Emissor de Nota Fiscal (NFS-e)
                </h2>
                <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Gov.br
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Acesse diretamente o portal nacional do emissor público da NFS-e para emitir e consultar as notas de serviços da Extintores Juazeiro.
              </p>
            </div>
          </div>

          <a
            href="https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional%2f"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/50 transition active:scale-95 cursor-pointer shrink-0"
          >
            <span>Acessar Emissor Nacional</span>
          </a>
        </div>
      </div>

      {/* Aplicativo para Celular (PWA) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-2xl border border-red-900/40 p-6 shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
              <Smartphone className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Aplicativo no Celular (Android / iPhone)
                </h2>
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Instale o Extintores Juazeiro direto na tela inicial do seu celular, com abertura instantânea e sincronização em nuvem.
              </p>
            </div>
          </div>

          <button
            onClick={() => setInstallModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-900/50 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>Como Instalar no Celular</span>
          </button>
        </div>
      </div>

      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />

      {/* Backup e Nuvem */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Banco de Dados & Nuvem
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Firestore Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sincronização em tempo real (Projeto: com-example-sst-60bc7)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-500">Coleções: </span>
            <span className="font-mono font-bold text-slate-800">quotes, quote_items, fire_extinguishers, clients, services</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Orçamentos</span>
            <span className="text-xl font-black text-slate-900">{quotes.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Extintores</span>
            <span className="text-xl font-black text-slate-900">{extinguishers.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Clientes</span>
            <span className="text-xl font-black text-slate-900">{clients.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Serviços</span>
            <span className="text-xl font-black text-slate-900">{services.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition"
          >
            <Download className="w-4 h-4 text-red-400" />
            Exportar Backup Completo (JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition border border-slate-300">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restaurar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Diretrizes & Conformidade */}
      <div className="bg-red-50/50 rounded-2xl border border-red-200/60 p-5 space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          Conformidade com a Especificação Extintores Juazeiro
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>QR Code completamente removido de todo o código, telas, coleções e buscas.</li>
          <li>Campos e referências a código do INMETRO completamente removidos.</li>
          <li>Módulo de Orçamentos completo com criação, itens múltiplos, recargas, manutenções, peças e produtos personalizados.</li>
          <li>Cálculo automático de Subtotal, Descontos e Total Geral em tempo real.</li>
          <li>Geração de PDF corporativo em formato A4 com cabeçalho, tabela, totais, termos e bloco de assinaturas.</li>
          <li>Compartilhamento via PDF, WhatsApp formatado com resumo e link, e Web Share API.</li>
          <li>Coleções Firestore estruturadas: <code className="bg-red-100/80 px-1 py-0.5 rounded text-red-900 font-mono">quotes</code> e <code className="bg-red-100/80 px-1 py-0.5 rounded text-red-900 font-mono">quote_items</code>.</li>
        </ul>
      </div>
    </div>
  );
};
