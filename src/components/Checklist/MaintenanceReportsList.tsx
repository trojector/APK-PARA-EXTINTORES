import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Download,
  Share2,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  User,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import type { MaintenanceReport, MaintenanceReportItem, CompanySettings, Client } from '../../types';
import { generateMaintenanceReportPDF, formatDateBR } from '../../services/maintenancePdfGenerator';

interface MaintenanceReportsListProps {
  reports: MaintenanceReport[];
  clients: Client[];
  settings: CompanySettings;
  onNewReport: () => void;
  onEditReport: (report: MaintenanceReport) => void;
  onDeleteReport: (id: string) => void;
  onViewReport: (report: MaintenanceReport) => void;
}

export const MaintenanceReportsList: React.FC<MaintenanceReportsListProps> = ({
  reports,
  settings,
  onNewReport,
  onEditReport,
  onDeleteReport,
  onViewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'RECENT'>('ALL');

  const filteredReports = reports.filter((rep) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      rep.reportNumber.toLowerCase().includes(q) ||
      rep.clientName.toLowerCase().includes(q) ||
      (rep.orderNumber && rep.orderNumber.toLowerCase().includes(q)) ||
      (rep.invoiceNumber && rep.invoiceNumber.toLowerCase().includes(q)) ||
      (rep.clientDocument && rep.clientDocument.includes(q)) ||
      (rep.responsibleOperator && rep.responsibleOperator.toLowerCase().includes(q));

    return matchesSearch;
  });

  const handleDownloadPDF = async (e: React.MouseEvent, report: MaintenanceReport) => {
    e.stopPropagation();
    await generateMaintenanceReportPDF(report, settings, 'download');
  };

  const handleShareWhatsApp = async (e: React.MouseEvent, report: MaintenanceReport) => {
    e.stopPropagation();
    await generateMaintenanceReportPDF(report, settings, 'whatsapp');
  };

  const handleSendEmail = async (e: React.MouseEvent, report: MaintenanceReport) => {
    e.stopPropagation();
    await generateMaintenanceReportPDF(report, settings, 'email');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Norma ABNT NBR 12962 / 12274 / EB 160
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            Relatórios de Manutenção & Checklist NBR
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Inspeção Nível I, II e III (Teste Hidrostático Quinquenal, pesagem PV/PC, expansão volumétrica e peças substituídas).
          </p>
        </div>

        <button
          onClick={onNewReport}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NOVO RELATÓRIO NBR</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, nº relatório, pedido..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 self-end sm:self-center">
          <span>Total cadastrados:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
            {reports.length}
          </span>
        </div>
      </div>

      {/* List of Reports */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum relatório encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Crie o primeiro relatório técnico com o checklist de cilindros, pesagem e teste hidrostático conforme a NBR 12962.
          </p>
          <button
            onClick={onNewReport}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Relatório Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onViewReport(report)}
              className="bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all p-5 cursor-pointer relative group flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 font-black text-xs">
                    RELATÓRIO Nº {report.reportNumber.padStart(5, '0')}
                  </span>
                  {report.orderNumber && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Pedido: {report.orderNumber}
                    </span>
                  )}
                  {report.invoiceNumber && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      NF: {report.invoiceNumber}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto md:ml-0 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateBR(report.date)}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-600 transition-colors">
                      {report.clientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      CNPJ: {report.clientDocument || 'Não informado'} • {report.city || 'Juazeiro'}/{report.state || 'BA'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{report.items.length}</strong> cilindros inspecionados
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Resp.: <strong>{report.responsibleOperator}</strong> ({report.operatorRegistration})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={(e) => handleShareWhatsApp(e, report)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Enviar Relatório PDF no WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSendEmail(e, report)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Enviar Relatório PDF por E-mail"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-mail</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownloadPDF(e, report)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Baixar PDF Técnico A4 Paisagem"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditReport(report);
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                  title="Editar Relatório"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Deseja realmente excluir o Relatório Nº ${report.reportNumber}?`)) {
                      onDeleteReport(report.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Excluir Relatório"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
