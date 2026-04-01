const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTH = {
  nome_completo: 120,
  cpf: 20,
  rg: 30,
  data_nascimento: 30,
  email: 120,
  telefone: 30,
  endereco: 200,
  estado: 50,
  instituicao_formacao: 120,
  ano_conclusao: 10,
  tempo_experiencia: 50,
  observacoes: 2000,
};

const CUSTOMER_FIELDS = [
  'nome_completo',
  'cpf',
  'rg',
  'data_nascimento',
  'email',
  'telefone',
  'endereco',
  'estado',
  'instituicao_formacao',
  'ano_conclusao',
  'tempo_experiencia',
  'observacoes',
];

function toTrimmedString(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function truncate(value, maxLength) {
  if (!maxLength || value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength);
}

function normalizeCpf(value) {
  return value.replace(/\D/g, '');
}

export function validateCheckoutOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: 'payload', message: 'Payload inválido' }],
      customer: null,
    };
  }

  const customerInput = payload.customer;
  if (!customerInput || typeof customerInput !== 'object' || Array.isArray(customerInput)) {
    return {
      valid: false,
      errors: [{ field: 'customer', message: 'Dados do cliente são obrigatórios' }],
      customer: null,
    };
  }

  const customer = {};

  for (const field of CUSTOMER_FIELDS) {
    const maxLength = MAX_LENGTH[field] || 255;
    customer[field] = truncate(toTrimmedString(customerInput[field]), maxLength);
  }

  customer.cpf = normalizeCpf(customer.cpf);

  if (customer.nome_completo.length < 3) {
    errors.push({ field: 'customer.nome_completo', message: 'Nome completo é obrigatório' });
  }

  if (customer.cpf.length !== 11) {
    errors.push({ field: 'customer.cpf', message: 'CPF inválido' });
  }

  if (!EMAIL_REGEX.test(customer.email)) {
    errors.push({ field: 'customer.email', message: 'E-mail inválido' });
  }

  if (customer.telefone.length < 8) {
    errors.push({ field: 'customer.telefone', message: 'Telefone/WhatsApp inválido' });
  }

  return {
    valid: errors.length === 0,
    errors,
    customer,
  };
}
