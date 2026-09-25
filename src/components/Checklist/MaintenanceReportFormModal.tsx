import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  FileText,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type {
  MaintenanceReport,
  MaintenanceReportItem,
  MaintenanceReportPartsCount,
  Client,
  CompanySettings,
} from '../../types';

interface MaintenanceReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: MaintenanceReport) => Promise<void>;
  editingReport: MaintenanceReport | null;
  clients: Client[];
  settings: CompanySettings;
  nextReportNumber: string;
}

const DEFAULT_PARTS: MaintenanceReportPartsCount = {
  pintura: 0,
  pinturaRet: 0,
  pistola: 0,
  valvula: 0,
  bucha: 0,
  sifao: 0,
  punhoPino: 0,
  quebraJato: 0,
  manometro: 0,
  mangueira: 0,
  cordPlastico: 0,
  saiaPlastica: 0,
  conjApague: 0,
  difusor: 0,
  peraVedacao: 0,
  molaRosca: 0,
  conjMiolo: 0,
  conjHaste: 0,
  anelOring: 0,
  sifaoAluminio: 0,
  conjSeguranca: 0,
  hastePValvula: 0,
  ganchoSuporte: 0,
  travaCorrente: 0,
};

export const MaintenanceReportFormModal: React.FC<MaintenanceReportFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingReport,
  clients,
  settings,
  nextReportNumber,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [reportNumber, setReportNumber] = useState(
    editingReport?.reportNumber || nextReportNumber
  );
  const [orderNumber, setOrderNumber] = useState(editingReport?.orderNumber || '');
  const [invoiceNumber, setInvoiceNumber] = useState(editingReport?.invoiceNumber || '');
  const [date, setDate] = useState(editingReport?.date || todayStr);
  const [deliveryDate, setDeliveryDate] = useState(editingReport?.deliveryDate || todayStr);

  // Client info
  const [clientId, setClientId] = useState(editingReport?.clientId || '');
  const [clientName, setClientName] = useState(editingReport?.clientName || '');
  const [fantasyName, setFantasyName] = useState(editingReport?.fantasyName || '');
  const [clientDocument, setClientDocument] = useState(editingReport?.clientDocument || '');
  const [stateRegistration, setStateRegistration] = useState(editingReport?.stateRegistration || '');
  const [contactPerson, setContactPerson] = useState(editingReport?.contactPerson || '');
  const [phone, setPhone] = useState(editingReport?.phone || '');
  const [clientEmail, setClientEmail] = useState(editingReport?.clientEmail || '');
  const [address, setAddress] = useState(editingReport?.address || '');
  const [numberStreet, setNumberStreet] = useState(editingReport?.numberStreet || 'S/N');
  const [neighborhood, setNeighborhood] = useState(editingReport?.neighborhood || '');
  const [city, setCity] = useState(editingReport?.city || 'Juazeiro');
  const [state, setState] = useState(editingReport?.state || 'BA');
  const [zipCode, setZipCode] = useState(editingReport?.zipCode || '');
  const [salesperson, setSalesperson] = useState(editingReport?.salesperson || '');

  // Operator
  const [responsibleOperator, setResponsibleOperator] = useState(
    editingReport?.responsibleOperator || 'ARILSON LEONEL DOS SANTOS'
  );
  const [operatorRegistration, setOperatorRegistration] = useState(
    editingReport?.operatorRegistration || 'CFT/BA:58098216268'
  );
  const [technicalNotes, setTechnicalNotes] = useState(
    editingReport?.technicalNotes ||
      'Relatório de Manutenção emitido em conformidade com as normas ABNT NBR 12962 / NBR 12274 / EB 160.'
  );

  // Items
  const [items, setItems] = useState<MaintenanceReportItem[]>(
    editingReport?.items && editingReport.items.length > 0
      ? editingReport.items
      : [
          {
            id: `item-${Date.now()}`,
            seq: 1,
            cylinderNumber: '',
            manufactureYear: '2020',
            lastHydrotestYear: '2024',
            manufacturerBrand: 'Mocelin',
            extinguisherType: 'CO2',
            nominalCapacity: '02 Kg',
            patrimonyNumber: '',
            fireRating: '2bc',
            projectCode: '',
            nbrStandard: '12630',
            maintenanceLevel: 3,
            agentTraceability: 'LOTE-CO2-0926',
            paintRepaired: true,
            accessories: 'Difusor',
            tareWeight: '6.5',
            emptyWeightPV: '6.50',
            fullWeightPC: '8.50',
            massLossPercent: '0.0',
            maxChargeCapacity: '2.0',
            volumeLiters: '3.0',
            workingPressurePNC: '124',
            testPressure: '210',
            totalExpansionET_DVM: '12.0',
            permanentExpansionEP_DVP: '0.2',
            permanentExpansionPercent: '1.6',
            inmetroSealNumber: '',
            result: 'A',
          },
        ]
  );

  // Parts Count
  const [partsCount, setPartsCount] = useState<MaintenanceReportPartsCount>(
    editingReport?.partsCount || DEFAULT_PARTS
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'DADOS' | 'ITENS' | 'PECAS'>('ITENS');

  // Handle client select
  const handleSelectClient = (cId: string) => {
    setClientId(cId);
    const selected = clients.find((c) => c.id === cId);
    if (selected) {
      setClientName(selected.name);
      setFantasyName(selected.tradeName || selected.name);
      setClientDocument(selected.document);
      setContactPerson(selected.contactPerson || '');
      setPhone(selected.phone);
      setClientEmail(selected.email || '');
      setAddress(selected.address);
      setNeighborhood(selected.neighborhood || '');
      setCity(selected.city);
      setState(selected.state);
    }
  };

  // Add Item
  const handleAddItem = () => {
    const nextSeq = items.length + 1;
    const last = items[items.length - 1];
    const newItem: MaintenanceReportItem = {
      id: `item-${Date.now()}-${nextSeq}`,
      seq: nextSeq,
      cylinderNumber: '',
      manufactureYear: last ? last.manufactureYear : '2020',
      lastHydrotestYear: last ? last.lastHydrotestYear : '2024',
      manufacturerBrand: last ? last.manufacturerBrand : 'Mocelin',
      extinguisherType: last ? last.extinguisherType : 'CO2',
      nominalCapacity: last ? last.nominalCapacity : '02 Kg',
      patrimonyNumber: '',
      fireRating: last ? last.fireRating : '2bc',
      projectCode: '',
      nbrStandard: last ? last.nbrStandard : '12630',
      maintenanceLevel: last ? last.maintenanceLevel : 3,
      agentTraceability: last ? last.agentTraceability : 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: last ? last.accessories : '',
      tareWeight: last ? last.tareWeight : '6.5',
      emptyWeightPV: last ? last.emptyWeightPV : '6.50',
      fullWeightPC: last ? last.fullWeightPC : '8.50',
      massLossPercent: '0.0',
      maxChargeCapacity: last ? last.maxChargeCapacity : '2.0',
      volumeLiters: last ? last.volumeLiters : '3.0',
      workingPressurePNC: last ? last.workingPressurePNC : '124',
      testPressure: last ? last.testPressure : '210',
      totalExpansionET_DVM: last ? last.totalExpansionET_DVM : '12.0',
      permanentExpansionEP_DVP: last ? last.permanentExpansionEP_DVP : '0.2',
      permanentExpansionPercent: last ? last.permanentExpansionPercent : '1.6',
      inmetroSealNumber: '',
      result: 'A',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, seq: i + 1 }));
    setItems(updated);
  };

  const handleUpdateItem = (idx: number, field: keyof MaintenanceReportItem, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };

    // Auto-calculate EP/ET % if ET and EP are provided
    if (field === 'totalExpansionET_DVM' || field === 'permanentExpansionEP_DVP') {
      const et = parseFloat(field === 'totalExpansionET_DVM' ? val : updated[idx].totalExpansionET_DVM);
      const ep = parseFloat(field === 'permanentExpansionEP_DVP' ? val : updated[idx].permanentExpansionEP_DVP);
      if (!isNaN(et) && !isNaN(ep) && et > 0) {
        const percent = ((ep / et) * 100).toFixed(1);
        updated[idx].permanentExpansionPercent = percent;
      }
    }

    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor informe o nome do cliente');
      return;
    }

    try {
      setIsSubmitting(true);
      const reportData: MaintenanceReport = {
        id: editingReport?.id || `rep-${Date.now()}`,
        reportNumber: reportNumber.trim(),
        orderNumber: orderNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
        date,
        deliveryDate,
        clientId,
        clientName: clientName.trim(),
        fantasyName: fantasyName.trim(),
        clientDocument: clientDocument.trim(),
        stateRegistration: stateRegistration.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        clientEmail: clientEmail.trim(),
        address: address.trim(),
        numberStreet: numberStreet.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        salesperson: salesperson.trim(),
        responsibleOperator: responsibleOperator.trim(),
        operatorRegistration: operatorRegistration.trim(),
        technicalNotes: technicalNotes.trim(),
        items,
        partsCount,
        reclaimedAgents: [{ agentName: 'CO2', weight: '02 Kg' }],
        newAgents: [],
        createdAt: editingReport?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(reportData);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar relatório:', err);
      alert('Erro ao salvar relatório');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 border border-red-500/50 rounded-xl text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                {editingReport ? 'Editar Relatório de Manutenção' : 'Novo Relatório de Manutenção NBR 12962'}
              </h2>
              <p className="text-xs text-slate-400">
                Padrão NBR 12962 / 12274 / EB 160 • Nível I, II e III
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection in modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('ITENS')}
            className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'ITENS'
                ? 'bg-white text-red-600 border-red-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📋 Checklist de Cilindros ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DADOS')}
            className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'DADOS'
                ? 'bg-white text-red-600 border-red-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            🏢 Dados do Cliente & Relatório
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PECAS')}
            className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-all border-b-2 ${
              activeTab === 'PECAS'
                ? 'bg-white text-red-600 border-red-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            🔧 Peças Substituídas / NBR
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ITENS DO CHECKLIST */}
          {activeTab === 'ITENS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
                <div className="text-xs text-red-900">
                  <strong>Checklist de Recipientes:</strong> preencha nº do cilindro, ano fabr., marca, tipo (CO2/Pó), pesagem PV/PC, teste hidrostático e selo INMETRO.
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Adicionar Cilindro
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 w-8 text-center">Seq</th>
                      <th className="p-2 min-w-[90px]">Nº Cilindro</th>
                      <th className="p-2 w-14">Ano Fab.</th>
                      <th className="p-2 w-14">Últ. TH</th>
                      <th className="p-2 min-w-[85px]">Marca</th>
                      <th className="p-2 w-16">Tipo</th>
                      <th className="p-2 w-16">Carga</th>
                      <th className="p-2 w-16">Patrimônio</th>
                      <th className="p-2 w-16">Capac. Ext.</th>
                      <th className="p-2 w-12 text-center">Nível</th>
                      <th className="p-2 w-10 text-center">Pint.</th>
                      <th className="p-2 w-16">PV (kg)</th>
                      <th className="p-2 w-16">PC (kg)</th>
                      <th className="p-2 w-20">P. Trab/Ens</th>
                      <th className="p-2 w-20">ET/EP (mm)</th>
                      <th className="p-2 w-14 text-center">EP/ET%</th>
                      <th className="p-2 min-w-[95px]">Selo INMETRO</th>
                      <th className="p-2 w-12 text-center">A/R/N</th>
                      <th className="p-2 w-8 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="p-1.5 text-center font-bold text-slate-500">{item.seq}</td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.cylinderNumber}
                            onChange={(e) => handleUpdateItem(idx, 'cylinderNumber', e.target.value)}
                            placeholder="152259"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-red-500"
                            required
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.manufactureYear}
                            onChange={(e) => handleUpdateItem(idx, 'manufactureYear', e.target.value)}
                            placeholder="2018"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.lastHydrotestYear}
                            onChange={(e) => handleUpdateItem(idx, 'lastHydrotestYear', e.target.value)}
                            placeholder="2023"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.manufacturerBrand}
                            onChange={(e) => handleUpdateItem(idx, 'manufacturerBrand', e.target.value)}
                            placeholder="Mocelin"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={item.extinguisherType}
                            onChange={(e) => handleUpdateItem(idx, 'extinguisherType', e.target.value)}
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                          >
                            <option value="CO2">CO2</option>
                            <option value="PQS ABC">Pó ABC</option>
                            <option value="PQS BC">Pó BC</option>
                            <option value="AP">Água</option>
                            <option value="EM">Espuma</option>
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.nominalCapacity}
                            onChange={(e) => handleUpdateItem(idx, 'nominalCapacity', e.target.value)}
                            placeholder="02 Kg"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.patrimonyNumber}
                            onChange={(e) => handleUpdateItem(idx, 'patrimonyNumber', e.target.value)}
                            placeholder="WOB-01"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.fireRating}
                            onChange={(e) => handleUpdateItem(idx, 'fireRating', e.target.value)}
                            placeholder="2bc"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={item.maintenanceLevel}
                            onChange={(e) => handleUpdateItem(idx, 'maintenanceLevel', parseInt(e.target.value, 10))}
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </select>
                        </td>
                        <td className="p-1 text-center">
                          <input
                            type="checkbox"
                            checked={item.paintRepaired}
                            onChange={(e) => handleUpdateItem(idx, 'paintRepaired', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.emptyWeightPV}
                            onChange={(e) => handleUpdateItem(idx, 'emptyWeightPV', e.target.value)}
                            placeholder="6.52"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.fullWeightPC}
                            onChange={(e) => handleUpdateItem(idx, 'fullWeightPC', e.target.value)}
                            placeholder="8.52"
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-1">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.workingPressurePNC}
                              onChange={(e) => handleUpdateItem(idx, 'workingPressurePNC', e.target.value)}
                              title="P. Trab (PNC)"
                              placeholder="124"
                              className="w-1/2 px-1 py-1 bg-white border border-slate-300 rounded text-center text-[10px]"
                            />
                            <input
                              type="text"
                              value={item.testPressure}
                              onChange={(e) => handleUpdateItem(idx, 'testPressure', e.target.value)}
                              title="P. Ensaio"
                              placeholder="210"
                              className="w-1/2 px-1 py-1 bg-white border border-slate-300 rounded text-center text-[10px]"
                            />
                          </div>
                        </td>
                        <td className="p-1">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={item.totalExpansionET_DVM}
                              onChange={(e) => handleUpdateItem(idx, 'totalExpansionET_DVM', e.target.value)}
                              title="Expansão Total (ET)"
                              placeholder="12.4"
                              className="w-1/2 px-1 py-1 bg-white border border-slate-300 rounded text-center text-[10px]"
                            />
                            <input
                              type="text"
                              value={item.permanentExpansionEP_DVP}
                              onChange={(e) => handleUpdateItem(idx, 'permanentExpansionEP_DVP', e.target.value)}
                              title="Expansão Perm. (EP)"
                              placeholder="0.2"
                              className="w-1/2 px-1 py-1 bg-white border border-slate-300 rounded text-center text-[10px]"
                            />
                          </div>
                        </td>
                        <td className="p-1 text-center font-bold text-slate-700">
                          {item.permanentExpansionPercent ? `${item.permanentExpansionPercent}%` : '-'}
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={item.inmetroSealNumber}
                            onChange={(e) => handleUpdateItem(idx, 'inmetroSealNumber', e.target.value)}
                            placeholder="317360778"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-red-600 font-bold"
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={item.result}
                            onChange={(e) => handleUpdateItem(idx, 'result', e.target.value as any)}
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-center font-black text-xs text-emerald-700"
                          >
                            <option value="A">A</option>
                            <option value="R">R</option>
                            <option value="N">N</option>
                          </select>
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DADOS DO CLIENTE & RELATÓRIO */}
          {activeTab === 'DADOS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº Relatório</label>
                  <input
                    type="text"
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº Pedido</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="4505396759"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nota Fiscal</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="00033"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Emissão / Entrega</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-red-600" />
                    Dados da Empresa / Cliente
                  </h3>

                  {clients.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Selecionar existente:</span>
                      <select
                        onChange={(e) => handleSelectClient(e.target.value)}
                        value={clientId}
                        className="text-xs py-1 px-2 border border-slate-300 rounded bg-white"
                      >
                        <option value="">-- Escolher Cliente --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Razão Social</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Wobben Windpower Ind. e Com. Ltda"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CNPJ / CPF</label>
                    <input
                      type="text"
                      value={clientDocument}
                      onChange={(e) => setClientDocument(e.target.value)}
                      placeholder="01.027.335/0024-52"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Inscrição Estadual (IE)</label>
                    <input
                      type="text"
                      value={stateRegistration}
                      onChange={(e) => setStateRegistration(e.target.value)}
                      placeholder="121471923 ou ISENTO"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Contato / Responsável</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="ARI CESAR"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Telefone / Celular</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(15) 2101-1700"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">E-mail para Envio do Laudo</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="financeiro@empresa.com.br"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="AC IMOVEL DENOMINADO ROCA NOVA"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cidade / UF</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="SENTO-SÉ ou Juazeiro"
                        className="w-3/4 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="BA"
                        className="w-1/4 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="ZONA RURAL ou CENTRO"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CEP</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="47350-000"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Responsável Técnico Operacional */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsável Operacional</label>
                  <input
                    type="text"
                    value={responsibleOperator}
                    onChange={(e) => setResponsibleOperator(e.target.value)}
                    placeholder="ARILSON LEONEL DOS SANTOS"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registro Profissional / Conselho</label>
                  <input
                    type="text"
                    value={operatorRegistration}
                    onChange={(e) => setOperatorRegistration(e.target.value)}
                    placeholder="CFT/BA:58098216268"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PEÇAS E COMPONENTES SUBSTITUÍDOS */}
          {activeTab === 'PECAS' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Componentes e Acessórios Substituídos (NBR 12962):</strong> Preencha as quantidades dos itens revisados ou trocados durante a manutenção.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.keys(DEFAULT_PARTS).map((partKey) => {
                  const labelMap: Record<string, string> = {
                    pintura: 'Pintura',
                    pinturaRet: 'Pintura Ret',
                    pistola: '1-Pistola',
                    valvula: '2-Válvula',
                    bucha: '3-Bucha',
                    sifao: '4-Sifão',
                    punhoPino: '5-Punho-Pino',
                    quebraJato: '6-Quebra Jato',
                    manometro: '7-Manômetro',
                    mangueira: '8-Mangueira',
                    cordPlastico: '9-Cord. Plástico',
                    saiaPlastica: '10-Saia Plástica',
                    conjApague: '11-Conj. Apague',
                    difusor: '12-Difusor',
                    peraVedacao: '13-Pera/Vedação',
                    molaRosca: '14-Mola/Rosca',
                    conjMiolo: '15-Conj. Miolo',
                    conjHaste: '16-Conj. Haste',
                    anelOring: '17-Anel Oring',
                    sifaoAluminio: '18-Sifão Alumínio',
                    conjSeguranca: '19-Conj. Segur.',
                    hastePValvula: '20-Haste p/Válv.',
                    ganchoSuporte: '21-Gancho Suporte',
                    travaCorrente: '22-Trava e Corr.',
                  };

                  return (
                    <div key={partKey} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700 truncate" title={labelMap[partKey]}>
                        {labelMap[partKey] || partKey}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={(partsCount as any)[partKey] || 0}
                        onChange={(e) =>
                          setPartsCount({
                            ...partsCount,
                            [partKey]: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="mt-1 w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar e Concluir Relatório'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
