import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  DollarSign,
  Package,
} from 'lucide-react';
import type { ServiceItem, ServiceCategory } from '../../types';
import { formatCurrency } from '../../services/pdfGenerator';

interface ServicesListProps {
  services: ServiceItem[];
  onNewService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onNewService,
  onEditService,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [services, searchTerm, categoryFilter]);

  const categoryLabels: Record<ServiceCategory, string> = {
    RECARGA: 'Recarga de Extintor',
    MANUTENCAO: 'Manutenção',
    INSPECAO: 'Inspeção Técnica',
    INSTALACAO: 'Instalação',
    RETIRADA: 'Retirada e Transporte',
    VENDA_EXTINTOR: 'Venda de Extintor Novo',
    VENDA_SUPORTE: 'Venda de Suporte',
    VENDA_PLACA: 'Venda de Placa',
    OUTROS: 'Outros Serviços',
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-red-600" />
            CATÁLOGO DE SERVIÇOS & PRODUTOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cadastre recargas, manutenções, peças e itens para orçar em um clique
          </p>
        </div>

        <button
          onClick={onNewService}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/30 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar serviço ou produto por nome ou descrição..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="RECARGA">Recargas de Extintores</option>
              <option value="MANUTENCAO">Manutenção & Testes</option>
              <option value="INSPECAO">Inspeções</option>
              <option value="INSTALACAO">Instalação</option>
              <option value="RETIRADA">Retirada</option>
              <option value="VENDA_EXTINTOR">Extintores Novos</option>
              <option value="VENDA_SUPORTE">Suportes</option>
              <option value="VENDA_PLACA">Placas de Sinalização</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {categoryLabels[service.category] || service.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {service.unit}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                {service.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                {service.description || 'Sem descrição cadastrada.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Preço Sugerido
                </span>
                <span className="text-lg font-black text-red-600">
                  {formatCurrency(service.defaultPrice)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditService(service)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover "${service.name}"?`)) {
                      onDeleteService(service.id);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Nenhum serviço ou produto encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre novos itens para alimentar o catálogo de orçamentos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
