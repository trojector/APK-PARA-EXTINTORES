import type {
  Client,
  FireExtinguisher,
  ServiceItem,
  Quote,
  QuoteItem,
  CompanySettings,
  DashboardStats,
  QuoteStatus,
  MaintenanceReport,
  MaintenanceReportItem,
} from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  CLIENTS: 'extintores_juazeiro_clients',
  EXTINGUISHERS: 'extintores_juazeiro_extinguishers',
  SERVICES: 'extintores_juazeiro_services',
  QUOTES: 'extintores_juazeiro_quotes',
  QUOTE_ITEMS: 'extintores_juazeiro_quote_items',
  SETTINGS: 'extintores_juazeiro_settings',
  MAINTENANCE_REPORTS: 'extintores_juazeiro_maintenance_reports',
};

// Dados padrão da empresa Extintores Juazeiro
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Extintores Juazeiro',
  legalName: 'Extintores Juazeiro',
  cnpj: '64.319.136/0001-41',
  phone: '(74) 3611-4020',
  whatsapp: '(74) 98845-7721',
  email: 'contato@extintoresjuazeiro.com.br',
  address: 'Quadra 19, Nº 01',
  neighborhood: 'JOÃO PAULO II',
  city: 'JUAZEIRO',
  state: 'BA',
  postalCode: '48900-000',
  responsibleName: 'Robson Alves Dias Bonfim',
  responsibleRole: 'Responsável Técnico',
  defaultValidityDays: 10,
  defaultNotes:
    'Proposta válida por 10 dias. Faturamento para 28 dias após aprovação e entrega dos certificados de recarga e teste. Garantia de 12 meses para serviços de recarga e teste hidrostático.',
};

// Clientes iniciais
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Hospital Regional de Juazeiro',
    tradeName: 'HRJ Juazeiro',
    document: '08.924.110/0001-30',
    phone: '(74) 3612-8200',
    email: 'manutencao@hrj.ba.gov.br',
    address: 'Travessa do Hospital, s/n',
    neighborhood: 'Santo Antônio',
    city: 'Juazeiro',
    state: 'BA',
    contactPerson: 'Eng. Roberto (Coord. Manutenção)',
    notes: 'Acesso pelo setor de compras e engenharia predial.',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-09-18T14:30:00Z',
  },
  {
    id: 'cli-002',
    name: 'Indústria Metalúrgica São Francisco',
    tradeName: 'Metalúrgica SF',
    document: '12.871.450/0001-88',
    phone: '(74) 3613-9200',
    email: 'seguranca@metalurgicasf.com.br',
    address: 'Distrito Industrial do São Francisco, Galpão 14',
    neighborhood: 'Distrito Industrial',
    city: 'Juazeiro',
    state: 'BA',
    contactPerson: 'Mariana Duarte (Téc. Segurança)',
    notes: 'Exige crachá de visitante e EPI para inspeção.',
    createdAt: '2026-02-05T10:15:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'cli-003',
    name: 'Supermercado Vale do São Francisco',
    tradeName: 'Super Vale Matriz',
    document: '24.190.874/0001-12',
    phone: '(74) 3611-8800',
    email: 'compras@supervalesf.com.br',
    address: 'Rua Coronel Aprígio Duarte, 340',
    neighborhood: 'Centro',
    city: 'Juazeiro',
    state: 'BA',
    contactPerson: 'Marcos Vinícius (Gerente Geral)',
    notes: 'Recargas anuais em lote.',
    createdAt: '2026-03-12T08:30:00Z',
    updatedAt: '2026-09-10T16:20:00Z',
  },
  {
    id: 'cli-004',
    name: 'Posto Juazeiro Combustíveis & Serviços',
    tradeName: 'Posto Juazeiro',
    document: '05.340.912/0001-44',
    phone: '(74) 3614-1400',
    email: 'financeiro@postojuazeiro.com.br',
    address: 'Rodovia Lomanto Júnior, Km 02',
    neighborhood: 'Castelo Branco',
    city: 'Juazeiro',
    state: 'BA',
    contactPerson: 'Antônio Ferreira',
    notes: 'Extintores de grande porte e carreta PQS.',
    createdAt: '2026-04-01T11:00:00Z',
    updatedAt: '2026-09-02T09:15:00Z',
  },
];

// Serviços e produtos pré-cadastrados para Extintores Juazeiro
const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-001',
    name: 'Recarga de extintor PQS 4 kg ABC',
    category: 'RECARGA',
    description: 'Recarga completa com troca de pó químico seco ABC 55%, teste de pressão e anel de garantia',
    unit: 'UN',
    defaultPrice: 42.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-002',
    name: 'Recarga de extintor PQS 6 kg ABC',
    category: 'RECARGA',
    description: 'Recarga completa de pó químico seco ABC 55%, verificação de manômetro e troca de vedação',
    unit: 'UN',
    defaultPrice: 50.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-003',
    name: 'Recarga de extintor PQS 8 kg BC',
    category: 'RECARGA',
    description: 'Recarga de pó químico BC com substituição de anel indicador',
    unit: 'UN',
    defaultPrice: 65.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-004',
    name: 'Recarga de extintor PQS 12 kg ABC',
    category: 'RECARGA',
    description: 'Recarga de extintor portátil e sobre rodas industrial',
    unit: 'UN',
    defaultPrice: 95.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-005',
    name: 'Recarga de extintor CO2 4 kg',
    category: 'RECARGA',
    description: 'Carga de dióxido de carbono pressurizado de alta pureza',
    unit: 'UN',
    defaultPrice: 75.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-006',
    name: 'Recarga de extintor CO2 6 kg',
    category: 'RECARGA',
    description: 'Carga de dióxido de carbono CO2 6 kg com teste de peso e vedação de válvula',
    unit: 'UN',
    defaultPrice: 85.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-007',
    name: 'Recarga de extintor Água Pressurizada (AP) 10 L',
    category: 'RECARGA',
    description: 'Recarga com água tratada e pressurização com nitrogênio',
    unit: 'UN',
    defaultPrice: 45.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-008',
    name: 'Recarga de extintor Espuma Mecânica 10 L',
    category: 'RECARGA',
    description: 'Recarga de LGE (Líquido Gerador de Espuma) 3% AFFF',
    unit: 'UN',
    defaultPrice: 80.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-009',
    name: 'Manutenção Nível 1 e Inspeção Técnica',
    category: 'INSPECAO',
    description: 'Limpeza, verificação geral no local, estado de conservação, sinalização e lacração',
    unit: 'UN',
    defaultPrice: 20.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-010',
    name: 'Manutenção Nível 2 (Oficina)',
    category: 'MANUTENCAO',
    description: 'Desmontagem, limpeza interna, troca de reparos, recarga e pressurização',
    unit: 'UN',
    defaultPrice: 35.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-011',
    name: 'Manutenção Nível 3 (Teste Hidrostático Quinquenal)',
    category: 'MANUTENCAO',
    description: 'Ensaio hidrostático de cilindro de baixa ou alta pressão com laudo técnico',
    unit: 'UN',
    defaultPrice: 45.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-012',
    name: 'Instalação de extintores e suportes com fixação',
    category: 'INSTALACAO',
    description: 'Serviço de fixação em alvenaria ou estrutura metálica conforme norma técnica',
    unit: 'SV',
    defaultPrice: 30.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-013',
    name: 'Retirada e devolução de extintores em domicílio',
    category: 'RETIRADA',
    description: 'Logística de transporte com extintores de empréstimo temporário',
    unit: 'SV',
    defaultPrice: 50.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-014',
    name: 'Venda de extintor novo PQS 6 kg ABC completo',
    category: 'VENDA_EXTINTOR',
    description: 'Extintor novo montado com carga plena, suporte de parede e mangueira',
    unit: 'UN',
    defaultPrice: 165.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-015',
    name: 'Venda de extintor novo CO2 6 kg completo',
    category: 'VENDA_EXTINTOR',
    description: 'Extintor novo de CO2 com difusor e válvula forjada de latão',
    unit: 'UN',
    defaultPrice: 390.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-016',
    name: 'Suporte de parede em aço com parafusos e buchas',
    category: 'VENDA_SUPORTE',
    description: 'Suporte metálico reforçado zincado anti-corrosão',
    unit: 'UN',
    defaultPrice: 10.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-017',
    name: 'Suporte tripé de chão cromado para extintor',
    category: 'VENDA_SUPORTE',
    description: 'Suporte tipo pedestal de piso acabamento tubular inox/cromado',
    unit: 'UN',
    defaultPrice: 55.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'srv-018',
    name: 'Placa de sinalização fotoluminescente (Extintor)',
    category: 'VENDA_PLACA',
    description: 'Placa em PVC fotoluminescente 20x20cm norma ABNT NBR 13434',
    unit: 'UN',
    defaultPrice: 18.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// Extintores iniciais (SEM QR CODE, SEM INMETRO)
const INITIAL_EXTINGUISHERS: FireExtinguisher[] = [
  {
    id: 'ext-001',
    number: 'EXT-001',
    patrimonyNumber: 'PAT-HRC-012',
    clientId: 'cli-001',
    clientName: 'Hospital Regional do Cariri',
    location: 'Bloco A - Recepção Central',
    type: 'PQS 6 kg ABC',
    capacity: '6 kg',
    manufacturer: 'Mocelin',
    model: 'MOC-P6',
    serialNumber: 'SR-984210',
    manufactureDate: '2023-05-10',
    lastMaintenanceDate: '2025-09-20',
    nextMaintenanceDate: '2026-09-20',
    lastRechargeDate: '2025-09-20',
    nextRechargeDate: '2026-09-20',
    fireClass: 'ABC',
    status: 'ATIVO',
    notes: 'Instalado em suporte de parede a 1,60m. Em perfeito estado.',
    photos: [],
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'ext-002',
    number: 'EXT-002',
    patrimonyNumber: 'PAT-HRC-013',
    clientId: 'cli-001',
    clientName: 'Hospital Regional do Cariri',
    location: 'Bloco B - Corredor UTI Adulto',
    type: 'CO2 6 kg',
    capacity: '6 kg',
    manufacturer: 'Resil',
    model: 'RES-CO2-6',
    serialNumber: 'SR-773124',
    manufactureDate: '2022-08-14',
    lastMaintenanceDate: '2025-08-10',
    nextMaintenanceDate: '2026-08-10',
    lastRechargeDate: '2025-08-10',
    nextRechargeDate: '2026-08-10',
    fireClass: 'BC',
    status: 'VENCIDO',
    notes: 'Recarga venceu em agosto. Necessita recarga urgente.',
    photos: [],
    createdAt: '2025-08-10T11:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'ext-003',
    number: 'EXT-003',
    patrimonyNumber: 'PAT-HRC-014',
    clientId: 'cli-001',
    clientName: 'Hospital Regional do Cariri',
    location: 'Setor de Manutenção Predial',
    type: 'Água Pressurizada (AP)',
    capacity: '10 L',
    manufacturer: 'Extang',
    model: 'EXT-AP10',
    serialNumber: 'SR-331209',
    manufactureDate: '2021-03-20',
    lastMaintenanceDate: '2025-10-10',
    nextMaintenanceDate: '2026-10-10',
    lastRechargeDate: '2025-10-10',
    nextRechargeDate: '2026-10-10',
    fireClass: 'A',
    status: 'ATIVO',
    notes: 'Vence em breve (outubro). Programar orçamento de recarga.',
    photos: [],
    createdAt: '2025-10-10T14:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'ext-004',
    number: 'EXT-004',
    patrimonyNumber: 'PAT-MSF-088',
    clientId: 'cli-002',
    clientName: 'Indústria Metalúrgica São Francisco',
    location: 'Galpão 1 - Área de Solda',
    type: 'PQS 8 kg BC',
    capacity: '8 kg',
    manufacturer: 'Bucka',
    model: 'BK-PQS8',
    serialNumber: 'SR-441829',
    manufactureDate: '2023-11-02',
    lastMaintenanceDate: '2025-09-28',
    nextMaintenanceDate: '2026-09-28',
    lastRechargeDate: '2025-09-28',
    nextRechargeDate: '2026-09-28',
    fireClass: 'BC',
    status: 'ATIVO',
    notes: 'Próximo à bancada de soldagem pesada.',
    photos: [],
    createdAt: '2025-09-28T09:30:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'ext-005',
    number: 'EXT-005',
    patrimonyNumber: 'PAT-MIX-001',
    clientId: 'cli-003',
    clientName: 'Supermercado Mix Cariri',
    location: 'Frente de Loja - Caixa 01',
    type: 'PQS 6 kg ABC',
    capacity: '6 kg',
    manufacturer: 'Mocelin',
    model: 'MOC-P6',
    serialNumber: 'SR-812033',
    manufactureDate: '2024-01-15',
    lastMaintenanceDate: '2025-09-22',
    nextMaintenanceDate: '2026-09-22',
    lastRechargeDate: '2025-09-22',
    nextRechargeDate: '2026-09-22',
    fireClass: 'ABC',
    status: 'ATIVO',
    notes: 'Suporte de chão tripé cromado.',
    photos: [],
    createdAt: '2025-09-22T10:00:00Z',
    updatedAt: '2026-09-10T16:20:00Z',
  },
  {
    id: 'ext-006',
    number: 'EXT-006',
    patrimonyNumber: 'PAT-PST-009',
    clientId: 'cli-004',
    clientName: 'Posto Juazeiro Norte Auto Peças',
    location: 'Ilha de Abastecimento 02',
    type: 'PQS 12 kg ABC',
    capacity: '12 kg',
    manufacturer: 'Resil',
    model: 'RES-P12',
    serialNumber: 'SR-552190',
    manufactureDate: '2022-04-10',
    lastMaintenanceDate: '2026-02-15',
    nextMaintenanceDate: '2027-02-15',
    lastRechargeDate: '2026-02-15',
    nextRechargeDate: '2027-02-15',
    fireClass: 'ABC',
    status: 'ATIVO',
    notes: 'Equipamento em excelente estado de pressurização.',
    photos: [],
    createdAt: '2026-02-15T15:00:00Z',
    updatedAt: '2026-09-02T09:15:00Z',
  },
];

// Orçamentos iniciais conforme especificação
const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-001',
    number: '000001',
    clientId: 'cli-001',
    clientName: 'Hospital Regional de Juazeiro',
    clientDocument: '08.924.110/0001-30',
    clientPhone: '(74) 3612-8200',
    clientEmail: 'manutencao@hrj.ba.gov.br',
    clientAddress: 'Travessa do Hospital, s/n - Santo Antônio, Juazeiro - BA',
    date: '2026-09-20',
    validUntil: '2026-09-30',
    responsible: 'Robson Alves Dias Bonfim',
    notes: 'Atendimento e recarga programada para o Bloco A e Bloco B. Garantia de 12 meses nos serviços executados.',
    status: 'APROVADO',
    subtotal: 600.0,
    discount: 50.0,
    total: 550.0,
    paymentTerms: 'Faturamento 30 dias após emissão da NF',
    deliveryTime: 'Até 48 horas úteis',
    warranty: '12 meses para serviços e testes',
    items: [
      {
        id: 'qi-001',
        quoteId: 'quote-001',
        serviceId: 'srv-002',
        productService: 'Recarga PQS 6 kg',
        description: 'Recarga de extintor de pó químico seco 6 kg ABC 55%',
        quantity: 10,
        unit: 'UN',
        unitPrice: 50.0,
        discount: 0,
        subtotal: 500.0,
        sortOrder: 1,
      },
      {
        id: 'qi-002',
        quoteId: 'quote-001',
        serviceId: 'srv-016',
        productService: 'Suporte de parede',
        description: 'Suporte em aço reforçado com fixação em buchas e parafusos',
        quantity: 10,
        unit: 'UN',
        unitPrice: 10.0,
        discount: 0,
        subtotal: 100.0,
        sortOrder: 2,
      },
    ],
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-09-21T11:00:00Z',
  },
  {
    id: 'quote-002',
    number: '000002',
    clientId: 'cli-003',
    clientName: 'Supermercado Vale do São Francisco',
    clientDocument: '24.190.874/0001-12',
    clientPhone: '(74) 3611-8800',
    clientEmail: 'compras@supervalesf.com.br',
    clientAddress: 'Rua Coronel Aprígio Duarte, 340 - Centro, Juazeiro - BA',
    date: '2026-09-21',
    validUntil: '2026-10-01',
    responsible: 'Robson Alves Dias Bonfim',
    notes: 'Inspeção e recarga anual do estoque e frente de loja.',
    status: 'ENVIADO',
    subtotal: 820.0,
    discount: 40.0,
    total: 780.0,
    paymentTerms: 'Boleto bancário em 2x (15/30 dias)',
    deliveryTime: '3 dias úteis',
    warranty: '12 meses para recarga',
    items: [
      {
        id: 'qi-003',
        quoteId: 'quote-002',
        serviceId: 'srv-006',
        productService: 'Recarga de extintor CO2 6 kg',
        description: 'Recarga com dióxido de carbono puro e troca de válvula',
        quantity: 6,
        unit: 'UN',
        unitPrice: 85.0,
        discount: 0,
        subtotal: 510.0,
        sortOrder: 1,
      },
      {
        id: 'qi-004',
        quoteId: 'quote-002',
        serviceId: 'srv-011',
        productService: 'Teste Hidrostático Quinquenal',
        description: 'Ensaio hidrostático de cilindro com laudo técnico',
        quantity: 4,
        unit: 'UN',
        unitPrice: 45.0,
        discount: 0,
        subtotal: 180.0,
        sortOrder: 2,
      },
      {
        id: 'qi-005',
        quoteId: 'quote-002',
        serviceId: 'srv-018',
        productService: 'Venda de placa de sinalização fotoluminescente',
        description: 'Placa fotoluminescente 20x20cm para rota de fuga e extintor',
        quantity: 7,
        unit: 'UN',
        unitPrice: 18.0,
        discount: 0,
        subtotal: 126.0,
        sortOrder: 3,
      },
    ],
    createdAt: '2026-09-21T09:15:00Z',
    updatedAt: '2026-09-21T10:00:00Z',
  },
  {
    id: 'quote-003',
    number: '000003',
    clientId: 'cli-002',
    clientName: 'Indústria Metalúrgica São Francisco',
    clientDocument: '12.871.450/0001-88',
    clientPhone: '(74) 3613-9200',
    clientEmail: 'seguranca@metalurgicasf.com.br',
    clientAddress: 'Distrito Industrial do São Francisco, Galpão 14 - Juazeiro - BA',
    date: '2026-09-22',
    validUntil: '2026-10-02',
    responsible: 'Robson Alves Dias Bonfim',
    notes: 'Orçamento em elaboração para adequação completa dos galpões 1 e 2.',
    status: 'RASCUNHO',
    subtotal: 1480.0,
    discount: 80.0,
    total: 1400.0,
    paymentTerms: 'A combinar',
    deliveryTime: '5 dias úteis',
    warranty: '12 meses',
    items: [
      {
        id: 'qi-006',
        quoteId: 'quote-003',
        serviceId: 'srv-014',
        productService: 'Venda de extintor novo PQS 6 kg ABC completo',
        description: 'Extintor novo ABC com suporte e carga lacrada',
        quantity: 8,
        unit: 'UN',
        unitPrice: 165.0,
        discount: 0,
        subtotal: 1320.0,
        sortOrder: 1,
      },
      {
        id: 'qi-007',
        quoteId: 'quote-003',
        serviceId: 'srv-012',
        productService: 'Instalação e fixação técnica',
        description: 'Fixação em colunas de concreto e sinalização de piso',
        quantity: 8,
        unit: 'SV',
        unitPrice: 20.0,
        discount: 0,
        subtotal: 160.0,
        sortOrder: 2,
      },
    ],
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-09-22T14:30:00Z',
  },
];

// Helper seguro para LocalStorage
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to local storage (${key}):`, err);
  }
}

// Inicializador de dados padrão caso storage esteja vazio ou precise de atualização
export function initDatabase(): void {
  const currentSettings = getLocal<CompanySettings | null>(STORAGE_KEYS.SETTINGS, null);
  if (
    !currentSettings ||
    currentSettings.cnpj !== '64.319.136/0001-41' ||
    !currentSettings.neighborhood?.includes('JOÃO PAULO II') ||
    currentSettings.city?.includes('Norte') ||
    currentSettings.state === 'CE' ||
    currentSettings.responsibleName?.includes('Carlos')
  ) {
    setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_COMPANY_SETTINGS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    setLocal(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  } else {
    // Migrar cidades de clientes se necessário
    const currentClients = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, []);
    let clientsUpdated = false;
    const migratedClients = currentClients.map((c) => {
      let mod = false;
      let city = c.city;
      let state = c.state;
      let address = c.address;
      if (city?.includes('Norte')) {
        city = 'Juazeiro';
        state = 'BA';
        mod = true;
      }
      if (state === 'CE') {
        state = 'BA';
        mod = true;
      }
      if (address?.includes('Juazeiro do Norte')) {
        address = address.replace(/Juazeiro do Norte/g, 'Juazeiro');
        mod = true;
      }
      if (mod) clientsUpdated = true;
      return { ...c, city, state, address };
    });
    if (clientsUpdated) {
      setLocal(STORAGE_KEYS.CLIENTS, migratedClients);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    setLocal(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXTINGUISHERS)) {
    setLocal(STORAGE_KEYS.EXTINGUISHERS, INITIAL_EXTINGUISHERS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
    setLocal(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
  } else {
    // Migrar responsável nos orçamentos existentes
    const currentQuotes = getLocal<Quote[]>(STORAGE_KEYS.QUOTES, []);
    let quotesUpdated = false;
    const migratedQuotes = currentQuotes.map((q) => {
      let mod = false;
      let resp = q.responsible;
      let clientAddress = q.clientAddress;
      if (!resp || resp.includes('Carlos')) {
        resp = 'Robson Alves Dias Bonfim';
        mod = true;
      }
      if (clientAddress?.includes('Juazeiro do Norte')) {
        clientAddress = clientAddress.replace(/Juazeiro do Norte/g, 'Juazeiro').replace(/CE/g, 'BA');
        mod = true;
      }
      if (mod) quotesUpdated = true;
      return { ...q, responsible: resp, clientAddress };
    });
    if (quotesUpdated) {
      setLocal(STORAGE_KEYS.QUOTES, migratedQuotes);
    }
  }

  // Sincronizar dados para o Cloud Firestore
  seedFirestoreIfEmpty();
}

let isSeeding = false;
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (!db || isSeeding) return;
  isSeeding = true;
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    if (clientsSnap.empty) {
      for (const client of INITIAL_CLIENTS) {
        await setDoc(doc(db, 'clients', client.id), client);
      }
      for (const srv of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', srv.id), srv);
      }
      for (const ext of INITIAL_EXTINGUISHERS) {
        await setDoc(doc(db, 'fire_extinguishers', ext.id), ext);
      }
      for (const q of INITIAL_QUOTES) {
        await setDoc(doc(db, 'quotes', q.id), q);
        for (const item of q.items) {
          await setDoc(doc(db, 'quotes', q.id, 'quote_items', item.id), item);
        }
      }
      await setDoc(doc(db, 'company_settings', 'main'), DEFAULT_COMPANY_SETTINGS);
      console.log('Dados iniciais sincronizados com o Cloud Firestore com sucesso!');
    }
  } catch (err) {
    console.warn('Sincronização em nuvem ativa em modo híbrido:', err);
  } finally {
    isSeeding = false;
  }
}

// ==========================================
// EMPRESA / CONFIGURAÇÕES
// ==========================================
export async function getCompanySettings(): Promise<CompanySettings> {
  initDatabase();
  return getLocal<CompanySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_COMPANY_SETTINGS);
}

export async function saveCompanySettings(settings: CompanySettings): Promise<void> {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
  if (db) {
    try {
      await setDoc(doc(db, 'company_settings', 'main'), settings);
    } catch {
      // Offline fallback ok
    }
  }
}

// ==========================================
// CLIENTES
// ==========================================
export async function getClients(): Promise<Client[]> {
  initDatabase();
  let list = getLocal<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'clients'));
      if (!snap.empty) {
        list = snap.docs.map((d) => d.data() as Client);
        setLocal(STORAGE_KEYS.CLIENTS, list);
      }
    } catch {
      // offline fallback
    }
  }
  return list;
}

export async function saveClient(client: Client): Promise<Client> {
  const clients = await getClients();
  const existingIdx = clients.findIndex((c) => c.id === client.id);
  const now = new Date().toISOString();

  let savedClient: Client;
  if (existingIdx >= 0) {
    savedClient = { ...client, updatedAt: now };
    clients[existingIdx] = savedClient;
  } else {
    savedClient = {
      ...client,
      id: client.id || `cli-${Date.now().toString(36)}`,
      createdAt: client.createdAt || now,
      updatedAt: now,
    };
    clients.unshift(savedClient);
  }

  setLocal(STORAGE_KEYS.CLIENTS, clients);

  if (db) {
    try {
      await setDoc(doc(db, 'clients', savedClient.id), savedClient);
    } catch {
      // offline fallback
    }
  }

  return savedClient;
}

export async function deleteClient(id: string): Promise<void> {
  const clients = (await getClients()).filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CLIENTS, clients);

  if (db) {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch {
      // offline fallback
    }
  }
}

// ==========================================
// SERVIÇOS & PRODUTOS
// ==========================================
export async function getServices(): Promise<ServiceItem[]> {
  initDatabase();
  let list = getLocal<ServiceItem[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'services'));
      if (!snap.empty) {
        list = snap.docs.map((d) => d.data() as ServiceItem);
        setLocal(STORAGE_KEYS.SERVICES, list);
      }
    } catch {
      // offline fallback
    }
  }
  return list;
}

export async function saveService(service: ServiceItem): Promise<ServiceItem> {
  const services = await getServices();
  const existingIdx = services.findIndex((s) => s.id === service.id);

  let savedService: ServiceItem;
  if (existingIdx >= 0) {
    savedService = { ...service };
    services[existingIdx] = savedService;
  } else {
    savedService = {
      ...service,
      id: service.id || `srv-${Date.now().toString(36)}`,
      createdAt: service.createdAt || new Date().toISOString(),
    };
    services.push(savedService);
  }

  setLocal(STORAGE_KEYS.SERVICES, services);

  if (db) {
    try {
      await setDoc(doc(db, 'services', savedService.id), savedService);
    } catch {
      // offline fallback
    }
  }

  return savedService;
}

export async function deleteService(id: string): Promise<void> {
  const services = (await getServices()).filter((s) => s.id !== id);
  setLocal(STORAGE_KEYS.SERVICES, services);

  if (db) {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch {
      // offline fallback
    }
  }
}

// ==========================================
// EXTINTORES (SEM QR CODE, SEM INMETRO)
// ==========================================
export async function getExtinguishers(): Promise<FireExtinguisher[]> {
  initDatabase();
  let list = getLocal<FireExtinguisher[]>(STORAGE_KEYS.EXTINGUISHERS, INITIAL_EXTINGUISHERS);

  // Garantir que nenhum extintor contenha qrCode ou inmetro
  list = list.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clean: any = { ...item };
    delete clean.qrCode;
    delete clean.inmetro;
    delete clean.inmetroCode;
    delete clean.inmetroQr;
    return clean as FireExtinguisher;
  });

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'fire_extinguishers'));
      if (!snap.empty) {
        list = snap.docs.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = d.data();
          delete data.qrCode;
          delete data.inmetro;
          delete data.inmetroCode;
          return data as FireExtinguisher;
        });
        setLocal(STORAGE_KEYS.EXTINGUISHERS, list);
      }
    } catch {
      // offline fallback
    }
  }
  return list;
}

export async function saveExtinguisher(ext: FireExtinguisher): Promise<FireExtinguisher> {
  const extinguishers = await getExtinguishers();
  const now = new Date().toISOString();

  // Higienização completa: nunca permitir campos qrCode ou inmetro
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanExt: any = { ...ext };
  delete cleanExt.qrCode;
  delete cleanExt.inmetro;
  delete cleanExt.inmetroCode;
  delete cleanExt.inmetroQr;

  const existingIdx = extinguishers.findIndex((e) => e.id === cleanExt.id);
  let saved: FireExtinguisher;

  if (existingIdx >= 0) {
    saved = { ...cleanExt, updatedAt: now };
    extinguishers[existingIdx] = saved;
  } else {
    saved = {
      ...cleanExt,
      id: cleanExt.id || `ext-${Date.now().toString(36)}`,
      createdAt: cleanExt.createdAt || now,
      updatedAt: now,
    };
    extinguishers.unshift(saved);
  }

  setLocal(STORAGE_KEYS.EXTINGUISHERS, extinguishers);

  if (db) {
    try {
      await setDoc(doc(db, 'fire_extinguishers', saved.id), saved);
    } catch {
      // offline fallback
    }
  }

  return saved;
}

export async function deleteExtinguisher(id: string): Promise<void> {
  const extinguishers = (await getExtinguishers()).filter((e) => e.id !== id);
  setLocal(STORAGE_KEYS.EXTINGUISHERS, extinguishers);

  if (db) {
    try {
      await deleteDoc(doc(db, 'fire_extinguishers', id));
    } catch {
      // offline fallback
    }
  }
}

// ==========================================
// ORÇAMENTOS (QUOTES & QUOTE_ITEMS)
// ==========================================
export async function getQuotes(): Promise<Quote[]> {
  initDatabase();
  let list = getLocal<Quote[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'quotes'));
      if (!snap.empty) {
        const remoteQuotes: Quote[] = [];
        for (const quoteDoc of snap.docs) {
          const qData = quoteDoc.data() as Quote;
          // Buscar quote_items correspondentes no Firestore se disponíveis
          try {
            const itemsSnap = await getDocs(collection(db, 'quotes', quoteDoc.id, 'quote_items'));
            if (!itemsSnap.empty) {
              qData.items = itemsSnap.docs.map((itemDoc) => itemDoc.data() as QuoteItem);
            }
          } catch {
            // keep items from qData
          }
          remoteQuotes.push(qData);
        }
        list = remoteQuotes;
        setLocal(STORAGE_KEYS.QUOTES, list);
      }
    } catch {
      // offline fallback
    }
  }

  // Ordenar por data decrescente
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getNextQuoteNumber(): Promise<string> {
  const quotes = await getQuotes();
  if (quotes.length === 0) return '000001';

  // Extrair números
  const numbers = quotes
    .map((q) => {
      const cleanNum = q.number.replace(/\D/g, '');
      return parseInt(cleanNum, 10);
    })
    .filter((n) => !isNaN(n));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const next = maxNum + 1;
  return next.toString().padStart(6, '0');
}

export async function saveQuote(quote: Quote): Promise<Quote> {
  const quotes = await getQuotes();
  const now = new Date().toISOString();

  // Calcular subtotal, desconto e total automaticamente
  const calculatedSubtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const calculatedDiscount = quote.items.reduce((acc, item) => acc + (item.discount || 0), 0) + (quote.discount > 0 && quote.items.every(i => !i.discount) ? quote.discount : 0);
  const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

  const existingIdx = quotes.findIndex((q) => q.id === quote.id);
  let savedQuote: Quote;

  if (existingIdx >= 0) {
    savedQuote = {
      ...quote,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      total: calculatedTotal,
      updatedAt: now,
    };
    quotes[existingIdx] = savedQuote;
  } else {
    const nextNumber = quote.number || (await getNextQuoteNumber());
    savedQuote = {
      ...quote,
      id: quote.id || `quote-${Date.now().toString(36)}`,
      number: nextNumber,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      total: calculatedTotal,
      createdAt: quote.createdAt || now,
      updatedAt: now,
    };
    quotes.unshift(savedQuote);
  }

  setLocal(STORAGE_KEYS.QUOTES, quotes);

  // Persistir no Firestore: coleção quotes e subcoleção quote_items
  if (db) {
    try {
      const quoteDocRef = doc(db, 'quotes', savedQuote.id);
      await setDoc(quoteDocRef, {
        id: savedQuote.id,
        number: savedQuote.number,
        clientId: savedQuote.clientId,
        clientName: savedQuote.clientName,
        clientDocument: savedQuote.clientDocument || '',
        clientPhone: savedQuote.clientPhone || '',
        clientEmail: savedQuote.clientEmail || '',
        clientAddress: savedQuote.clientAddress || '',
        date: savedQuote.date,
        validUntil: savedQuote.validUntil,
        responsible: savedQuote.responsible,
        notes: savedQuote.notes,
        status: savedQuote.status,
        subtotal: savedQuote.subtotal,
        discount: savedQuote.discount,
        total: savedQuote.total,
        paymentTerms: savedQuote.paymentTerms || '',
        deliveryTime: savedQuote.deliveryTime || '',
        warranty: savedQuote.warranty || '',
        createdAt: savedQuote.createdAt,
        updatedAt: savedQuote.updatedAt,
      });

      // Gravar itens na coleção quote_items
      for (const item of savedQuote.items) {
        const itemDocRef = doc(db, 'quotes', savedQuote.id, 'quote_items', item.id);
        await setDoc(itemDocRef, {
          ...item,
          quoteId: savedQuote.id,
        });
      }
    } catch {
      // offline fallback
    }
  }

  return savedQuote;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  const quotes = await getQuotes();
  const quote = quotes.find((q) => q.id === id);
  if (!quote) return;

  quote.status = status;
  quote.updatedAt = new Date().toISOString();
  setLocal(STORAGE_KEYS.QUOTES, quotes);

  if (db) {
    try {
      await updateDoc(doc(db, 'quotes', id), {
        status,
        updatedAt: quote.updatedAt,
      });
    } catch {
      // offline fallback
    }
  }
}

export async function deleteQuote(id: string): Promise<void> {
  const quotes = (await getQuotes()).filter((q) => q.id !== id);
  setLocal(STORAGE_KEYS.QUOTES, quotes);

  if (db) {
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch {
      // offline fallback
    }
  }
}

export async function duplicateQuote(id: string): Promise<Quote | null> {
  const quotes = await getQuotes();
  const source = quotes.find((q) => q.id === id);
  if (!source) return null;

  const nextNumber = await getNextQuoteNumber();
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  // Calcular validade padrão (10 dias)
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 10);
  const validUntil = validityDate.toISOString().split('T')[0];

  const duplicatedItems: QuoteItem[] = source.items.map((item, idx) => ({
    ...item,
    id: `qi-${Date.now().toString(36)}-${idx}`,
    quoteId: '',
  }));

  const newQuote: Quote = {
    ...source,
    id: `quote-${Date.now().toString(36)}`,
    number: nextNumber,
    date: today,
    validUntil,
    status: 'RASCUNHO',
    items: duplicatedItems,
    createdAt: now,
    updatedAt: now,
  };

  return await saveQuote(newQuote);
}

// ==========================================
// DASHBOARD STATS
// ==========================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const [quotes, extinguishers, clients] = await Promise.all([
    getQuotes(),
    getExtinguishers(),
    getClients(),
  ]);

  const quotesOpen = quotes.filter((q) => q.status === 'RASCUNHO').length;
  const quotesSent = quotes.filter((q) => q.status === 'ENVIADO').length;
  const quotesApproved = quotes.filter((q) => q.status === 'APROVADO').length;
  const quotesRejected = quotes.filter((q) => q.status === 'RECUSADO').length;
  const quotesExpired = quotes.filter((q) => q.status === 'EXPIRADO').length;

  const totalQuotesAmount = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalApprovedAmount = quotes
    .filter((q) => q.status === 'APROVADO')
    .reduce((acc, q) => acc + (q.total || 0), 0);

  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  let expiringSoonCount = 0;
  let expiredCount = 0;
  let activeCount = 0;

  for (const ext of extinguishers) {
    if (ext.status === 'VENCIDO') {
      expiredCount++;
      continue;
    }
    if (ext.status === 'BAIXADO') {
      continue;
    }

    const nextDate = ext.nextRechargeDate || ext.nextMaintenanceDate;
    if (nextDate) {
      const d = new Date(nextDate);
      if (d < today) {
        expiredCount++;
      } else if (d <= in30Days) {
        expiringSoonCount++;
      } else {
        activeCount++;
      }
    } else {
      activeCount++;
    }
  }

  return {
    quotesOpen,
    quotesSent,
    quotesApproved,
    quotesRejected,
    quotesExpired,
    totalQuotesAmount,
    totalApprovedAmount,
    extinguishersTotal: extinguishers.length,
    extinguishersExpiringSoon: expiringSoonCount,
    extinguishersExpired: expiredCount,
    extinguishersActive: activeCount,
    clientsTotal: clients.length,
  };
}

// ==========================================
// RELATÓRIOS DE MANUTENÇÃO / CHECKLIST NBR 12962
// ==========================================
export const INITIAL_MAINTENANCE_REPORT: MaintenanceReport = {
  id: 'rep-00004',
  reportNumber: '00004',
  orderNumber: '4505396759',
  invoiceNumber: '00033',
  date: '2026-09-14',
  deliveryDate: '2026-09-14',
  clientId: 'cli-wobben',
  clientName: 'Wobben Windpower Ind. e Com. Ltda',
  fantasyName: '',
  clientDocument: '01.027.335/0024-52',
  stateRegistration: '121471923',
  contactPerson: 'ARI CESAR',
  phone: '(15) 2101-1700',
  clientEmail: 'ari.cesar@wobben.com.br',
  address: 'AC IMOVEL DENOMINADO ROCA NOVA S/N -ZONA RURAL',
  numberStreet: 'S/N',
  neighborhood: 'ZONA RURAL',
  city: 'SENTO-SÉ',
  state: 'BA',
  zipCode: '47350-000',
  salesperson: '',
  responsibleOperator: 'ARILSON LEONEL DOS SANTOS',
  operatorRegistration: 'CFT/BA:58098216268',
  technicalNotes: 'Relatório emitido conforme ABNT NBR 12962 / NBR 12274 / EB 160. Manutenção Nível 3 com Teste Hidrostático e Recarga CO2.',
  partsCount: {
    pintura: 10,
    pinturaRet: 5,
    pistola: 1,
    valvula: 2,
    bucha: 0,
    sifao: 4,
    punhoPino: 5,
    quebraJato: 6,
    manometro: 7,
    mangueira: 8,
    cordPlastico: 9,
    saiaPlastica: 10,
    conjApague: 11,
    difusor: 12,
    peraVedacao: 13,
    molaRosca: 14,
    conjMiolo: 15,
    conjHaste: 16,
    anelOring: 17,
    sifaoAluminio: 18,
    conjSeguranca: 19,
    hastePValvula: 20,
    ganchoSuporte: 21,
    travaCorrente: 22,
  },
  reclaimedAgents: [{ agentName: 'CO2', weight: '02 Kg' }],
  newAgents: [],
  items: [
    {
      id: 'item-1',
      seq: 1,
      cylinderNumber: '152259',
      manufactureYear: '2018',
      lastHydrotestYear: '2023',
      manufacturerBrand: 'Mocelin',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-01',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: 'Difusor',
      tareWeight: '6.5',
      emptyWeightPV: '6.52',
      fullWeightPC: '8.52',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.4',
      permanentExpansionEP_DVP: '0.2',
      permanentExpansionPercent: '1.6',
      inmetroSealNumber: '317360778',
      result: 'A',
    },
    {
      id: 'item-2',
      seq: 2,
      cylinderNumber: '152132',
      manufactureYear: '2019',
      lastHydrotestYear: '2023',
      manufacturerBrand: 'Resil',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-02',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: 'Difusor',
      tareWeight: '6.4',
      emptyWeightPV: '6.45',
      fullWeightPC: '8.45',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '11.8',
      permanentExpansionEP_DVP: '0.1',
      permanentExpansionPercent: '0.8',
      inmetroSealNumber: '317360777',
      result: 'A',
    },
    {
      id: 'item-3',
      seq: 3,
      cylinderNumber: '181610',
      manufactureYear: '2020',
      lastHydrotestYear: '2024',
      manufacturerBrand: 'Bucka',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-03',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.6',
      emptyWeightPV: '6.60',
      fullWeightPC: '8.60',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.0',
      permanentExpansionEP_DVP: '0.2',
      permanentExpansionPercent: '1.6',
      inmetroSealNumber: '317360776',
      result: 'A',
    },
    {
      id: 'item-4',
      seq: 4,
      cylinderNumber: '152173',
      manufactureYear: '2019',
      lastHydrotestYear: '2023',
      manufacturerBrand: 'Mocelin',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-04',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.5',
      emptyWeightPV: '6.51',
      fullWeightPC: '8.51',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.2',
      permanentExpansionEP_DVP: '0.2',
      permanentExpansionPercent: '1.6',
      inmetroSealNumber: '317360775',
      result: 'A',
    },
    {
      id: 'item-5',
      seq: 5,
      cylinderNumber: '164841',
      manufactureYear: '2018',
      lastHydrotestYear: '2022',
      manufacturerBrand: 'Resil',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-05',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.4',
      emptyWeightPV: '6.42',
      fullWeightPC: '8.42',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.1',
      permanentExpansionEP_DVP: '0.1',
      permanentExpansionPercent: '0.8',
      inmetroSealNumber: '317360774',
      result: 'A',
    },
    {
      id: 'item-6',
      seq: 6,
      cylinderNumber: '812791',
      manufactureYear: '2017',
      lastHydrotestYear: '2021',
      manufacturerBrand: 'Mocelin',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-06',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.5',
      emptyWeightPV: '6.50',
      fullWeightPC: '8.50',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.3',
      permanentExpansionEP_DVP: '0.2',
      permanentExpansionPercent: '1.6',
      inmetroSealNumber: '317360773',
      result: 'A',
    },
    {
      id: 'item-7',
      seq: 7,
      cylinderNumber: '152227',
      manufactureYear: '2019',
      lastHydrotestYear: '2023',
      manufacturerBrand: 'Mocelin',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-07',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.5',
      emptyWeightPV: '6.53',
      fullWeightPC: '8.53',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '12.5',
      permanentExpansionEP_DVP: '0.2',
      permanentExpansionPercent: '1.6',
      inmetroSealNumber: '317360772',
      result: 'A',
    },
    {
      id: 'item-8',
      seq: 8,
      cylinderNumber: '191355',
      manufactureYear: '2020',
      lastHydrotestYear: '2024',
      manufacturerBrand: 'Resil',
      extinguisherType: 'CO2',
      nominalCapacity: '02 Kg',
      patrimonyNumber: 'WOB-08',
      fireRating: '2bc',
      projectCode: '',
      nbrStandard: '12630',
      maintenanceLevel: 3,
      agentTraceability: 'LOTE-CO2-0926',
      paintRepaired: true,
      accessories: '',
      tareWeight: '6.4',
      emptyWeightPV: '6.48',
      fullWeightPC: '8.48',
      massLossPercent: '0.0',
      maxChargeCapacity: '2.0',
      volumeLiters: '3.0',
      workingPressurePNC: '124',
      testPressure: '210',
      totalExpansionET_DVM: '11.9',
      permanentExpansionEP_DVP: '0.1',
      permanentExpansionPercent: '0.8',
      inmetroSealNumber: '317360771',
      result: 'A',
    },
  ],
  createdAt: '2026-09-14T09:00:00Z',
  updatedAt: '2026-09-14T10:00:00Z',
};

export async function getMaintenanceReports(): Promise<MaintenanceReport[]> {
  initDatabase();
  let list = getLocal<MaintenanceReport[]>(STORAGE_KEYS.MAINTENANCE_REPORTS, [INITIAL_MAINTENANCE_REPORT]);

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'maintenance_reports'));
      if (!snap.empty) {
        list = snap.docs.map((d) => d.data() as MaintenanceReport);
        setLocal(STORAGE_KEYS.MAINTENANCE_REPORTS, list);
      }
    } catch {
      // offline fallback
    }
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNextMaintenanceReportNumber(): Promise<string> {
  const reports = await getMaintenanceReports();
  if (reports.length === 0) return '00001';

  const numbers = reports
    .map((r) => parseInt(r.reportNumber.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return (maxNum + 1).toString().padStart(5, '0');
}

export async function saveMaintenanceReport(report: MaintenanceReport): Promise<MaintenanceReport> {
  const reports = await getMaintenanceReports();
  const now = new Date().toISOString();
  const existingIdx = reports.findIndex((r) => r.id === report.id);

  let savedReport: MaintenanceReport;
  if (existingIdx >= 0) {
    savedReport = { ...report, updatedAt: now };
    reports[existingIdx] = savedReport;
  } else {
    const nextNum = report.reportNumber || (await getNextMaintenanceReportNumber());
    savedReport = {
      ...report,
      id: report.id || `rep-${Date.now().toString(36)}`,
      reportNumber: nextNum,
      createdAt: report.createdAt || now,
      updatedAt: now,
    };
    reports.unshift(savedReport);
  }

  setLocal(STORAGE_KEYS.MAINTENANCE_REPORTS, reports);

  if (db) {
    try {
      await setDoc(doc(db, 'maintenance_reports', savedReport.id), savedReport);
    } catch {
      // offline fallback
    }
  }

  return savedReport;
}

export async function deleteMaintenanceReport(id: string): Promise<void> {
  const reports = (await getMaintenanceReports()).filter((r) => r.id !== id);
  setLocal(STORAGE_KEYS.MAINTENANCE_REPORTS, reports);

  if (db) {
    try {
      await deleteDoc(doc(db, 'maintenance_reports', id));
    } catch {
      // offline fallback
    }
  }
}

