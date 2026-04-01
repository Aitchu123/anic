const DEFAULT_BASE_URL = 'https://api.turbofypay.com';
const DEFAULT_PIX_PATH = '/rifeiro/pix';
const DEFAULT_TIMEOUT_MS = 12000;

export class TurboFyClientError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'TurboFyClientError';
    this.code = options.code || 'TURBOFY_ERROR';
    this.httpStatus = options.httpStatus || null;
    this.payload = options.payload;
    this.cause = options.cause;
  }
}

function buildUrl(baseUrl, path) {
  return new URL(path, baseUrl).toString();
}

function validateWebhookUrl(rawWebhookUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(rawWebhookUrl);
  } catch (_error) {
    throw new TurboFyClientError('TURBOFY_WEBHOOK_URL inválida', {
      code: 'TURBOFY_CONFIG_ERROR',
    });
  }

  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/, '');

  if (normalizedPathname !== '/api/webhooks/turbofy') {
    throw new TurboFyClientError('TURBOFY_WEBHOOK_URL deve apontar para /api/webhooks/turbofy', {
      code: 'TURBOFY_CONFIG_ERROR',
    });
  }

  return parsedUrl.toString();
}

function readEnvConfig(env) {
  const baseUrl = env.TURBOFY_BASE_URL || DEFAULT_BASE_URL;
  const pixPath = env.TURBOFY_PIX_PATH || DEFAULT_PIX_PATH;
  const clientId = env.TURBOFY_X_CLIENT_ID;
  const clientSecret = env.TURBOFY_X_CLIENT_SECRET;
  const webhookUrl = env.TURBOFY_WEBHOOK_URL;
  const webhookSecret = env.TURBOFY_WEBHOOK_SECRET;

  if (!clientId || !clientSecret) {
    throw new TurboFyClientError('Credenciais TurboFy não configuradas', {
      code: 'TURBOFY_CONFIG_ERROR',
    });
  }

  if (!webhookUrl || !webhookSecret) {
    throw new TurboFyClientError('Webhook TurboFy não configurado', {
      code: 'TURBOFY_CONFIG_ERROR',
    });
  }

  const validatedWebhookUrl = validateWebhookUrl(webhookUrl);

  return {
    baseUrl,
    pixPath,
    clientId,
    clientSecret,
    webhookUrl: validatedWebhookUrl,
    webhookSecret,
  };
}

async function parseResponsePayload(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

export function createTurboFyClient(options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const env = options.env || process.env;
  const timeoutMs = Number(env.TURBOFY_TIMEOUT_MS || options.timeoutMs || DEFAULT_TIMEOUT_MS);

  if (typeof fetchImpl !== 'function') {
    throw new TurboFyClientError('Fetch API indisponível no runtime', {
      code: 'TURBOFY_RUNTIME_ERROR',
    });
  }

  return {
    async createPixCharge(input) {
      const config = readEnvConfig(env);
      const endpointUrl = buildUrl(config.baseUrl, config.pixPath);

      const body = {
        amountCents: input.amountCents,
        description: input.description,
        externalRef: input.externalRef,
        webhook_url: config.webhookUrl,
        webhook_secret: config.webhookSecret,
        metadata: input.metadata || {},
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      let response;
      try {
        response = await fetchImpl(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': config.clientId,
            'X-Client-Secret': config.clientSecret,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (error) {
        const timeoutError = error instanceof Error && error.name === 'AbortError';

        throw new TurboFyClientError(
          timeoutError
            ? 'Tempo limite excedido na criação do Pix TurboFy'
            : 'Erro de rede ao criar cobrança Pix TurboFy',
          {
            code: timeoutError ? 'TURBOFY_TIMEOUT' : 'TURBOFY_NETWORK_ERROR',
            cause: error,
          },
        );
      } finally {
        clearTimeout(timeout);
      }

      const payload = await parseResponsePayload(response);

      if (!response.ok) {
        throw new TurboFyClientError('TurboFy retornou erro HTTP na criação do Pix', {
          code: 'TURBOFY_HTTP_ERROR',
          httpStatus: response.status,
          payload,
        });
      }

      return {
        httpStatus: response.status,
        payload,
      };
    },
  };
}
