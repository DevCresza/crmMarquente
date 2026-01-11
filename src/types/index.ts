// User types
export type UserRole = "admin" | "cadastro" | "representante" | "user";

export interface User {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  whatsapp?: string;
  password?: string;
  role: UserRole;
  created_at: string;
}

// B2B Registration types
export type RegistrationType = "vista" | "prazo";

export type B2BStatus =
  | "Lead Site"
  | "Lead Site - À Vista"
  | "Lead Site - A Prazo"
  | "Aguardando Análise"
  | "Cadastro Recebido"
  | "Avaliação Cadastro"
  | "Cadastro Pendente"
  | "Cadastro Realizado"
  | "Onboarding Realizado";

export type RegistrationStatus =
  | "novo"
  | "em_analise"
  | "documentacao_pendente"
  | "aprovado"
  | "reprovado"
  | "aguardando_assinatura"
  | "contrato_assinado"
  | "ativo"
  | "inativo";

export interface BusinessPartner {
  name: string;
  cpf: string;
  rg?: string;
  phone?: string;
  email?: string;
}

export interface BankReference {
  bank_name: string;
  agency: string;
  account: string;
  account_type: "corrente" | "poupanca";
  opening_date?: string;
}

export interface CommercialReference {
  company_name: string;
  cnpj?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
}

export interface B2BRegistration {
  id: string;
  // Basic info
  brand_of_interest: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  cnae?: string;
  foundation_date?: string;

  // Contact
  contact_name: string;
  email: string;
  whatsapp_phone: string;
  store_phone?: string;

  // Address
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_zip?: string;
  cidade?: string;
  uf?: string;

  // Social media
  instagram?: string;
  tiktok?: string;
  website?: string;

  // Financial
  billing_range?: string;

  // Additional info
  suppliers?: string;
  notes?: string;

  // Registration details
  registration_type: RegistrationType;
  status: B2BStatus | RegistrationStatus;

  // Arrays
  business_partners?: BusinessPartner[];
  bank_references?: BankReference[];
  commercial_references?: CommercialReference[];
  store_photos?: string[];

  // Compliance
  lgpd_accepted: boolean;

  // Integration - Linx Commerce
  clifor_code?: string;
  linx_synced_at?: string;

  // Integration - Flodesk
  flodesk_synced_at?: string;

  // Integration status: pending, partial, completed, failed
  integration_status?: 'pending' | 'partial' | 'completed' | 'failed';

  // Timestamps (using Supabase naming convention)
  created_at: string;
  updated_at?: string;
}

// Status configuration
export interface StatusConfig {
  label: string;
  lightBg: string;
  lightText: string;
  darkBg: string;
  darkText: string;
}

export const STATUS_CONFIG: Record<B2BStatus, StatusConfig> = {
  "Lead Site": {
    label: "Lead Site",
    lightBg: "bg-purple-100",
    lightText: "text-purple-800",
    darkBg: "bg-purple-900/50",
    darkText: "text-purple-300",
  },
  "Lead Site - À Vista": {
    label: "À Vista",
    lightBg: "bg-blue-100",
    lightText: "text-blue-800",
    darkBg: "bg-blue-900/50",
    darkText: "text-blue-300",
  },
  "Lead Site - A Prazo": {
    label: "A Prazo",
    lightBg: "bg-indigo-100",
    lightText: "text-indigo-800",
    darkBg: "bg-indigo-900/50",
    darkText: "text-indigo-300",
  },
  "Aguardando Análise": {
    label: "Aguardando",
    lightBg: "bg-yellow-100",
    lightText: "text-yellow-800",
    darkBg: "bg-yellow-900/50",
    darkText: "text-yellow-300",
  },
  "Cadastro Recebido": {
    label: "Recebido",
    lightBg: "bg-cyan-100",
    lightText: "text-cyan-800",
    darkBg: "bg-cyan-900/50",
    darkText: "text-cyan-300",
  },
  "Avaliação Cadastro": {
    label: "Avaliação",
    lightBg: "bg-orange-100",
    lightText: "text-orange-800",
    darkBg: "bg-orange-900/50",
    darkText: "text-orange-300",
  },
  "Cadastro Pendente": {
    label: "Pendente",
    lightBg: "bg-red-100",
    lightText: "text-red-800",
    darkBg: "bg-red-900/50",
    darkText: "text-red-300",
  },
  "Cadastro Realizado": {
    label: "Realizado",
    lightBg: "bg-green-100",
    lightText: "text-green-800",
    darkBg: "bg-green-900/50",
    darkText: "text-green-300",
  },
  "Onboarding Realizado": {
    label: "Onboarding",
    lightBg: "bg-emerald-100",
    lightText: "text-emerald-800",
    darkBg: "bg-emerald-900/50",
    darkText: "text-emerald-300",
  },
};

export const STATUS_ORDER: B2BStatus[] = [
  "Lead Site",
  "Lead Site - À Vista",
  "Lead Site - A Prazo",
  "Aguardando Análise",
  "Cadastro Recebido",
  "Avaliação Cadastro",
  "Cadastro Pendente",
  "Cadastro Realizado",
  "Onboarding Realizado",
];

// Billing ranges
export const BILLING_RANGES = [
  "Até R$ 50.000",
  "R$ 50.000 - R$ 100.000",
  "R$ 100.000 - R$ 250.000",
  "R$ 250.000 - R$ 500.000",
  "R$ 500.000 - R$ 1.000.000",
  "Acima de R$ 1.000.000",
];

// Brands
export const BRANDS = [
  "Mar Quente",
  "Camu Camu",
  "Arara Azul",
  "All Hands",
];

// Brazilian states
export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
