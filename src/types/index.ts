export type QuoteStatus = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO';

export type ExtinguisherStatus = 'ATIVO' | 'EM_MANUTENCAO' | 'VENCIDO' | 'BAIXADO';

export type ServiceCategory =
  | 'RECARGA'
  | 'MANUTENCAO'
  | 'INSPECAO'
  | 'INSTALACAO'
  | 'RETIRADA'
  | 'VENDA_EXTINTOR'
  | 'VENDA_SUPORTE'
  | 'VENDA_PLACA'
  | 'OUTROS';

export interface Client {
  id: string;
  name: string;
  tradeName?: string;
  document: string; // CPF ou CNPJ
  phone: string;
  email?: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FireExtinguisher {
  id: string;
  number: string; // Número do extintor (ex: EXT-001)
  patrimonyNumber: string; // Número patrimonial
  clientId: string;
  clientName: string;
  location: string; // Localização (ex: Bloco A - Recepção)
  type: string; // PQS Pó Químico, CO2, Água Pressurizada, Espuma, etc.
  capacity: string; // 4 kg, 6 kg, 12 kg, 10 L, etc.
  manufacturer: string; // Fabricante
  model: string;
  serialNumber: string; // Número de série
  manufactureDate: string; // Data de fabricação
  lastMaintenanceDate: string; // Data da última manutenção
  nextMaintenanceDate: string; // Próxima manutenção
  lastRechargeDate: string; // Data da última recarga
  nextRechargeDate: string; // Próxima recarga
  fireClass: string; // Classe de incêndio (ABC, BC, A, K)
  status: ExtinguisherStatus;
  notes: string;
  photos: string[]; // URLs ou base64
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  unit: string; // UN, PC, KG, SV, CJ, M
  defaultPrice: number;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  serviceId?: string;
  productService: string; // Produto ou serviço
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
  sortOrder?: number;
}

export interface Quote {
  id: string;
  number: string; // Número do orçamento (ex: ORÇ-000001)
  clientId: string;
  clientName: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  responsible: string; // Responsável
  notes: string; // Observações
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms?: string;
  deliveryTime?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  name: string;
  legalName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  responsibleName: string;
  responsibleRole: string;
  defaultValidityDays: number;
  defaultNotes: string;
}

export interface DashboardStats {
  quotesOpen: number;
  quotesSent: number;
  quotesApproved: number;
  quotesRejected: number;
  quotesExpired: number;
  totalQuotesAmount: number;
  totalApprovedAmount: number;
  extinguishersTotal: number;
  extinguishersExpiringSoon: number;
  extinguishersExpired: number;
  extinguishersActive: number;
  clientsTotal: number;
}

export type MaintenanceReportResult = 'A' | 'R' | 'N'; // Aprovado, Reprovado, Novo

export interface MaintenanceReportItem {
  id: string;
  seq: number;
  cylinderNumber: string; // Nº do Cilindro ou Recipiente
  manufactureYear: string; // Ano de Fabricação
  lastHydrotestYear: string; // Ano Último T.H. Reteste
  manufacturerBrand: string; // Fabricante/Marca
  extinguisherType: string; // CO2, PQS ABC, PQS BC, AP, EM
  nominalCapacity: string; // 02 Kg, 04 Kg, 06 Kg, 10 L, etc.
  patrimonyNumber: string; // Número do Patrimônio
  fireRating: string; // Capac. Extintora (ex: 2bc, 2A-20B:C)
  projectCode: string; // Cód do Projeto
  nbrStandard: string; // Norma NBR (ex: 12630, 15808, 12962)
  maintenanceLevel: number; // Nível: 1, 2 ou 3
  agentTraceability: string; // Rastreabilidade do Agente Extintor
  paintRepaired: boolean; // Pintura (X ou vazio)
  accessories: string; // Acessórios
  tareWeight: string; // Tara
  emptyWeightPV: string; // Peso Vazio PV (kg)
  fullWeightPC: string; // Peso Cheio PC (kg)
  massLossPercent: string; // % Perda Massa
  maxChargeCapacity: string; // Capacidade Máx. de Carga
  volumeLiters: string; // Volume em Litros (L)
  workingPressurePNC: string; // Pressão de Trabalho / PNC
  testPressure: string; // Pressão de Ensaio
  totalExpansionET_DVM: string; // Expansão Total ET-DVM
  permanentExpansionEP_DVP: string; // Expansão Permanente EP-DVP
  permanentExpansionPercent: string; // Expansão Permanente Percentual EP/ET (%)
  inmetroSealNumber: string; // Selo nº INMETRO
  result: MaintenanceReportResult; // A (Aprovado), R (Reprovado), N (Novo)
}

export interface MaintenanceReportPartsCount {
  pintura: number;
  pinturaRet: number;
  pistola: number;
  valvula: number;
  bucha: number;
  sifao: number;
  punhoPino: number;
  quebraJato: number;
  manometro: number;
  mangueira: number;
  cordPlastico: number;
  saiaPlastica: number;
  conjApague: number;
  difusor: number;
  peraVedacao: number;
  molaRosca: number;
  conjMiolo: number;
  conjHaste: number;
  anelOring: number;
  sifaoAluminio: number;
  conjSeguranca: number;
  hastePValvula: number;
  ganchoSuporte: number;
  travaCorrente: number;
}

export interface MaintenanceReport {
  id: string;
  reportNumber: string; // Ex: 00004
  orderNumber: string; // Pedido (ex: 4505396759)
  invoiceNumber: string; // Nota Fiscal (ex: 00033)
  date: string; // Data / Emissão
  deliveryDate: string; // Data Entrega
  clientId: string;
  clientName: string;
  clientDocument: string;
  stateRegistration: string; // IE
  fantasyName: string; // Nome Fant.:
  contactPerson: string; // Contato: ARI CESAR
  phone: string; // Fone: Tel.:
  clientEmail?: string; // Email do cliente para envio direto
  address: string; // End.:
  numberStreet: string; // Nº:
  neighborhood: string; // Bairro:
  city: string; // Cidade:
  state: string; // UF:
  zipCode: string; // CEP:
  salesperson: string; // Vendedor:
  responsibleOperator: string; // Responsável Operacional: ARILSON LEONEL DOS SANTOS
  operatorRegistration: string; // CFT/BA:58098216268 ou Registro
  technicalNotes: string;
  items: MaintenanceReportItem[];
  partsCount: MaintenanceReportPartsCount;
  reclaimedAgents: {
    agentName: string;
    weight: string;
  }[];
  newAgents: {
    agentName: string;
    weight: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

