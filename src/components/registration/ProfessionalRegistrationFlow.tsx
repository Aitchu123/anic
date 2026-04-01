import { startTransition, useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BRAZILIAN_STATES,
  EMPTY_REGISTRATION_CUSTOMER,
  REGISTRATION_AMOUNT_CENTS,
  REGISTRATION_PRODUCT_NAME,
  WHATSAPP_SUPPORT_URL,
  buildPixQrCodeSrc,
  createRegistrationOrder,
  formatCpf,
  formatCurrencyFromCents,
  formatDisplayDate,
  formatDisplayDateTime,
  formatPhone,
  getRegistrationOrder,
  getStatusLabel,
  normalizeCpfDigits,
  normalizePhoneDigits,
  RegistrationApiError,
  resolvePublicAssetPath,
  retryRegistrationOrder,
  type RegistrationCustomer,
  type RegistrationOrder,
  type RegistrationOrderStatus,
  type ValidationIssue,
} from '../../services/registration';

type ProfessionalRegistrationFlowProps = {
  presentation: 'embedded' | 'page';
  initialOrderId?: string;
};

type FieldErrors = Partial<Record<keyof RegistrationCustomer, string>>;
type FormStep = 1 | 2 | 3;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEP_LABELS: Array<{ step: FormStep; title: string; description: string }> = [
  {
    step: 1,
    title: 'Seus dados principais',
    description: 'Preencha os dados essenciais para iniciar seu cadastro profissional.',
  },
  {
    step: 2,
    title: 'Dados complementares',
    description: 'Complete as informacoes do cadastro para agilizar a analise da equipe.',
  },
  {
    step: 3,
    title: 'Revisao e pagamento',
    description: 'Confira seus dados antes de gerar o Pix da taxa unica da ANCI.',
  },
];

const ESSENTIAL_FIELDS: Array<keyof RegistrationCustomer> = [
  'nome_completo',
  'cpf',
  'email',
  'telefone',
];

const COMPLEMENTARY_FIELDS: Array<keyof RegistrationCustomer> = [
  'rg',
  'data_nascimento',
  'endereco',
  'estado',
  'instituicao_formacao',
  'ano_conclusao',
  'tempo_experiencia',
  'observacoes',
];

function getStatusClasses(status: RegistrationOrderStatus) {
  switch (status) {
    case 'PAID':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'PENDING_PAYMENT':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'EXPIRED':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'FAILED':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'CANCELLED':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function mapValidationIssues(details: ValidationIssue[]) {
  const nextErrors: FieldErrors = {};

  for (const issue of details) {
    const fieldName = issue.field.replace(/^customer\./, '') as keyof RegistrationCustomer;
    nextErrors[fieldName] = issue.message;
  }

  return nextErrors;
}

function getFirstStepFromErrors(errors: FieldErrors) {
  const firstErrorField = ESSENTIAL_FIELDS.find((field) => errors[field])
    || COMPLEMENTARY_FIELDS.find((field) => errors[field]);

  if (!firstErrorField) {
    return 1 as FormStep;
  }

  return ESSENTIAL_FIELDS.includes(firstErrorField) ? 1 : 2;
}

function validateStep(step: FormStep, customer: RegistrationCustomer) {
  const errors: FieldErrors = {};

  if (step === 1 || step === 3) {
    if (customer.nome_completo.trim().length < 3) {
      errors.nome_completo = 'Informe seu nome completo.';
    }

    if (normalizeCpfDigits(customer.cpf).length !== 11) {
      errors.cpf = 'Informe um CPF valido.';
    }

    if (!EMAIL_REGEX.test(customer.email.trim())) {
      errors.email = 'Informe um e-mail valido.';
    }

    if (normalizePhoneDigits(customer.telefone).length < 10) {
      errors.telefone = 'Informe um telefone ou WhatsApp valido.';
    }
  }

  if (step === 2 || step === 3) {
    if (customer.ano_conclusao && !/^\d{4}$/.test(customer.ano_conclusao.trim())) {
      errors.ano_conclusao = 'Use o ano com 4 digitos.';
    }

    if (customer.data_nascimento && Number.isNaN(new Date(customer.data_nascimento).getTime())) {
      errors.data_nascimento = 'Informe uma data valida.';
    }
  }

  return errors;
}

function formatCountdown(secondsRemaining: number | null) {
  if (secondsRemaining === null) {
    return '--:--';
  }

  const total = Math.max(0, secondsRemaining);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getFieldValue(customer: RegistrationCustomer, field: keyof RegistrationCustomer) {
  const value = customer[field]?.trim();

  if (!value) {
    return 'Nao informado';
  }

  if (field === 'data_nascimento') {
    return formatDisplayDate(value);
  }

  return value;
}

function StatusBadge({ status }: { status: RegistrationOrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

export default function ProfessionalRegistrationFlow({
  presentation,
  initialOrderId,
}: ProfessionalRegistrationFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>(1);
  const [customer, setCustomer] = useState<RegistrationCustomer>(EMPTY_REGISTRATION_CUSTOMER);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupMissing, setLookupMissing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [order, setOrder] = useState<RegistrationOrder | null>(null);
  const [isCreatingPix, setIsCreatingPix] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(Boolean(initialOrderId));
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [isRetryingPix, setIsRetryingPix] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const isEmbedded = presentation === 'embedded';
  const productImage = resolvePublicAssetPath('/carterinha.png');
  const currentStepConfig = STEP_LABELS.find((item) => item.step === step);
  const hasPaymentRoute = Boolean(initialOrderId);
  const pixReady = Boolean(order?.pix?.copyPaste && order?.pix?.expiresAt);
  const qrCodeSrc = order?.pix?.qrCode ? buildPixQrCodeSrc(order.pix.qrCode) : '';

  useEffect(() => {
    const orderId = initialOrderId ?? '';

    if (!orderId) {
      return;
    }

    let active = true;

    async function loadOrder() {
      setStep(3);
      setLookupError('');
      setLookupMissing(false);
      setIsLoadingOrder(true);

      try {
        const nextOrder = await getRegistrationOrder(orderId);
        if (!active) {
          return;
        }

        setOrder(nextOrder);
        setStatusFeedback('');

        if (nextOrder.status === 'PAID') {
          startTransition(() => {
            navigate(`/checkout/sucesso?pedido=${nextOrder.orderId}`, { replace: true });
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (error instanceof RegistrationApiError && error.status === 404) {
          setLookupMissing(true);
        } else {
          setLookupError(
            error instanceof Error
              ? error.message
              : 'Nao foi possivel localizar o pagamento agora.',
          );
        }
      } finally {
        if (active) {
          setIsLoadingOrder(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [initialOrderId, navigate]);

  useEffect(() => {
    const orderId = initialOrderId ?? '';

    if (!orderId || !hasPaymentRoute || order?.status !== 'PENDING_PAYMENT') {
      return;
    }

    let active = true;
    const intervalId = window.setInterval(() => {
      void getRegistrationOrder(orderId).then((nextOrder) => {
        if (!active) {
          return;
        }

        setOrder(nextOrder);
        if (nextOrder.status === 'PAID') {
          startTransition(() => {
            navigate(`/checkout/sucesso?pedido=${nextOrder.orderId}`, { replace: true });
          });
        }
      }).catch(() => {
        if (active) {
          setStatusFeedback('Nao foi possivel atualizar automaticamente o status neste momento.');
        }
      });
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [hasPaymentRoute, initialOrderId, navigate, order?.status]);

  useEffect(() => {
    if (!order?.pix?.expiresAt) {
      setSecondsRemaining(null);
      return;
    }

    const expiresAt = Date.parse(order.pix.expiresAt);
    if (!Number.isFinite(expiresAt)) {
      setSecondsRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const nextRemaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(nextRemaining);
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [order?.pix?.expiresAt]);

  useEffect(() => {
    if (copyFeedback === 'idle') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyFeedback('idle');
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyFeedback]);

  function clearFieldError(field: keyof RegistrationCustomer) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateField(field: keyof RegistrationCustomer, value: string) {
    let nextValue = value;

    if (field === 'cpf') {
      nextValue = formatCpf(value);
    }

    if (field === 'telefone') {
      nextValue = formatPhone(value);
    }

    if (field === 'ano_conclusao') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCustomer((current) => ({
      ...current,
      [field]: nextValue,
    }));
    clearFieldError(field);
    setFormError('');
  }

  function handleInputChange(field: keyof RegistrationCustomer) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateField(field, event.target.value);
    };
  }

  function goToNextStep() {
    const nextErrors = validateStep(step, customer);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setStep((current) => (current === 3 ? current : ((current + 1) as FormStep)));
  }

  function goToPreviousStep() {
    setFormError('');
    setStep((current) => (current === 1 ? current : ((current - 1) as FormStep)));
  }

  async function handleCreatePix() {
    const nextErrors = {
      ...validateStep(1, customer),
      ...validateStep(2, customer),
    };

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setStep(getFirstStepFromErrors(nextErrors));
      return;
    }

    setIsCreatingPix(true);
    setFormError('');
    setFieldErrors({});

    try {
      const nextOrder = await createRegistrationOrder(customer);

      if (nextOrder.status === 'PAID') {
        startTransition(() => {
          navigate(`/checkout/sucesso?pedido=${nextOrder.orderId}`);
        });
        return;
      }

      startTransition(() => {
        navigate(`/checkout/${nextOrder.orderId}`);
      });
    } catch (error) {
      if (error instanceof RegistrationApiError && error.details.length > 0) {
        const apiErrors = mapValidationIssues(error.details);
        setFieldErrors(apiErrors);
        setStep(getFirstStepFromErrors(apiErrors));
      }

      setFormError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel gerar o Pix neste momento.',
      );
    } finally {
      setIsCreatingPix(false);
    }
  }

  async function handleRefreshStatus() {
    const orderId = initialOrderId ?? '';

    if (!orderId) {
      return;
    }

    setIsRefreshingStatus(true);
    setStatusFeedback('');

    try {
      const nextOrder = await getRegistrationOrder(orderId);
      setOrder(nextOrder);
      setStatusFeedback(`Atualizado em ${formatDisplayDateTime(new Date().toISOString())}.`);

      if (nextOrder.status === 'PAID') {
        startTransition(() => {
          navigate(`/checkout/sucesso?pedido=${nextOrder.orderId}`, { replace: true });
        });
      }
    } catch (error) {
      setStatusFeedback(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel atualizar o status agora.',
      );
    } finally {
      setIsRefreshingStatus(false);
    }
  }

  async function handleRetryPix() {
    const orderId = initialOrderId ?? '';

    if (!orderId) {
      return;
    }

    setIsRetryingPix(true);
    setStatusFeedback('');

    try {
      const nextOrder = await retryRegistrationOrder(orderId);
      setOrder(nextOrder);
      if (nextOrder.status === 'PAID') {
        startTransition(() => {
          navigate(`/checkout/sucesso?pedido=${nextOrder.orderId}`, { replace: true });
        });
        return;
      }

      setStatusFeedback(
        nextOrder.status === 'PENDING_PAYMENT'
          ? 'Novo Pix gerado com sucesso.'
          : 'A ANCI tentou gerar um novo Pix, mas a cobranca continua indisponivel.',
      );
    } catch (error) {
      setStatusFeedback(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel gerar um novo Pix agora.',
      );
    } finally {
      setIsRetryingPix(false);
    }
  }

  async function handleCopyPixCode() {
    if (!order?.pix?.copyPaste) {
      setCopyFeedback('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(order.pix.copyPaste);
      setCopyFeedback('success');
    } catch {
      setCopyFeedback('error');
    }
  }

  function renderFieldError(field: keyof RegistrationCustomer) {
    if (!fieldErrors[field]) {
      return null;
    }

    return <p className="mt-2 text-sm text-red-600">{fieldErrors[field]}</p>;
  }

  function renderActionDock() {
    if (hasPaymentRoute) {
      return null;
    }

    const buttonLabel = step === 3 ? 'Gerar pagamento via Pix' : 'Continuar cadastro';
    const buttonAction = step === 3 ? handleCreatePix : goToNextStep;
    const isBusy = isCreatingPix;

    return (
      <div className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{buttonLabel}</p>
            <p className="text-sm text-slate-500">Taxa unica de {formatCurrencyFromCents(REGISTRATION_AMOUNT_CENTS)}.</p>
          </div>
          <div className="flex gap-3 sm:min-w-[320px] sm:justify-end">
            {step > 1 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Voltar
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                void buttonAction();
              }}
              disabled={isBusy}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isBusy ? 'Gerando Pix...' : buttonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderStepOne() {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Nome completo</label>
          <input
            type="text"
            value={customer.nome_completo}
            onChange={handleInputChange('nome_completo')}
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Como deseja aparecer no cadastro"
          />
          {renderFieldError('nome_completo')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">CPF</label>
          <input
            type="text"
            value={customer.cpf}
            onChange={handleInputChange('cpf')}
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="000.000.000-00"
          />
          {renderFieldError('cpf')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">WhatsApp</label>
          <input
            type="tel"
            value={customer.telefone}
            onChange={handleInputChange('telefone')}
            autoComplete="tel"
            inputMode="tel"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="(61) 98651-8250"
          />
          {renderFieldError('telefone')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">E-mail</label>
          <input
            type="email"
            value={customer.email}
            onChange={handleInputChange('email')}
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="seuemail@exemplo.com"
          />
          {renderFieldError('email')}
        </div>
      </div>
    );
  }

  function renderStepTwo() {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700">RG</label>
          <input
            type="text"
            value={customer.rg}
            onChange={handleInputChange('rg')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Numero do RG"
          />
          {renderFieldError('rg')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Data de nascimento</label>
          <input
            type="date"
            value={customer.data_nascimento}
            onChange={handleInputChange('data_nascimento')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {renderFieldError('data_nascimento')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Endereco</label>
          <input
            type="text"
            value={customer.endereco}
            onChange={handleInputChange('endereco')}
            autoComplete="street-address"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Rua, numero, bairro e complemento"
          />
          {renderFieldError('endereco')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Estado</label>
          <select
            value={customer.estado}
            onChange={handleInputChange('estado')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Selecione</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {renderFieldError('estado')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Ano de conclusao</label>
          <input
            type="text"
            value={customer.ano_conclusao}
            onChange={handleInputChange('ano_conclusao')}
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="2024"
          />
          {renderFieldError('ano_conclusao')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Instituicao de formacao</label>
          <input
            type="text"
            value={customer.instituicao_formacao}
            onChange={handleInputChange('instituicao_formacao')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Nome da instituicao"
          />
          {renderFieldError('instituicao_formacao')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Tempo de experiencia</label>
          <input
            type="text"
            value={customer.tempo_experiencia}
            onChange={handleInputChange('tempo_experiencia')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Ex.: 2 anos em centro cirurgico"
          />
          {renderFieldError('tempo_experiencia')}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Observacoes</label>
          <textarea
            value={customer.observacoes}
            onChange={handleInputChange('observacoes')}
            rows={4}
            maxLength={2000}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Se quiser, informe detalhes adicionais sobre sua atuacao"
          />
          {renderFieldError('observacoes')}
        </div>
      </div>
    );
  }

  function renderReviewStep() {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
          <p className="font-semibold">Antes de gerar o Pix</p>
          <p className="mt-2 leading-6 text-blue-800">
            Confira os dados abaixo. Depois do pagamento, nossa equipe segue com a analise do cadastro profissional da ANCI.
          </p>
        </div>

        <dl className="rounded-3xl border border-slate-200 bg-white p-6">
          <SummaryItem label="Nome completo" value={getFieldValue(customer, 'nome_completo')} />
          <SummaryItem label="CPF" value={getFieldValue(customer, 'cpf')} />
          <SummaryItem label="E-mail" value={getFieldValue(customer, 'email')} />
          <SummaryItem label="WhatsApp" value={getFieldValue(customer, 'telefone')} />
          <SummaryItem label="RG" value={getFieldValue(customer, 'rg')} />
          <SummaryItem label="Data de nascimento" value={getFieldValue(customer, 'data_nascimento')} />
          <SummaryItem label="Endereco" value={getFieldValue(customer, 'endereco')} />
          <SummaryItem label="Estado" value={getFieldValue(customer, 'estado')} />
          <SummaryItem label="Instituicao" value={getFieldValue(customer, 'instituicao_formacao')} />
          <SummaryItem label="Ano de conclusao" value={getFieldValue(customer, 'ano_conclusao')} />
          <SummaryItem label="Experiencia" value={getFieldValue(customer, 'tempo_experiencia')} />
          <SummaryItem label="Observacoes" value={getFieldValue(customer, 'observacoes')} />
        </dl>
      </div>
    );
  }

  function renderPaymentState() {
    if (isLoadingOrder) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Carregando pagamento...</p>
        </div>
      );
    }

    if (lookupMissing) {
      return (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-700">Nao encontramos esse pagamento.</p>
          <p className="mt-2 text-sm leading-6 text-red-600">
            O numero informado nao esta mais disponivel ou o servidor foi reiniciado. Inicie um novo cadastro para gerar outro Pix.
          </p>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                navigate('/checkout');
              });
            }}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Iniciar novo cadastro
          </button>
        </div>
      );
    }

    if (lookupError) {
      return (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-700">Nao foi possivel carregar o pagamento.</p>
          <p className="mt-2 text-sm leading-6 text-red-600">{lookupError}</p>
          <button
            type="button"
            onClick={() => {
              void handleRefreshStatus();
            }}
            className="mt-5 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (!order) {
      return null;
    }

    if (order.status === 'PAID') {
      return (
        <div className="rounded-3xl border border-green-100 bg-green-50 p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-green-700">Pagamento confirmado.</p>
          <p className="mt-2 text-sm text-green-700">Redirecionando para os proximos passos do cadastro...</p>
        </div>
      );
    }

    const isPendingPayment = order.status === 'PENDING_PAYMENT' && pixReady;
    const isExpired = order.status === 'EXPIRED';
    const isFailed = order.status === 'FAILED';
    const isCancelled = order.status === 'CANCELLED';

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Pagamento via Pix</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Pedido {order.orderId}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Valor da taxa unica: {formatCurrencyFromCents(order.amountCents)}.
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {isPendingPayment ? (
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">QR Code Pix</p>
                <div className="mx-auto mt-4 flex max-w-[280px] items-center justify-center rounded-3xl bg-white p-4 shadow-inner">
                  {qrCodeSrc ? (
                    <img
                      src={qrCodeSrc}
                      alt="QR Code Pix do cadastro profissional ANCI"
                      className="h-full w-full rounded-2xl object-contain"
                    />
                  ) : (
                    <div className="flex min-h-[240px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
                      Use o codigo Pix abaixo para pagar.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-semibold text-blue-800">Tempo restante</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">{formatCountdown(secondsRemaining)}</p>
                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    Expira em {formatDisplayDateTime(order.pix?.expiresAt || null)}.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <label className="block text-sm font-semibold text-slate-700">Codigo Pix copia e cola</label>
                  <textarea
                    readOnly
                    value={order.pix?.copyPaste || ''}
                    rows={5}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCopyPixCode();
                      }}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Copiar codigo Pix
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleRefreshStatus();
                      }}
                      disabled={isRefreshingStatus}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {isRefreshingStatus ? 'Atualizando...' : 'Atualizar status'}
                    </button>
                  </div>
                  {copyFeedback === 'success' ? (
                    <p className="mt-3 text-sm font-medium text-green-600">Codigo Pix copiado com sucesso.</p>
                  ) : null}
                  {copyFeedback === 'error' ? (
                    <p className="mt-3 text-sm font-medium text-red-600">Nao foi possivel copiar agora. Selecione e copie manualmente.</p>
                  ) : null}
                  {statusFeedback ? (
                    <p className="mt-3 text-sm text-slate-500">{statusFeedback}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isExpired || isFailed || isCancelled || !pixReady ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-amber-900">
              {isExpired ? 'Esse Pix expirou.' : 'O pagamento nao ficou disponivel.'}
            </h3>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              {isCancelled
                ? 'A cobranca foi cancelada antes da confirmacao. Gere um novo Pix para continuar seu cadastro.'
                : 'A ANCI nao vai mostrar um pagamento invalido como se estivesse pronto. Gere um novo Pix para seguir com seguranca.'}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  void handleRetryPix();
                }}
                disabled={isRetryingPix}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isRetryingPix ? 'Gerando novo Pix...' : 'Gerar novo Pix'}
              </button>
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    navigate(`/checkout/expirado?pedido=${order.orderId}`);
                  });
                }}
                className="flex-1 rounded-xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Ver orientacoes
              </button>
            </div>
            {statusFeedback ? (
              <p className="mt-4 text-sm text-amber-800">{statusFeedback}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={isEmbedded ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6'}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Cadastro Profissional ANCI</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Regularize seu cadastro e pague via Pix em poucos minutos.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Preencha seus dados, revise o cadastro e gere o Pix da taxa unica de {formatCurrencyFromCents(REGISTRATION_AMOUNT_CENTS)} com acompanhamento em tempo real.
            </p>
          </div>

          {!hasPaymentRoute ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap gap-3">
                {STEP_LABELS.map((item) => (
                  <div
                    key={item.step}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${step === item.step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    Etapa {item.step}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-2xl font-bold text-slate-900">{currentStepConfig?.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{currentStepConfig?.description}</p>
              </div>

              <div className="mt-8 space-y-6">
                {step === 1 ? renderStepOne() : null}
                {step === 2 ? renderStepTwo() : null}
                {step === 3 ? renderReviewStep() : null}
              </div>

              {formError ? (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              {renderActionDock()}
            </div>
          ) : (
            renderPaymentState()
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resumo do cadastro</p>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
              {imageFailed ? (
                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-center text-white">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">ANCI</p>
                    <p className="mt-3 text-2xl font-bold">Carteirinha profissional</p>
                    <p className="mt-2 text-sm text-blue-100">Documento oficial com numeracao unica nacional.</p>
                  </div>
                </div>
              ) : (
                <img
                  src={productImage}
                  alt="Carteirinha profissional ANCI"
                  className="h-48 w-full object-cover"
                  onError={() => {
                    setImageFailed(true);
                  }}
                />
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{REGISTRATION_PRODUCT_NAME}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Carteirinha profissional, analise cadastral e numeracao unica nacional da ANCI.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Taxa unica</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyFromCents(REGISTRATION_AMOUNT_CENTS)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Pagamento</span>
                  <span className="font-semibold text-slate-900">Pix</span>
                </div>
                {order ? (
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>Pedido</span>
                    <span className="font-semibold text-slate-900">{order.orderId}</span>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                <p className="font-semibold text-blue-900">O que acontece depois do pagamento</p>
                <p className="mt-2">
                  A equipe ANCI recebe seu cadastro, valida a documentacao e segue com os proximos passos da carteirinha profissional.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Atendimento</p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">Precisa de ajuda?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              O WhatsApp continua disponivel para tirar duvidas sobre o cadastro, documentacao e pagamento.
            </p>

            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center justify-center rounded-2xl bg-green-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Falar no WhatsApp
            </a>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
              <p className="font-semibold text-slate-900">Canal oficial da ANCI</p>
              <p className="mt-2">E-mail: duvidas@anci.live</p>
              <p className="mt-1">Atendimento em horario comercial.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
