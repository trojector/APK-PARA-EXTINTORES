import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Building,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Mail,
} from 'lucide-react';
import type { MaintenanceReport, CompanySettings } from '../../types';
import { generateMaintenanceReportPDF, formatDateBR } from '../../services/maintenancePdfGenerator';

interface MaintenanceReportDetailModalProps {
  isOpen: boolean;
  report: MaintenanceReport | null;
  settings: CompanySettings;
  onClose: () => void;
  onEdit: (report: MaintenanceReport) => void;
}

export const MaintenanceReportDetailModal: React.FC<MaintenanceReportDetailModalProps> = ({
  isOpen,
  report,
  settings,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !report) return null;

  const handleDownloadPDF = async () => {
    await generateMaintenanceReportPDF(report, settings, 'download');
  };

  const handleShareWhatsApp = async () => {
    await generateMaintenanceReportPDF(report, settings, 'whatsapp');
  };

  const handleSendEmail = async () => {
    await generateMaintenanceReportPDF(report, settings, 'email');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 border border-red-500/50 rounded-xl text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                Relatório Técnico NBR 12962 / 12274 / EB 160
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Relatório Nº {report.reportNumber.padStart(5, '0')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Emissão: {formatDateBR(report.date)}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700">
              {report.items.length} Cilindros
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por E-mail</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF (A4 Paisagem)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(report);
              }}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client & Report Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Cliente</span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{report.clientName}</h4>
              <p className="text-xs text-slate-600 mt-0.5">CNPJ: {report.clientDocument || '-'}</p>
              <p className="text-xs text-slate-600">IE: {report.stateRegistration || 'ISENTO'}</p>
              {report.clientEmail && <p className="text-xs text-blue-600 font-medium truncate">✉ {report.clientEmail}</p>}
              <p className="text-xs text-slate-500 mt-1">{report.address}, Nº {report.numberStreet || 'S/N'}</p>
              <p className="text-xs text-slate-500">{report.city}/{report.state} - CEP {report.zipCode}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Dados Operacionais</span>
              <div className="mt-2 space-y-1 text-xs text-slate-700">
                <p><strong>Pedido:</strong> {report.orderNumber || '-'}</p>
                <p><strong>Nota Fiscal:</strong> {report.invoiceNumber || '-'}</p>
                <p><strong>Contato:</strong> {report.contactPerson || '-'}</p>
                <p><strong>Telefone:</strong> {report.phone || '-'}</p>
                <p><strong>Entrega:</strong> {formatDateBR(report.deliveryDate || report.date)}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Responsável Técnico</span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{report.responsibleOperator}</h4>
              <p className="text-xs text-red-600 font-bold mt-0.5">{report.operatorRegistration}</p>
              <p className="text-xs text-slate-500 mt-2 italic">
                Empresa credenciada em Juazeiro/BA para manutenção Nível 1, 2 e 3 com ensaio hidrostático.
              </p>
            </div>
          </div>

          {/* Checklist Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-600" />
              Checklist NBR 12962 ({report.items.length} Cilindros)
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 text-center">Seq</th>
                    <th className="p-2">Nº Cilindro</th>
                    <th className="p-2">Ano Fab.</th>
                    <th className="p-2">Últ. TH</th>
                    <th className="p-2">Marca</th>
                    <th className="p-2">Tipo / Carga</th>
                    <th className="p-2 text-center">Nível</th>
                    <th className="p-2 text-center">Pint.</th>
                    <th className="p-2 text-center">PV (kg)</th>
                    <th className="p-2 text-center">PC (kg)</th>
                    <th className="p-2 text-center">P. Trab / Ens.</th>
                    <th className="p-2 text-center">ET / EP (mm)</th>
                    <th className="p-2 text-center">EP/ET%</th>
                    <th className="p-2">Selo INMETRO</th>
                    <th className="p-2 text-center">Res.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {report.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-2 text-center font-bold text-slate-500">{item.seq}</td>
                      <td className="p-2 font-mono font-bold text-slate-900">{item.cylinderNumber}</td>
                      <td className="p-2 text-slate-600">{item.manufactureYear}</td>
                      <td className="p-2 text-slate-600">{item.lastHydrotestYear}</td>
                      <td className="p-2 text-slate-800">{item.manufacturerBrand}</td>
                      <td className="p-2 font-semibold text-slate-800">
                        {item.extinguisherType} • {item.nominalCapacity}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-700">{item.maintenanceLevel}</td>
                      <td className="p-2 text-center">{item.paintRepaired ? '✓' : '-'}</td>
                      <td className="p-2 text-center text-slate-600">{item.emptyWeightPV || '-'}</td>
                      <td className="p-2 text-center text-slate-600">{item.fullWeightPC || '-'}</td>
                      <td className="p-2 text-center text-slate-600 font-mono text-[10px]">
                        {item.workingPressurePNC || '-'}/{item.testPressure || '-'}
                      </td>
                      <td className="p-2 text-center text-slate-600 font-mono text-[10px]">
                        {item.totalExpansionET_DVM || '-'}/{item.permanentExpansionEP_DVP || '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-800">
                        {item.permanentExpansionPercent ? `${item.permanentExpansionPercent}%` : '-'}
                      </td>
                      <td className="p-2 font-mono font-bold text-red-600">{item.inmetroSealNumber || '-'}</td>
                      <td className="p-2 text-center font-black text-emerald-600">{item.result || 'A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
