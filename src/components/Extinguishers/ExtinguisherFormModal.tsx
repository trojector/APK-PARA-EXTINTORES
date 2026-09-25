import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Flame,
  User,
  MapPin,
  Calendar,
  Tag,
  Camera,
  Trash2,
} from 'lucide-react';
import type { FireExtinguisher, Client, ExtinguisherStatus } from '../../types';

interface ExtinguisherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (extinguisher: FireExtinguisher) => Promise<void>;
  editingExtinguisher?: FireExtinguisher | null;
  clients: Client[];
}

export const ExtinguisherFormModal: React.FC<ExtinguisherFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExtinguisher,
  clients,
}) => {
  const [number, setNumber] = useState('');
  const [patrimonyNumber, setPatrimonyNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('PQS 6 kg ABC');
  const [capacity, setCapacity] = useState('6 kg');
  const [manufacturer, setManufacturer] = useState('Mocelin');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  const [lastRechargeDate, setLastRechargeDate] = useState('');
  const [nextRechargeDate, setNextRechargeDate] = useState('');
  const [fireClass, setFireClass] = useState('ABC');
  const [status, setStatus] = useState<ExtinguisherStatus>('ATIVO');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingExtinguisher) {
      setNumber(editingExtinguisher.number);
      setPatrimonyNumber(editingExtinguisher.patrimonyNumber);
      setClientId(editingExtinguisher.clientId);
      setClientName(editingExtinguisher.clientName);
      setLocation(editingExtinguisher.location);
      setType(editingExtinguisher.type);
      setCapacity(editingExtinguisher.capacity);
      setManufacturer(editingExtinguisher.manufacturer);
      setModel(editingExtinguisher.model);
      setSerialNumber(editingExtinguisher.serialNumber);
      setManufactureDate(editingExtinguisher.manufactureDate || '');
      setLastMaintenanceDate(editingExtinguisher.lastMaintenanceDate || '');
      setNextMaintenanceDate(editingExtinguisher.nextMaintenanceDate || '');
      setLastRechargeDate(editingExtinguisher.lastRechargeDate || '');
      setNextRechargeDate(editingExtinguisher.nextRechargeDate || '');
      setFireClass(editingExtinguisher.fireClass || 'ABC');
      setStatus(editingExtinguisher.status);
      setNotes(editingExtinguisher.notes || '');
      setPhotos(editingExtinguisher.photos || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toISOString().split('T')[0];

      setNumber(`EXT-${Math.floor(100 + Math.random() * 900)}`);
      setPatrimonyNumber(`PAT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
      setClientId(clients[0]?.id || '');
      setClientName(clients[0]?.name || '');
      setLocation('Recepção Central');
      setType('PQS 6 kg ABC');
      setCapacity('6 kg');
      setManufacturer('Mocelin');
      setModel('MOC-P6');
      setSerialNumber(`SR-${Math.floor(100000 + Math.random() * 900000)}`);
      setManufactureDate('2023-01-01');
      setLastMaintenanceDate(today);
      setNextMaintenanceDate(nextYearStr);
      setLastRechargeDate(today);
      setNextRechargeDate(nextYearStr);
      setFireClass('ABC');
      setStatus('ATIVO');
      setNotes('');
      setPhotos([]);
    }
  }, [isOpen, editingExtinguisher, clients]);

  if (!isOpen) return null;

  const handleClientChange = (selectedId: string) => {
    setClientId(selectedId);
    const client = clients.find((c) => c.id === selectedId);
    if (client) {
      setClientName(client.name);
    }
  };

  // Helper para upload de imagem em base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !clientName.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    try {
      setIsSaving(true);
      const extData: FireExtinguisher = {
        id: editingExtinguisher?.id || '',
        number: number.trim(),
        patrimonyNumber: patrimonyNumber.trim(),
        clientId: clientId || 'cli-001',
        clientName: clientName.trim(),
        location: location.trim(),
        type: type.trim(),
        capacity: capacity.trim(),
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        manufactureDate,
        lastMaintenanceDate,
        nextMaintenanceDate,
        lastRechargeDate,
        nextRechargeDate,
        fireClass,
        status,
        notes: notes.trim(),
        photos,
        createdAt: editingExtinguisher?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(extData);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar extintor:', err);
      alert('Erro ao salvar extintor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingExtinguisher ? `Editar Extintor ${editingExtinguisher.number}` : 'Cadastrar Novo Extintor'}
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro técnico com controle de recargas e manutenções
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

        {/* Formulário com os campos do requisito 13 (SEM QR Code, SEM INMETRO) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Identificação Básica */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Identificação & Cliente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número do Extintor *
                </label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="EXT-001"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número Patrimonial
                </label>
                <input
                  type="text"
                  value={patrimonyNumber}
                  onChange={(e) => setPatrimonyNumber(e.target.value)}
                  placeholder="PAT-2024-001"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Operacional *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExtinguisherStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  <option value="ATIVO">ATIVO (Regular)</option>
                  <option value="EM_MANUTENCAO">EM MANUTENÇÃO</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="BAIXADO">BAIXADO (Inutilizado)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Cliente Vinculado *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Localização / Setor *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Bloco A - Recepção Central"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Especificações Técnicas
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-red-500"
                >
                  <option value="PQS 4 kg ABC">PQS 4 kg ABC</option>
                  <option value="PQS 6 kg ABC">PQS 6 kg ABC</option>
                  <option value="PQS 8 kg BC">PQS 8 kg BC</option>
                  <option value="PQS 12 kg ABC">PQS 12 kg ABC</option>
                  <option value="CO2 4 kg BC">CO2 4 kg BC</option>
                  <option value="CO2 6 kg BC">CO2 6 kg BC</option>
                  <option value="Água Pressurizada (AP) 10 L">Água Pressurizada (AP) 10 L</option>
                  <option value="Espuma Mecânica 10 L">Espuma Mecânica 10 L</option>
                  <option value="Classe K (Cozinha)">Classe K (Cozinha)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacidade *
                </label>
                <input
                  type="text"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="6 kg, 10 L..."
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classe de Incêndio *
                </label>
                <select
                  value={fireClass}
                  onChange={(e) => setFireClass(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="ABC">ABC</option>
                  <option value="BC">BC</option>
                  <option value="A">A</option>
                  <option value="K">K</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fabricante
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Mocelin, Resil, Bucka..."
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="MOC-P6"
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SR-984210"
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Fabricação
                </label>
                <input
                  type="date"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Controle de Manutenção e Recarga */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Controle de Datas & Recarga
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Última Manutenção
                </label>
                <input
                  type="date"
                  value={lastMaintenanceDate}
                  onChange={(e) => setLastMaintenanceDate(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">
                  Próxima Manutenção
                </label>
                <input
                  type="date"
                  value={nextMaintenanceDate}
                  onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-red-300 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Última Recarga
                </label>
                <input
                  type="date"
                  value={lastRechargeDate}
                  onChange={(e) => setLastRechargeDate(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">
                  Próxima Recarga *
                </label>
                <input
                  type="date"
                  required
                  value={nextRechargeDate}
                  onChange={(e) => setNextRechargeDate(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-red-300 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Observações e Fotos */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observações Técnicas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Estado do manômetro, suporte, mangueira, sinalização..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-500" />
                  Fotos do Extintor
                </label>
                <label className="cursor-pointer text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                  <span>+ Adicionar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg border border-slate-300 overflow-hidden group shadow-2xs"
                    >
                      <img
                        src={photo}
                        alt={`Extintor ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  Nenhuma foto anexada. Clique em "+ Adicionar Foto" para registrar imagens do extintor no local.
                </div>
              )}
            </div>
          </div>

          {/* Rodapé com Botão Salvar */}
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
              <span>{isSaving ? 'Salvando...' : 'Salvar Extintor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
