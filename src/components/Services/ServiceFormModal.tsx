import React, { useState, useEffect } from 'react';
import { X, Save, Wrench, DollarSign, Tag } from 'lucide-react';
import type { ServiceItem, ServiceCategory } from '../../types';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => Promise<void>;
  editingService?: ServiceItem | null;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('RECARGA');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('UN');
  const [defaultPrice, setDefaultPrice] = useState<number>(50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingService) {
      setName(editingService.name);
      setCategory(editingService.category);
      setDescription(editingService.description || '');
      setUnit(editingService.unit || 'UN');
      setDefaultPrice(editingService.defaultPrice || 0);
    } else {
      setName('');
      setCategory('RECARGA');
      setDescription('');
      setUnit('UN');
      setDefaultPrice(50);
    }
  }, [isOpen, editingService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do serviço ou produto.');
      return;
    }

    try {
      setIsSaving(true);
      const srvData: ServiceItem = {
        id: editingService?.id || '',
        name: name.trim(),
        category,
        description: description.trim(),
        unit: unit.trim() || 'UN',
        defaultPrice: Number(defaultPrice) || 0,
        createdAt: editingService?.createdAt || new Date().toISOString(),
      };

      await onSave(srvData);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      alert('Erro ao salvar serviço.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingService ? 'Editar Serviço / Produto' : 'Cadastrar Serviço / Produto'}
              </h2>
              <p className="text-xs text-slate-400">
                Itens disponíveis para inclusão rápida nos orçamentos
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Categoria do Serviço *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="RECARGA">Recarga de extintor</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="INSPECAO">Inspeção técnica</option>
              <option value="INSTALACAO">Instalação</option>
              <option value="RETIRADA">Retirada</option>
              <option value="VENDA_EXTINTOR">Venda de extintor novo</option>
              <option value="VENDA_SUPORTE">Venda de suporte</option>
              <option value="VENDA_PLACA">Venda de placa de sinalização</option>
              <option value="OUTROS">Outros produtos/serviços</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Produto ou Serviço *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Recarga de extintor PQS 6 kg ABC"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Detalhada / Especificações
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificações técnicas, normas, garantia inclusa..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
              >
                <option value="UN">UN (Unidade)</option>
                <option value="PC">PÇ (Peça)</option>
                <option value="KG">KG (Quilograma)</option>
                <option value="SV">SV (Serviço)</option>
                <option value="CJ">CJ (Conjunto)</option>
                <option value="M">M (Metro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Preço Padrão (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

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
              <span>{isSaving ? 'Salvando...' : 'Salvar Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
