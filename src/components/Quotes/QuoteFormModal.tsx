import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  FileText,
  User,
  Calendar,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import type { Quote, QuoteItem, Client, ServiceItem, QuoteStatus, CompanySettings } from '../../types';
import { formatCurrency } from '../../services/pdfGenerator';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: Quote) => Promise<void>;
  editingQuote?: Quote | null;
  clients: Client[];
  services: ServiceItem[];
  settings: CompanySettings;
  prefillClientId?: string;
  prefillNotes?: string;
  nextQuoteNumber: string;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingQuote,
  clients,
  services,
  settings,
  prefillClientId,
  prefillNotes,
  nextQuoteNumber,
}) => {
  const [number, setNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [date, setDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [responsible, setResponsible] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('À vista ou faturado 28 dias após entrega');
  const [deliveryTime, setDeliveryTime] = useState('2 a 3 dias úteis');
  const [warranty, setWarranty] = useState('12 meses para serviços e recargas');
  const [status, setStatus] = useState<QuoteStatus>('RASCUNHO');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar estado ao abrir
  useEffect(() => {
    if (!isOpen) return;

    if (editingQuote) {
      setNumber(editingQuote.number);
      setClientId(editingQuote.clientId);
      setClientName(editingQuote.clientName);
      setClientDocument(editingQuote.clientDocument || '');
      setClientPhone(editingQuote.clientPhone || '');
      setClientEmail(editingQuote.clientEmail || '');
      setClientAddress(editingQuote.clientAddress || '');
      setDate(editingQuote.date);
      setValidUntil(editingQuote.validUntil);
      setResponsible(editingQuote.responsible);
      setNotes(editingQuote.notes || '');
      setPaymentTerms(editingQuote.paymentTerms || '');
      setDeliveryTime(editingQuote.deliveryTime || '');
      setWarranty(editingQuote.warranty || '');
      setStatus(editingQuote.status);
      setItems(editingQuote.items || []);
      setAdditionalDiscount(editingQuote.discount || 0);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + (settings.defaultValidityDays || 10));
      const validStr = validDate.toISOString().split('T')[0];

      setNumber(nextQuoteNumber || '000001');
      setDate(today);
      setValidUntil(validStr);
      setResponsible(settings.responsibleName || '');
      setNotes(prefillNotes || settings.defaultNotes || '');
      setStatus('RASCUNHO');
      setPaymentTerms('À vista ou faturado 28 dias');
      setDeliveryTime('2 a 3 dias úteis');
      setWarranty('12 meses');
      setAdditionalDiscount(0);

      if (prefillClientId) {
        const client = clients.find((c) => c.id === prefillClientId);
        if (client) {
          setClientId(client.id);
          setClientName(client.name);
          setClientDocument(client.document || '');
          setClientPhone(client.phone || '');
          setClientEmail(client.email || '');
          setClientAddress(`${client.address}, ${client.city} - ${client.state}`);
        }
      } else {
        setClientId('');
        setClientName('');
        setClientDocument('');
        setClientPhone('');
        setClientEmail('');
        setClientAddress('');
      }

      // Adicionar primeiro item de exemplo
      setItems([
        {
          id: `item-${Date.now()}-1`,
          quoteId: '',
          serviceId: 'srv-002',
          productService: 'Recarga de extintor PQS 6 kg ABC',
          description: 'Recarga completa com troca de pó químico seco e anel de garantia',
          quantity: 1,
          unit: 'UN',
          unitPrice: 50.0,
          discount: 0,
          subtotal: 50.0,
        },
      ]);
    }
  }, [isOpen, editingQuote, clients, prefillClientId, prefillNotes, nextQuoteNumber, settings]);

  if (!isOpen) return null;

  // Atualizar dados do cliente quando selecionado
  const handleClientChange = (selectedId: string) => {
    setClientId(selectedId);
    const client = clients.find((c) => c.id === selectedId);
    if (client) {
      setClientName(client.name);
      setClientDocument(client.document || '');
      setClientPhone(client.phone || '');
      setClientEmail(client.email || '');
      setClientAddress(`${client.address}, ${client.neighborhood ? client.neighborhood + ', ' : ''}${client.city} - ${client.state}`);
    }
  };

  // Ajuste rápido de validade
  const setValidityDays = (days: number) => {
    const baseDate = date ? new Date(date) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    setValidUntil(baseDate.toISOString().split('T')[0]);
  };

  // Adicionar item em branco ou pré-configurado
  const handleAddItem = (service?: ServiceItem) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      quoteId: editingQuote?.id || '',
      serviceId: service?.id,
      productService: service ? service.name : '',
      description: service ? service.description : '',
      quantity: 1,
      unit: service ? service.unit : 'UN',
      unitPrice: service ? service.defaultPrice : 0,
      discount: 0,
      subtotal: service ? service.defaultPrice : 0,
    };
    setItems([...items, newItem]);
  };

  // Atualizar campo de um item
  const handleUpdateItem = (
    index: number,
    field: keyof QuoteItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Se mudou o serviço selecionado no dropdown
    if (field === 'serviceId') {
      const srv = services.find((s) => s.id === value);
      if (srv) {
        item.productService = srv.name;
        item.description = srv.description;
        item.unit = srv.unit;
        item.unitPrice = srv.defaultPrice;
      }
    }

    // Recalcular subtotal do item
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    item.subtotal = Math.max(0, qty * price - disc);

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Cálculos automáticos do orçamento
  const rawSubtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const itemsDiscount = items.reduce((acc, item) => acc + (Number(item.discount) || 0), 0);
  const totalDiscount = itemsDiscount + (Number(additionalDiscount) || 0);
  const finalTotal = Math.max(0, rawSubtotal - totalDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor, informe ou selecione o cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um item ao orçamento.');
      return;
    }

    try {
      setIsSaving(true);
      const quoteData: Quote = {
        id: editingQuote?.id || '',
        number: number.trim() || nextQuoteNumber,
        clientId: clientId || 'cli-custom',
        clientName: clientName.trim(),
        clientDocument: clientDocument.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: clientAddress.trim(),
        date: date || new Date().toISOString().split('T')[0],
        validUntil: validUntil || date,
        responsible: responsible.trim() || settings.responsibleName,
        notes: notes.trim(),
        status,
        items: items.map((item, idx) => ({
          ...item,
          sortOrder: idx + 1,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          discount: Number(item.discount) || 0,
          subtotal: Math.max(0, (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0) - (Number(item.discount) || 0)),
        })),
        subtotal: rawSubtotal,
        discount: totalDiscount,
        total: finalTotal,
        paymentTerms,
        deliveryTime,
        warranty,
        createdAt: editingQuote?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(quoteData);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingQuote ? `Editar Orçamento Nº ${editingQuote.number}` : 'Novo Orçamento de Extintores & Serviços'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os itens e valores para cálculo automático
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Linha 1: Número, Status, Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nº do Orçamento *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="000001"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="RASCUNHO">RASCUNHO</option>
                <option value="ENVIADO">ENVIADO</option>
                <option value="APROVADO">APROVADO</option>
                <option value="RECUSADO">RECUSADO</option>
                <option value="EXPIRADO">EXPIRADO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data de Emissão *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Validade *
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setValidityDays(10)}
                    className="text-[10px] bg-slate-200 hover:bg-red-100 hover:text-red-700 font-bold px-1.5 py-0.5 rounded"
                  >
                    +10d
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityDays(15)}
                    className="text-[10px] bg-slate-200 hover:bg-red-100 hover:text-red-700 font-bold px-1.5 py-0.5 rounded"
                  >
                    +15d
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Linha 2: Cliente e Responsável */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-red-600" />
                Dados do Cliente
              </span>
              <span className="text-xs text-slate-500">
                Selecione um cliente cadastrado ou digite livremente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Selecionar Cliente Cadastrado
                </label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="">-- Escolher cliente existente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.city ? `(${c.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome do Cliente / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Hospital Regional do Cariri"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  CNPJ ou CPF
                </label>
                <input
                  type="text"
                  value={clientDocument}
                  onChange={(e) => setClientDocument(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(74) 99999-9999"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Responsável Técnico / Emissor
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Robson Alves Dias Bonfim"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Endereço Completo do Cliente
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Juazeiro - BA"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* ITENS DO ORÇAMENTO (Requisito 4 & 5) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  Itens do Orçamento
                </h3>
                <p className="text-xs text-slate-500">
                  Adicione recargas, manutenções, inspeções ou produtos personalizados
                </p>
              </div>

              {/* Botão rápido para adicionar serviço de catálogo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Item
                </button>
              </div>
            </div>

            {/* Sugestões rápidas de serviços */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-red-800 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-red-600" />
                Catálogo Rápido:
              </span>
              {services.slice(0, 6).map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleAddItem(srv)}
                  className="text-[11px] font-medium bg-white hover:bg-red-600 hover:text-white text-slate-700 px-2 py-1 rounded-md border border-slate-200 transition shadow-2xs"
                >
                  + {srv.name.replace('Recarga de extintor ', 'Recarga ')} ({formatCurrency(srv.defaultPrice)})
                </button>
              ))}
            </div>

            {/* Lista dos Itens */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const lineTotal =
                  (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) - (Number(item.discount) || 0);

                return (
                  <div
                    key={item.id || index}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>

                      {/* Dropdown de serviços pré-cadastrados */}
                      <select
                        value={item.serviceId || ''}
                        onChange={(e) => handleUpdateItem(index, 'serviceId', e.target.value)}
                        className="flex-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">-- Selecionar do catálogo ou digitar abaixo --</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.category}] {s.name} - {formatCurrency(s.defaultPrice)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remover Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={item.productService}
                        onChange={(e) => handleUpdateItem(index, 'productService', e.target.value)}
                        placeholder="Nome do produto ou serviço (ex: Recarga PQS 6 kg)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        placeholder="Descrição detalhada ou especificações"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Quantidade, Unidade, Preço Unitário, Desconto, Subtotal */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Quantidade *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-center focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Unidade
                        </label>
                        <select
                          value={item.unit || 'UN'}
                          onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center text-slate-700"
                        >
                          <option value="UN">UN</option>
                          <option value="PC">PÇ</option>
                          <option value="KG">KG</option>
                          <option value="SV">SV</option>
                          <option value="CJ">CJ</option>
                          <option value="M">M</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Valor Unit. (R$) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 text-right focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Desconto (R$)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount || 0}
                          onChange={(e) => handleUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-red-600 font-semibold text-right focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-right">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          Subtotal
                        </label>
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RESUMO DE VALORES E TOTAIS CALCULADOS AUTOMATICAMENTE */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-[11px]">SUBTOTAL:</span>
                <span className="font-bold text-white text-base">
                  {formatCurrency(rawSubtotal)}
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[11px]">DESCONTOS:</span>
                <span className="font-bold text-rose-400 text-base">
                  - {formatCurrency(totalDiscount)}
                </span>
              </div>
            </div>

            <div className="text-right bg-red-600 px-4 py-2 rounded-xl">
              <span className="text-red-100 block text-[10px] font-bold uppercase tracking-wider">
                VALOR TOTAL DO ORÇAMENTO:
              </span>
              <span className="font-black text-xl sm:text-2xl text-white">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          {/* Observações e Condições Comerciais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observações do Orçamento
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações técnicas, local de instalação, orientações..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                  Condições de Pagamento
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: Faturado para 28 dias após NF"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                    Prazo de Entrega
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="2 a 3 dias úteis"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                    Garantia
                  </label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="12 meses"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Form com Botões de Ação */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition disabled:opacity-50 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Orçamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
