const CPF_DIGITS_REGEX = /\D/g;
const PHONE_DIGITS_REGEX = /\D/g;
const BASE_PATH_SUFFIX_REGEX = /\/$/;

export const REGISTRATION_AMOUNT_CENTS = 9000;
export const REGISTRATION_PRODUCT_NAME = 'Cadastro Profissional ANCI';
export const WHATSAPP_SUPPORT_URL =
  'https://wa.me/556198651825?text=Quero%20fazer%20a%20carteirinha%20de%20instrumentador%20da%20ANCI';

export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type RegistrationCustomer = {
  nome_completo: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  estado: string;
  instituicao_formacao: string;
  ano_conclusao: string;
  tempo_experiencia: string;
  observacoes: string;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type RegistrationOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'EXPIRED'
  | 'FAILED'
  | 'CANCELLED';

export type RegistrationOrder = {
  orderId: string;
  status: RegistrationOrderStatus;
  amountCents: number;
  pix: {
    qrCode: string;
    copyPaste: string;
    expiresAt: string;
  } | null;
  paidAt: string | null;
  attempts: number;
};

type ErrorPayload = {
  error?: string;
  message?: string;
  details?: ValidationIssue[];
};

export const EMPTY_REGISTRATION_CUSTOMER: RegistrationCustomer = {
  nome_completo: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  email: '',
  telefone: '',
  endereco: '',
  estado: '',
  instituicao_formacao: '',
  ano_conclusao: '',
  tempo_experiencia: '',
  observacoes: '',
};

export class RegistrationApiError extends Error {
  status: number;
  code: string;
  details: ValidationIssue[];

  constructor(status: number, payload: ErrorPayload = {}) {
    super(payload.message || 'Nao foi possivel concluir a solicitacao agora.');
    this.name = 'RegistrationApiError';
    this.status = status;
    this.code = payload.error || 'REGISTRATION_API_ERROR';
    this.details = Array.isArray(payload.details) ? payload.details : [];
  }
}

function normalizeBasePath() {
  return __BASE_PATH__.replace(BASE_PATH_SUFFIX_REGEX, '');
}

function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new RegistrationApiError(response.status, (payload || {}) as ErrorPayload);
  }

  return payload as T;
}

export function getApiBaseUrl() {
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '3737'
  ) {
    return 'http://localhost:3737';
  }

  return '';
}

export function resolvePublicAssetPath(path: string) {
  const normalizedBasePath = normalizeBasePath();

  if (!normalizedBasePath) {
    return path;
  }

  return `${normalizedBasePath}${path}`;
}

export function buildPixQrCodeSrc(qrCode: string) {
  if (!qrCode) {
    return '';
  }

  if (qrCode.startsWith('data:image')) {
    return qrCode;
  }

  return `data:image/png;base64,${qrCode}`;
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountCents / 100);
}

export function formatCpf(value: string) {
  const digits = value.replace(CPF_DIGITS_REGEX, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string) {
  const digits = value.replace(PHONE_DIGITS_REGEX, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  }

  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  }

  return digits.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

export function normalizeCpfDigits(value: string) {
  return value.replace(CPF_DIGITS_REGEX, '');
}

export function normalizePhoneDigits(value: string) {
  return value.replace(PHONE_DIGITS_REGEX, '');
}

export function formatDisplayDate(value: string) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsed);
}

export function formatDisplayDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

export function getStatusLabel(status: RegistrationOrderStatus) {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Aguardando pagamento';
    case 'PAID':
      return 'Pagamento confirmado';
    case 'EXPIRED':
      return 'Pix expirado';
    case 'FAILED':
      return 'Falha na cobrança';
    case 'CANCELLED':
      return 'Cobrança cancelada';
    default:
      return status;
  }
}

export async function createRegistrationOrder(customer: RegistrationCustomer) {
  return requestJson<RegistrationOrder>('/api/checkout/orders', {
    method: 'POST',
    body: JSON.stringify({ customer }),
  });
}

export async function getRegistrationOrder(orderId: string) {
  return requestJson<RegistrationOrder>(`/api/checkout/orders/${orderId}`, {
    method: 'GET',
  });
}

export async function retryRegistrationOrder(orderId: string) {
  return requestJson<RegistrationOrder>(`/api/checkout/orders/${orderId}/retry`, {
    method: 'POST',
  });
}
