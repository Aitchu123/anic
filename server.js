// Simple Express server to handle form submissions and send email to duvidas@anci.live
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CHECKOUT_STATUS,
  CheckoutNotFoundError,
  CheckoutStateError,
  CheckoutValidationError,
  createCheckoutService,
} from './server/checkout/checkout-service.js';
import { createInMemoryOrderRepository } from './server/checkout/order-repository.js';
import { createTurboFyClient, TurboFyClientError } from './server/checkout/turbofy-client.js';

function loadEnvFromFile() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFromFile();

const app = express();
const PORT = process.env.PORT || 3737;
const MAIL_TO = process.env.MAIL_TO || 'duvidas@anci.live';

const checkoutRepository = createInMemoryOrderRepository();
const turbofyClient = createTurboFyClient();
const checkoutService = createCheckoutService({
  repository: checkoutRepository,
  turbofyClient,
});

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configure mail transport: SMTP via env or JSON transport fallback
function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  // Fallback for dev: does not send emails, just logs
  return nodemailer.createTransport({ jsonTransport: true });
}

async function sendMail({ subject, text, html }) {
  const transport = createTransport();
  const info = await transport.sendMail({
    from: `ANCI <no-reply@anci.live>`,
    to: MAIL_TO,
    subject,
    text,
    html,
  });
  return info;
}

// Helpers to format email content
function formatCadastroBody(fields) {
  const lines = [
    'Nova Ficha Cadastral enviada:',
    `Nome Completo: ${fields.nome_completo || ''}`,
    `CPF: ${fields.cpf || ''}`,
    `RG: ${fields.rg || ''}`,
    `Data de Nascimento: ${fields.data_nascimento || ''}`,
    `E-mail: ${fields.email || ''}`,
    `Telefone: ${fields.telefone || ''}`,
    `Endereço: ${fields.endereco || ''}`,
    `Estado: ${fields.estado || ''}`,
    `Instituição de Formação: ${fields.instituicao_formacao || ''}`,
    `Ano de Conclusão: ${fields.ano_conclusao || ''}`,
    `Tempo de Experiência: ${fields.tempo_experiencia || ''}`,
    `Observações: ${fields.observacoes || ''}`,
  ];
  return lines.join('\n');
}

function formatContatoBody(fields) {
  const lines = [
    'Nova mensagem de contato:',
    `Nome: ${fields.nome || ''}`,
    `E-mail: ${fields.email || ''}`,
    `Assunto: ${fields.assunto || ''}`,
    'Mensagem:',
    fields.mensagem || '',
  ];
  return lines.join('\n');
}

function formatCheckoutPaidBody(order) {
  const lines = [
    'Pagamento Pix confirmado para cadastro ANIC:',
    `Pedido: ${order.publicId}`,
    `Status: ${order.status}`,
    `Valor: R$ ${(order.amountCents / 100).toFixed(2)}`,
    `Charge TurboFy: ${order.provider?.chargeId || ''}`,
    `External Ref: ${order.provider?.externalRef || ''}`,
    `Pago em: ${order.paidAt || ''}`,
    '',
    formatCadastroBody(order.customer),
  ];

  return lines.join('\n');
}

async function notifyPaidOrderIfNeeded(order) {
  if (order.status !== CHECKOUT_STATUS.PAID || order.notifications?.paidEmailSentAt) {
    return;
  }

  try {
    const text = formatCheckoutPaidBody(order);
    await sendMail({
      subject: 'Cadastro ANCI - Pagamento Pix confirmado',
      text,
    });
    checkoutService.markPaidNotificationSent(order.publicId);
  } catch (mailError) {
    console.error('Erro ao notificar pagamento confirmado por e-mail:', mailError);
  }
}

// API routes
app.post('/api/form/cadastro', async (req, res) => {
  try {
    const fields = req.body;
    const text = formatCadastroBody(fields);
    await sendMail({ subject: 'Cadastro ANCI - Ficha Cadastral', text });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail de cadastro:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao enviar e-mail' });
  }
});

app.post('/api/form/contato', async (req, res) => {
  try {
    const fields = req.body;
    const text = formatContatoBody(fields);
    await sendMail({ subject: 'Contato ANCI - Mensagem', text });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail de contato:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao enviar e-mail' });
  }
});

app.post('/api/checkout/orders', async (req, res) => {
  try {
    const order = await checkoutService.createOrder(req.body);
    await notifyPaidOrderIfNeeded(order);
    return res.status(201).json(checkoutService.toPublicOrder(order));
  } catch (err) {
    if (err instanceof CheckoutValidationError) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        details: err.details,
      });
    }

    if (err instanceof TurboFyClientError && err.code === 'TURBOFY_CONFIG_ERROR') {
      return res.status(503).json({
        ok: false,
        error: 'CHECKOUT_PROVIDER_CONFIG_ERROR',
        message: 'Gateway de pagamento indisponível no momento.',
      });
    }

    console.error('Erro ao criar pedido de checkout:', err);
    return res.status(500).json({
      ok: false,
      error: 'CHECKOUT_CREATE_FAILED',
      message: 'Não foi possível iniciar o cadastro profissional agora.',
    });
  }
});

async function handleRetryOrder(req, res) {
  try {
    const order = await checkoutService.retryOrder(req.params.orderId);
    await notifyPaidOrderIfNeeded(order);
    return res.status(200).json(checkoutService.toPublicOrder(order));
  } catch (err) {
    if (err instanceof CheckoutNotFoundError) {
      return res.status(404).json({
        ok: false,
        error: 'ORDER_NOT_FOUND',
      });
    }

    if (err instanceof CheckoutStateError) {
      return res.status(409).json({
        ok: false,
        error: 'ORDER_RETRY_NOT_ALLOWED',
        message: err.message,
      });
    }

    console.error('Erro ao recriar Pix do pedido:', err);
    return res.status(500).json({
      ok: false,
      error: 'CHECKOUT_RETRY_FAILED',
    });
  }
}

app.get('/api/checkout/orders/:orderId', (req, res) => {
  try {
    const order = checkoutService.getOrder(req.params.orderId);
    return res.status(200).json(checkoutService.toPublicOrder(order));
  } catch (err) {
    if (err instanceof CheckoutNotFoundError) {
      return res.status(404).json({
        ok: false,
        error: 'ORDER_NOT_FOUND',
      });
    }

    console.error('Erro ao consultar pedido de checkout:', err);
    return res.status(500).json({
      ok: false,
      error: 'CHECKOUT_GET_FAILED',
    });
  }
});

app.post('/api/checkout/orders/:orderId/retry', handleRetryOrder);
app.post('/api/checkout/orders/:orderId/recheck', handleRetryOrder);

app.post('/api/webhooks/turbofy', async (req, res) => {
  try {
    const result = checkoutService.applyWebhook(req.body);

    if (!result.ok && result.reason === 'INVALID_PAYLOAD') {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_WEBHOOK_PAYLOAD',
      });
    }

    if (!result.ok && result.reason === 'ORDER_NOT_FOUND') {
      return res.status(202).json({
        ok: true,
        applied: false,
        reason: 'ORDER_NOT_FOUND',
      });
    }

    const order = result.order;

    if (result.transitioned) {
      await notifyPaidOrderIfNeeded(order);
    }

    return res.status(200).json({
      ok: true,
      applied: result.applied,
      transitioned: result.transitioned,
      targetStatus: result.targetStatus,
    });
  } catch (err) {
    console.error('Erro ao processar webhook TurboFy:', err);
    return res.status(500).json({
      ok: false,
      error: 'WEBHOOK_PROCESSING_FAILED',
    });
  }
});

// Static file serving from Vite build output
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDir = path.join(__dirname, 'out');

app.use(express.static(buildDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ANCI server listening on http://localhost:${PORT}`);
});
