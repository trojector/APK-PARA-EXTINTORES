import React, { useState, useEffect, useCallback } from 'react';
import type {
  Quote,
  FireExtinguisher,
  Client,
  ServiceItem,
  CompanySettings,
  DashboardStats,
  QuoteStatus,
  MaintenanceReport,
} from './types';
import {
  getCompanySettings,
  saveCompanySettings,
  getClients,
  saveClient,
  deleteClient,
  getServices,
  saveService,
  deleteService,
  getExtinguishers,
  saveExtinguisher,
  deleteExtinguisher,
  getQuotes,
  saveQuote,
  deleteQuote,
  duplicateQuote,
  updateQuoteStatus,
  getNextQuoteNumber,
  getMaintenanceReports,
  saveMaintenanceReport,
  deleteMaintenanceReport,
  getNextMaintenanceReportNumber,
  getDashboardStats,
  DEFAULT_COMPANY_SETTINGS,
} from './services/db';
import { Header } from './components/Header';
import { Navigation, type TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { QuotesList } from './components/Quotes/QuotesList';
import { QuoteDetailModal } from './components/Quotes/QuoteDetailModal';
import { QuoteFormModal } from './components/Quotes/QuoteFormModal';
import { ExtinguishersList } from './components/Extinguishers/ExtinguishersList';
import { ExtinguisherFormModal } from './components/Extinguishers/ExtinguisherFormModal';
import { ClientsList } from './components/Clients/ClientsList';
import { ClientFormModal } from './components/Clients/ClientFormModal';
import { ServicesList } from './components/Services/ServicesList';
import { ServiceFormModal } from './components/Services/ServiceFormModal';
import { MaintenanceReportsList } from './components/Checklist/MaintenanceReportsList';
import { MaintenanceReportFormModal } from './components/Checklist/MaintenanceReportFormModal';
import { MaintenanceReportDetailModal } from './components/Checklist/MaintenanceReportDetailModal';
import { NotaFiscalView } from './components/NotaFiscal/NotaFiscalView';
import { MenuSettings } from './components/MenuSettings/MenuSettings';
import { generateQuotePDF } from './services/pdfGenerator';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';
import { MobileInstallBanner } from './components/PWA/MobileInstallBanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('INICIO');
  const [isLoading, setIsLoading] = useState(true);

  // Estados principais de dados
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [extinguishers, setExtinguishers] = useState<FireExtinguisher[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    quotesOpen: 0,
    quotesSent: 0,
    quotesApproved: 0,
    quotesRejected: 0,
    quotesExpired: 0,
    totalQuotesAmount: 0,
    totalApprovedAmount: 0,
    extinguishersTotal: 0,
    extinguishersExpiringSoon: 0,
    extinguishersExpired: 0,
    extinguishersActive: 0,
    clientsTotal: 0,
  });

  // Modais de Orçamento
  const [isQuoteDetailOpen, setIsQuoteDetailOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [prefillClientId, setPrefillClientId] = useState<string | undefined>();
  const [prefillNotes, setPrefillNotes] = useState<string | undefined>();
  const [nextQuoteNum, setNextQuoteNum] = useState('000001');

  // Modais de Extintor
  const [isExtinguisherFormOpen, setIsExtinguisherFormOpen] = useState(false);
  const [editingExtinguisher, setEditingExtinguisher] = useState<FireExtinguisher | null>(null);

  // Modais de Cliente
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Modais de Serviço
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Relatórios de Manutenção / Checklist NBR
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [nextReportNum, setNextReportNum] = useState('00001');
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<MaintenanceReport | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MaintenanceReport | null>(null);

  // Carregar todos os dados
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        loadedSettings,
        loadedQuotes,
        loadedExtinguishers,
        loadedClients,
        loadedServices,
        loadedReports,
        loadedStats,
        nextNum,
        nextRepNum,
      ] = await Promise.all([
        getCompanySettings(),
        getQuotes(),
        getExtinguishers(),
        getClients(),
        getServices(),
        getMaintenanceReports(),
        getDashboardStats(),
        getNextQuoteNumber(),
        getNextMaintenanceReportNumber(),
      ]);

      setSettings(loadedSettings);
      setQuotes(loadedQuotes);
      setExtinguishers(loadedExtinguishers);
      setClients(loadedClients);
      setServices(loadedServices);
      setReports(loadedReports);
      setStats(loadedStats);
      setNextQuoteNum(nextNum);
      setNextReportNum(nextRepNum);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Recarregar estatísticas
  const refreshStats = async () => {
    const updatedStats = await getDashboardStats();
    setStats(updatedStats);
    const nextNum = await getNextQuoteNumber();
    setNextQuoteNum(nextNum);
  };

  // ==========================================
  // HANDLERS DE ORÇAMENTOS
  // ==========================================
  const handleOpenNewQuote = (clientId?: string, notes?: string) => {
    setEditingQuote(null);
    setPrefillClientId(clientId);
    setPrefillNotes(notes);
    setIsQuoteFormOpen(true);
  };

  const handleOpenEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setPrefillClientId(quote.clientId);
    setPrefillNotes(quote.notes);
    setIsQuoteDetailOpen(false);
    setIsQuoteFormOpen(true);
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuoteDetailOpen(true);
  };

  const handleSaveQuote = async (quoteData: Quote) => {
    const saved = await saveQuote(quoteData);
    setQuotes((prev) => {
      const idx = prev.findIndex((q) => q.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    if (selectedQuote && selectedQuote.id === saved.id) {
      setSelectedQuote(saved);
    }
    await refreshStats();
  };

  const handleDeleteQuote = async (id: string) => {
    await deleteQuote(id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuote && selectedQuote.id === id) {
      setIsQuoteDetailOpen(false);
    }
    await refreshStats();
  };

  const handleDuplicateQuote = async (quote: Quote) => {
    const duplicated = await duplicateQuote(quote.id);
    if (duplicated) {
      setQuotes((prev) => [duplicated, ...prev]);
      await refreshStats();
      handleViewQuote(duplicated);
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: QuoteStatus) => {
    await updateQuoteStatus(id, status);
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q))
    );
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote((prev) => (prev ? { ...prev, status } : null));
    }
    await refreshStats();
  };

  const handleGeneratePdf = async (quote: Quote) => {
    await generateQuotePDF(quote, settings, 'download');
  };

  // ==========================================
  // HANDLERS DE EXTINTORES
  // ==========================================
  const handleOpenNewExtinguisher = () => {
    setEditingExtinguisher(null);
    setIsExtinguisherFormOpen(true);
  };

  const handleOpenEditExtinguisher = (ext: FireExtinguisher) => {
    setEditingExtinguisher(ext);
    setIsExtinguisherFormOpen(true);
  };

  const handleSaveExtinguisher = async (extData: FireExtinguisher) => {
    const saved = await saveExtinguisher(extData);
    setExtinguishers((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    await refreshStats();
  };

  const handleDeleteExtinguisher = async (id: string) => {
    await deleteExtinguisher(id);
    setExtinguishers((prev) => prev.filter((e) => e.id !== id));
    await refreshStats();
  };

  const handleCreateQuoteForExtinguisher = (ext: FireExtinguisher) => {
    const notes = `Orçamento para recarga/manutenção do extintor ${ext.number} (${ext.type} ${ext.capacity}). Localização: ${ext.location}.`;
    handleOpenNewQuote(ext.clientId, notes);
  };

  // ==========================================
  // HANDLERS DE CLIENTES
  // ==========================================
  const handleOpenNewClient = () => {
    setEditingClient(null);
    setIsClientFormOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientFormOpen(true);
  };

  const handleSaveClient = async (clientData: Client) => {
    const saved = await saveClient(clientData);
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    await refreshStats();
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    await refreshStats();
  };

  const handleNewQuoteForClient = (client: Client) => {
    handleOpenNewQuote(client.id);
  };

  const handleViewClientExtinguishers = (client: Client) => {
    setActiveTab('EXTINTORES');
  };

  // ==========================================
  // HANDLERS DE SERVIÇOS
  // ==========================================
  const handleOpenNewService = () => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleSaveService = async (serviceData: ServiceItem) => {
    const saved = await saveService(serviceData);
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // HANDLERS DE RELATÓRIO DE MANUTENÇÃO NBR
  // ==========================================
  const handleOpenNewReport = () => {
    setEditingReport(null);
    setIsReportFormOpen(true);
  };

  const handleOpenEditReport = (rep: MaintenanceReport) => {
    setEditingReport(rep);
    setIsReportDetailOpen(false);
    setIsReportFormOpen(true);
  };

  const handleViewReport = (rep: MaintenanceReport) => {
    setSelectedReport(rep);
    setIsReportDetailOpen(true);
  };

  const handleSaveReport = async (repData: MaintenanceReport) => {
    const saved = await saveMaintenanceReport(repData);
    setReports((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    if (selectedReport && selectedReport.id === saved.id) {
      setSelectedReport(saved);
    }
    const nextRNum = await getNextMaintenanceReportNumber();
    setNextReportNum(nextRNum);
  };

  const handleDeleteReport = async (id: string) => {
    await deleteMaintenanceReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selectedReport && selectedReport.id === id) {
      setIsReportDetailOpen(false);
    }
    const nextRNum = await getNextMaintenanceReportNumber();
    setNextReportNum(nextRNum);
  };

  // ==========================================
  // HANDLERS DE CONFIGURAÇÕES & RESTAURAÇÃO
  // ==========================================
  const handleSaveSettings = async (newSettings: CompanySettings) => {
    await saveCompanySettings(newSettings);
    setSettings(newSettings);
  };

  const handleRestoreBackup = async (backup: any) => {
    if (backup.company) await saveCompanySettings(backup.company);
    if (Array.isArray(backup.clients)) {
      for (const c of backup.clients) await saveClient(c);
    }
    if (Array.isArray(backup.extinguishers)) {
      for (const e of backup.extinguishers) await saveExtinguisher(e);
    }
    if (Array.isArray(backup.services)) {
      for (const s of backup.services) await saveService(s);
    }
    if (Array.isArray(backup.quotes)) {
      for (const q of backup.quotes) await saveQuote(q);
    }
    await loadAllData();
  };

  // Extintores com recarga a vencer ou vencidos para o dashboard
  const expiringExtinguishers = extinguishers.filter((e) => {
    if (e.status === 'VENCIDO') return true;
    if (!e.nextRechargeDate) return false;
    const d = new Date(e.nextRechargeDate);
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return d <= in30;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Cabeçalho Fixo Superior */}
      <Header
        settings={settings}
        onNewQuote={() => handleOpenNewQuote()}
        onNewExtinguisher={handleOpenNewExtinguisher}
        expiredExtinguishersCount={stats.extinguishersExpired}
        onViewExtinguishers={() => setActiveTab('EXTINTORES')}
      />

      {/* Navegação Principal (INÍCIO, CLIENTES, EXTINTORES, SERVIÇOS, ORÇAMENTOS, MENU) - SEM QR CODE */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        openQuotesCount={stats.quotesOpen + stats.quotesSent}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">
              Carregando Extintores Juazeiro...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'INICIO' && (
              <Dashboard
                stats={stats}
                recentQuotes={quotes}
                expiringExtinguishers={expiringExtinguishers}
                settings={settings}
                onNavigate={setActiveTab}
                onNewQuote={handleOpenNewQuote}
                onNewExtinguisher={handleOpenNewExtinguisher}
                onViewQuote={handleViewQuote}
                onGeneratePdf={handleGeneratePdf}
              />
            )}

            {activeTab === 'CLIENTES' && (
              <ClientsList
                clients={clients}
                extinguishers={extinguishers}
                quotes={quotes}
                onNewClient={handleOpenNewClient}
                onEditClient={handleOpenEditClient}
                onDeleteClient={handleDeleteClient}
                onNewQuoteForClient={handleNewQuoteForClient}
                onViewClientExtinguishers={handleViewClientExtinguishers}
              />
            )}

            {activeTab === 'EXTINTORES' && (
              <ExtinguishersList
                extinguishers={extinguishers}
                clients={clients}
                settings={settings}
                onNewExtinguisher={handleOpenNewExtinguisher}
                onEditExtinguisher={handleOpenEditExtinguisher}
                onDeleteExtinguisher={handleDeleteExtinguisher}
                onCreateQuoteForExtinguisher={handleCreateQuoteForExtinguisher}
              />
            )}

            {activeTab === 'SERVICOS' && (
              <ServicesList
                services={services}
                onNewService={handleOpenNewService}
                onEditService={handleOpenEditService}
                onDeleteService={handleDeleteService}
              />
            )}

            {activeTab === 'ORCAMENTOS' && (
              <QuotesList
                quotes={quotes}
                settings={settings}
                onNewQuote={() => handleOpenNewQuote()}
                onViewQuote={handleViewQuote}
                onEditQuote={handleOpenEditQuote}
                onDuplicateQuote={handleDuplicateQuote}
                onDeleteQuote={handleDeleteQuote}
                onUpdateStatus={handleUpdateQuoteStatus}
              />
            )}

            {activeTab === 'CHECKLIST' && (
              <MaintenanceReportsList
                reports={reports}
                clients={clients}
                settings={settings}
                onNewReport={handleOpenNewReport}
                onEditReport={handleOpenEditReport}
                onDeleteReport={handleDeleteReport}
                onViewReport={handleViewReport}
              />
            )}

            {activeTab === 'NOTA_FISCAL' && (
              <NotaFiscalView settings={settings} />
            )}

            {activeTab === 'MENU' && (
              <MenuSettings
                settings={settings}
                onSaveSettings={handleSaveSettings}
                quotes={quotes}
                extinguishers={extinguishers}
                clients={clients}
                services={services}
                onRestoreData={handleRestoreBackup}
              />
            )}
          </>
        )}
      </main>

      {/* Modais de Relatório de Manutenção NBR 12962 */}
      <MaintenanceReportFormModal
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
        onSave={handleSaveReport}
        editingReport={editingReport}
        clients={clients}
        settings={settings}
        nextReportNumber={nextReportNum}
      />

      {selectedReport && (
        <MaintenanceReportDetailModal
          isOpen={isReportDetailOpen}
          report={selectedReport}
          settings={settings}
          onClose={() => setIsReportDetailOpen(false)}
          onEdit={handleOpenEditReport}
        />
      )}

      {/* Modais de Orçamento */}
      <QuoteFormModal
        isOpen={isQuoteFormOpen}
        onClose={() => setIsQuoteFormOpen(false)}
        onSave={handleSaveQuote}
        editingQuote={editingQuote}
        clients={clients}
        services={services}
        settings={settings}
        prefillClientId={prefillClientId}
        prefillNotes={prefillNotes}
        nextQuoteNumber={nextQuoteNum}
      />

      {selectedQuote && (
        <QuoteDetailModal
          isOpen={isQuoteDetailOpen}
          quote={selectedQuote}
          settings={settings}
          onClose={() => setIsQuoteDetailOpen(false)}
          onEdit={handleOpenEditQuote}
          onDuplicate={handleDuplicateQuote}
          onUpdateStatus={handleUpdateQuoteStatus}
        />
      )}

      {/* Modal de Extintor (SEM QR CODE, SEM INMETRO) */}
      <ExtinguisherFormModal
        isOpen={isExtinguisherFormOpen}
        onClose={() => setIsExtinguisherFormOpen(false)}
        onSave={handleSaveExtinguisher}
        editingExtinguisher={editingExtinguisher}
        clients={clients}
      />

      {/* Modal de Cliente */}
      <ClientFormModal
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* Modal de Serviço */}
      <ServiceFormModal
        isOpen={isServiceFormOpen}
        onClose={() => setIsServiceFormOpen(false)}
        onSave={handleSaveService}
        editingService={editingService}
      />

      {/* Indicador Offline */}
      <OfflineIndicator />

      {/* Barra de Instalação Rápida no Celular */}
      <MobileInstallBanner />
    </div>
  );
}
