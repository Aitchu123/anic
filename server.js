// Simple Express server to handle form submissions and send email to duvidas@anic.live
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https'; // <- adicionado

const app = express();
const PORT = process.env.PORT || 3737;
const MAIL_TO = process.env.MAIL_TO || 'duvidas@anic.live';

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
    from: `ANIC <no-reply@anic.live>`,
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

// API routes
app.post('/api/form/cadastro', async (req, res) => {
  try {
    const fields = req.body;
    const text = formatCadastroBody(fields);
    await sendMail({ subject: 'Cadastro ANIC - Ficha Cadastral', text });
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
    await sendMail({ subject: 'Contato ANIC - Mensagem', text });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail de contato:', err);
    return res.status(500).json({ ok: false, error: 'Falha ao enviar e-mail' });
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
  console.log(`ANIC server listening on http://localhost:${PORT}`);
});