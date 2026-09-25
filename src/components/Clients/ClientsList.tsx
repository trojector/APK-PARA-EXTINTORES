import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Flame,
  FileText,
  Building,
} from 'lucide-react';
import type { Client, FireExtinguisher, Quote } from '../../types';

interface ClientsListProps {
  clients: Client[];
  extinguishers: FireExtinguisher[];
  quotes: Quote[];
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onNewQuoteForClient: (client: Client) => void;
  onViewClientExtinguishers: (client: Client) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  extinguishers,
  quotes,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onNewQuoteForClient,
  onViewClientExtinguishers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.tradeName && c.tradeName.toLowerCase().includes(term)) ||
        c.document.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
      );
    });
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-red-600" />
            CLIENTES CADASTRADOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gerencie empresas atendidas, visualize extintores alocados e emita orçamentos rápidos
          </p>
        </div>

        <button
          onClick={onNewClient}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, fantasia, CNPJ/CPF, telefone ou cidade..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const clientExtinguishers = extinguishers.filter((e) => e.clientId === client.id || e.clientName === client.name);
          const clientQuotes = quotes.filter((q) => q.clientId === client.id || q.clientName === client.name);
          const hasExpired = clientExtinguishers.some((e) => e.status === 'VENCIDO');

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {client.name}
                    </h3>
                    {client.tradeName && (
                      <span className="text-xs font-semibold text-slate-500">
                        {client.tradeName}
                      </span>
                    )}
                  </div>
                  {hasExpired && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black shrink-0">
                      Extintor Vencido
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                  {client.document && (
                    <p className="font-mono">
                      CNPJ/CPF: <span className="text-slate-800">{client.document}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {client.phone}
                  </p>
                  {client.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {client.email}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {client.address}, {client.city} - {client.state}
                  </p>
                </div>

                {/* Métricas do Cliente */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div
                    onClick={() => onViewClientExtinguishers(client)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition cursor-pointer flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Flame className="w-3.5 h-3.5 text-red-600" />
                      Extintores:
                    </span>
                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                      {clientExtinguishers.length}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      Orçamentos:
                    </span>
                    <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                      {clientQuotes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNewQuoteForClient(client)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Novo Orçamento
                </button>

                <button
                  onClick={() => onEditClient(client)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Editar Cliente"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir o cliente ${client.name}?`)) {
                      onDeleteClient(client.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Excluir Cliente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Nenhum cliente encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre um novo cliente para vincular extintores e emitir propostas comerciais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
