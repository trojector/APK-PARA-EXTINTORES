import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  Edit,
  Trash2,
  FileText,
  User,
  Hash,
  ShieldAlert,
  MessageCircle,
  Phone,
} from 'lucide-react';
import type { FireExtinguisher, Client, ExtinguisherStatus, CompanySettings } from '../../types';
import { formatDateBR } from '../../services/pdfGenerator';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';

interface ExtinguishersListProps {
  extinguishers: FireExtinguisher[];
  clients: Client[];
  settings: CompanySettings;
  onNewExtinguisher: () => void;
  onEditExtinguisher: (ext: FireExtinguisher) => void;
  onDeleteExtinguisher: (id: string) => void;
  onCreateQuoteForExtinguisher: (ext: FireExtinguisher) => void;
}

export const ExtinguishersList: React.FC<ExtinguishersListProps> = ({
  extinguishers,
  clients,
  settings,
  onNewExtinguisher,
  onEditExtinguisher,
  onDeleteExtinguisher,
  onCreateQuoteForExtinguisher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchField, setSearchField] = useState<'ALL' | 'NUMBER' | 'PATRIMONY' | 'SERIAL' | 'LOCATION'>('ALL');
  const [selectedExtinguisher, setSelectedExtinguisher] = useState<FireExtinguisher | null>(null);

  // Estados para o Modal de Lembrete via WhatsApp
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderExtinguisher, setReminderExtinguisher] = useState<FireExtinguisher | null>(null);
  const [reminderClient, setReminderClient] = useState<Client | null>(null);

  const handleOpenReminder = (ext: FireExtinguisher) => {
    const client = clients.find((c) => c.id === ext.clientId || c.name === ext.clientName) || null;
    setReminderExtinguisher(ext);
    setReminderClient(client);
    setIsReminderModalOpen(true);
  };

  // Filtragem estrita conforme especificação (número, patrimônio, série, localização, cliente, status)
  const filteredExtinguishers = useMemo(() => {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    return extinguishers.filter((ext) => {
      // Filtro de Cliente
      if (clientFilter !== 'ALL' && ext.clientId !== clientFilter && ext.clientName !== clientFilter) {
        return false;
      }

      // Filtro de Status / Vencimento
      if (statusFilter !== 'ALL') {
        const nextDate = ext.nextRechargeDate ? new Date(ext.nextRechargeDate) : null;
        if (statusFilter === 'VENCIDO') {
          if (ext.status !== 'VENCIDO' && (!nextDate || nextDate >= today)) return false;
        } else if (statusFilter === 'EXPIRING_SOON') {
          if (!nextDate || nextDate < today || nextDate > in30Days) return false;
        } else if (statusFilter === 'ATIVO') {
          if (ext.status !== 'ATIVO' || (nextDate && nextDate < today)) return false;
        } else if (ext.status !== statusFilter) {
          return false;
        }
      }

      // Pesquisa por campos específicos
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (searchField === 'NUMBER') {
          return ext.number.toLowerCase().includes(term);
        }
        if (searchField === 'PATRIMONY') {
          return ext.patrimonyNumber.toLowerCase().includes(term);
        }
        if (searchField === 'SERIAL') {
          return ext.serialNumber.toLowerCase().includes(term);
        }
        if (searchField === 'LOCATION') {
          return ext.location.toLowerCase().includes(term);
        }
        // Busca geral em todos os campos permitidos
        return (
          ext.number.toLowerCase().includes(term) ||
          ext.patrimonyNumber.toLowerCase().includes(term) ||
          ext.serialNumber.toLowerCase().includes(term) ||
          ext.location.toLowerCase().includes(term) ||
          ext.clientName.toLowerCase().includes(term) ||
          ext.type.toLowerCase().includes(term) ||
          ext.manufacturer.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [extinguishers, searchTerm, clientFilter, statusFilter, searchField]);

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-red-600" />
            CONTROLE DE EXTINTORES
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Localize e gerencie extintores por pesquisa, cliente, número, patrimônio, série e localização
          </p>
        </div>

        <button
          onClick={onNewExtinguisher}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Extintor
        </button>
      </div>

      {/* Painel de Busca Completo (Requisito 1: Pesquisa, Cliente, Nº Extintor, Nº Patrimônio, Nº Série, Localização) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Campo de pesquisa principal */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para localizar o extintor..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          {/* Filtro por Tipo de Campo */}
          <div className="sm:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Pesquisar em Todos os Campos</option>
              <option value="NUMBER">Número do Extintor</option>
              <option value="PATRIMONY">Número de Patrimônio</option>
              <option value="SERIAL">Número de Série</option>
              <option value="LOCATION">Localização / Setor</option>
            </select>
          </div>

          {/* Filtro por Cliente */}
          <div className="sm:col-span-4">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Todos os Clientes ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros Rápidos de Status */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pt-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Filtrar:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({extinguishers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ATIVO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === 'ATIVO'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Regulares / Em Dia
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRING_SOON')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === 'EXPIRING_SOON'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            A Vencer em 30 Dias
          </button>
          <button
            onClick={() => setStatusFilter('VENCIDO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === 'VENCIDO'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {/* Grid de Extintores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExtinguishers.map((ext) => {
          const isExpired =
            ext.status === 'VENCIDO' ||
            (ext.nextRechargeDate && new Date(ext.nextRechargeDate) < new Date());

          return (
            <div
              key={ext.id}
              className={`bg-white rounded-2xl border p-5 transition hover:shadow-md flex flex-col justify-between ${
                isExpired
                  ? 'border-rose-300 bg-rose-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {ext.number}
                      </span>
                      {ext.patrimonyNumber && (
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                          <Hash className="w-3 h-3" />
                          {ext.patrimonyNumber}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-800 text-sm mt-1">
                      {ext.type} • {ext.capacity}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      isExpired
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : ext.status === 'EM_MANUTENCAO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isExpired ? 'VENCIDO' : ext.status}
                  </span>
                </div>

                {/* Dados de Localização e Cliente */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{ext.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ext.location}</span>
                  </div>
                  {ext.serialNumber && (
                    <div className="text-[11px] text-slate-500 pt-0.5">
                      Nº Série: <span className="font-mono font-semibold text-slate-700">{ext.serialNumber}</span> • {ext.manufacturer}
                    </div>
                  )}
                </div>

                {/* Próxima Recarga e Manutenção */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Próx. Recarga
                    </span>
                    <span
                      className={`font-bold ${
                        isExpired ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {formatDateBR(ext.nextRechargeDate)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Manutenção
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatDateBR(ext.nextMaintenanceDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onCreateQuoteForExtinguisher(ext)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Orçar</span>
                </button>

                {/* Botão de Enviar Lembrete via WhatsApp */}
                <button
                  onClick={() => handleOpenReminder(ext)}
                  className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    isExpired
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                  title="Enviar lembrete de vencimento via WhatsApp para o cliente"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onEditExtinguisher(ext)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Editar Extintor"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir o extintor ${ext.number}?`)) {
                      onDeleteExtinguisher(ext.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Excluir Extintor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredExtinguishers.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Flame className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Nenhum extintor encontrado.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Verifique a busca por cliente, número, patrimônio, série ou cadastre um novo extintor.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Lembrete via WhatsApp */}
      {reminderExtinguisher && (
        <WhatsAppReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => {
            setIsReminderModalOpen(false);
            setReminderExtinguisher(null);
            setReminderClient(null);
          }}
          extinguisher={reminderExtinguisher}
          client={reminderClient}
          settings={settings}
          allClientExtinguishers={extinguishers.filter(
            (e) =>
              (reminderClient && e.clientId === reminderClient.id) ||
              e.clientName === reminderExtinguisher.clientName
          )}
        />
      )}
    </div>
  );
};
