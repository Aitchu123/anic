import { randomUUID } from 'node:crypto';
import { validateCheckoutOrderPayload } from './validation.js';

export const FIXED_AMOUNT_CENTS = 9000;

export const CHECKOUT_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const WEBHOOK_EVENT_TO_STATUS = {
  'charge.paid': CHECKOUT_STATUS.PAID,
  'charge.expired': CHECKOUT_STATUS.EXPIRED,
  'charge.cancelled': CHECKOUT_STATUS.CANCELLED,
};

const PROVIDER_STATUS_TO_STATUS = {
  PAID: CHECKOUT_STATUS.PAID,
  EXPIRED: CHECKOUT_STATUS.EXPIRED,
  CANCELLED: CHECKOUT_STATUS.CANCELLED,
  FAILED: CHECKOUT_STATUS.FAILED,
};

function nowIso() {
  return new Date().toISOString();
}

function createPublicId() {
  return randomUUID().replace(/-/g, '').slice(0, 16);
}

function normalizeProviderStatus(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toUpperCase();
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => typeof entry === 'string' && entry.trim())
    .map((entry) => entry.trim());
}

function toFiniteNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function parseDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return timestamp;
}

function evaluateProviderCreation(payload) {
  const providerStatus = normalizeProviderStatus(payload?.status);
  const chargeId = firstString(payload?.id);
  const responseAmountCents = toFiniteNumber(payload?.amountCents);
  const responseDescription = firstString(payload?.description);
  const providerCreatedAt = firstString(payload?.createdAt);

  const pixPayload = payload?.pix && typeof payload.pix === 'object' ? payload.pix : null;
  const qrCode = firstString(pixPayload?.qrCode);
  const copyPaste = firstString(pixPayload?.copyPaste);
  const expiresAt = firstString(pixPayload?.expiresAt);
  const expiresAtTs = parseDate(expiresAt);

  const webhookPayload = payload?.webhook && typeof payload.webhook === 'object' ? payload.webhook : null;
  const webhookEvents = toStringArray(webhookPayload?.events);

  const hasUsablePix = Boolean(copyPaste) && Boolean(expiresAtTs);
  const isExpiredByTime = Boolean(expiresAtTs && expiresAtTs <= Date.now());

  let status = CHECKOUT_STATUS.FAILED;

  if (providerStatus === 'PAID') {
    status = CHECKOUT_STATUS.PAID;
  } else if (providerStatus === 'EXPIRED' || isExpiredByTime) {
    status = CHECKOUT_STATUS.EXPIRED;
  } else if (providerStatus === 'CANCELLED') {
    status = CHECKOUT_STATUS.CANCELLED;
  } else if (providerStatus === 'FAILED') {
    status = CHECKOUT_STATUS.FAILED;
  } else if (hasUsablePix) {
    status = CHECKOUT_STATUS.PENDING_PAYMENT;
  }

  return {
    status,
    providerStatus,
    chargeId,
    hasUsablePix,
    qrCode,
    copyPaste,
    expiresAt,
    responseAmountCents,
    responseDescription,
    providerCreatedAt,
    webhookEvents,
    rawPayload: payload,
    shouldRetryAfterCreation:
      status === CHECKOUT_STATUS.EXPIRED || !hasUsablePix,
  };
}

function shouldApplyStatusTransition(currentStatus, targetStatus) {
  if (!targetStatus || currentStatus === targetStatus) {
    return false;
  }

  if (currentStatus === CHECKOUT_STATUS.PAID) {
    return false;
  }

  return true;
}

function isCurrentAttemptWebhook(order, parsed) {
  const currentChargeId = order?.provider?.chargeId || '';
  const currentExternalRef = order?.provider?.externalRef || '';

  if (!currentChargeId && !currentExternalRef) {
    return true;
  }

  if (!parsed.chargeId && !parsed.externalRef) {
    return true;
  }

  return (
    (parsed.chargeId && parsed.chargeId === currentChargeId) ||
    (parsed.externalRef && parsed.externalRef === currentExternalRef)
  );
}

function enrichPendingOrderWithExpiration(order, repository) {
  if (
    !order ||
    order.status !== CHECKOUT_STATUS.PENDING_PAYMENT ||
    !order.pix?.expiresAt
  ) {
    return order;
  }

  const expiresAtTs = parseDate(order.pix.expiresAt);
  if (!expiresAtTs || expiresAtTs > Date.now()) {
    return order;
  }

  return repository.update(order.publicId, (draft) => {
    draft.status = CHECKOUT_STATUS.EXPIRED;
    return draft;
  });
}

function extractOrderIdFromExternalRef(externalRef) {
  if (!externalRef) {
    return '';
  }

  const match = externalRef.match(/^anic:checkout:([^:]+):attempt:\d+$/i);
  if (!match) {
    return '';
  }

  return match[1] || '';
}

function extractWebhookData(payload) {
  const eventName = firstString(
    payload?.event,
    payload?.eventName,
    payload?.type,
    payload?.name,
    payload?.data?.event,
    payload?.data?.eventName,
    payload?.data?.type,
  ).toLowerCase();

  const providerStatus = normalizeProviderStatus(
    firstString(
      payload?.status,
      payload?.charge?.status,
      payload?.data?.status,
      payload?.data?.charge?.status,
    ),
  );

  const chargeId = firstString(
    payload?.chargeId,
    payload?.charge_id,
    payload?.id,
    payload?.charge?.id,
    payload?.data?.chargeId,
    payload?.data?.charge_id,
    payload?.data?.id,
    payload?.data?.charge?.id,
  );

  const externalRef = firstString(
    payload?.externalRef,
    payload?.external_ref,
    payload?.charge?.externalRef,
    payload?.charge?.external_ref,
    payload?.data?.externalRef,
    payload?.data?.external_ref,
    payload?.data?.charge?.externalRef,
    payload?.data?.charge?.external_ref,
  );

  const metadataOrderId = firstString(
    payload?.metadata?.orderId,
    payload?.metadata?.order_id,
    payload?.data?.metadata?.orderId,
    payload?.data?.metadata?.order_id,
    payload?.orderId,
    payload?.order_id,
    payload?.data?.orderId,
    payload?.data?.order_id,
  );

  return {
    eventName,
    providerStatus,
    chargeId,
    externalRef,
    metadataOrderId,
  };
}

export class CheckoutValidationError extends Error {
  constructor(details) {
    super('Dados do checkout inválidos');
    this.name = 'CheckoutValidationError';
    this.details = details;
  }
}

export class CheckoutNotFoundError extends Error {
  constructor(orderId) {
    super(`Pedido não encontrado: ${orderId}`);
    this.name = 'CheckoutNotFoundError';
    this.orderId = orderId;
  }
}

export class CheckoutStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CheckoutStateError';
  }
}

export function createCheckoutService({ repository, turbofyClient }) {
  async function createPixForOrder(publicId, maxAttempts) {
    let order = repository.getByPublicId(publicId);

    if (!order) {
      throw new CheckoutNotFoundError(publicId);
    }

    for (let cycle = 1; cycle <= maxAttempts; cycle += 1) {
      const attempt = (order.attempts || 0) + 1;
      const externalRef = `anic:checkout:${order.publicId}:attempt:${attempt}`;

      try {
        const providerResponse = await turbofyClient.createPixCharge({
          amountCents: FIXED_AMOUNT_CENTS,
          description: `Cadastro ANIC - Pedido ${order.publicId}`,
          externalRef,
          metadata: {
            orderId: order.publicId,
            source: 'checkout',
          },
        });

        const evaluated = evaluateProviderCreation(providerResponse.payload);

        order = repository.update(order.publicId, (draft) => {
          draft.status = evaluated.status;
          draft.attempts = attempt;
          draft.provider = {
            ...draft.provider,
            chargeId: evaluated.chargeId || draft.provider?.chargeId,
            amountCents: evaluated.responseAmountCents,
            description: evaluated.responseDescription || draft.provider?.description || null,
            createdAt: evaluated.providerCreatedAt || draft.provider?.createdAt || null,
            webhookEvents: evaluated.webhookEvents,
            rawStatus: evaluated.providerStatus || null,
            externalRef,
            lastResponse: evaluated.rawPayload,
            lastErrorCode: null,
            lastErrorMessage: null,
          };

          draft.pix = evaluated.qrCode || evaluated.copyPaste || evaluated.expiresAt
            ? {
                qrCode: evaluated.qrCode || '',
                copyPaste: evaluated.copyPaste || '',
                expiresAt: evaluated.expiresAt || '',
              }
            : undefined;

          if (evaluated.status === CHECKOUT_STATUS.PAID && !draft.paidAt) {
            draft.paidAt = nowIso();
          }

          return draft;
        });

        const shouldRetry = cycle === 1 && evaluated.shouldRetryAfterCreation;
        if (shouldRetry) {
          continue;
        }

        return order;
      } catch (error) {
        order = repository.update(order.publicId, (draft) => {
          draft.status = CHECKOUT_STATUS.FAILED;
          draft.attempts = attempt;
          draft.provider = {
            ...draft.provider,
            externalRef,
            lastErrorCode: error?.code || 'TURBOFY_UNKNOWN_ERROR',
            lastErrorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
            lastResponse: error?.payload || null,
          };
          return draft;
        });

        return order;
      }
    }

    return order;
  }

  return {
    async createOrder(payload) {
      const validation = validateCheckoutOrderPayload(payload);
      if (!validation.valid) {
        throw new CheckoutValidationError(validation.errors);
      }

      const createdAt = nowIso();

      const order = repository.create({
        id: randomUUID(),
        publicId: createPublicId(),
        status: CHECKOUT_STATUS.FAILED,
        amountCents: FIXED_AMOUNT_CENTS,
        customer: validation.customer,
        provider: {
          chargeId: undefined,
          amountCents: null,
          description: null,
          createdAt: null,
          webhookEvents: [],
          rawStatus: null,
          externalRef: null,
          lastResponse: null,
          lastErrorCode: null,
          lastErrorMessage: null,
          lastWebhookPayload: null,
        },
        pix: undefined,
        attempts: 0,
        paidAt: null,
        notifications: {
          paidEmailSentAt: null,
        },
        webhookEvents: [],
        createdAt,
        updatedAt: createdAt,
      });

      return createPixForOrder(order.publicId, 2);
    },

    getOrder(orderId) {
      const order = repository.getByPublicId(orderId);
      if (!order) {
        throw new CheckoutNotFoundError(orderId);
      }

      return enrichPendingOrderWithExpiration(order, repository);
    },

    async retryOrder(orderId) {
      const order = this.getOrder(orderId);

      if (order.status === CHECKOUT_STATUS.PAID) {
        throw new CheckoutStateError('Pedido já está pago');
      }

      return createPixForOrder(order.publicId, 2);
    },

    applyWebhook(payload) {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return {
          ok: false,
          applied: false,
          reason: 'INVALID_PAYLOAD',
        };
      }

      const parsed = extractWebhookData(payload);

      let order = null;

      if (parsed.chargeId) {
        order = repository.findByProviderChargeId(parsed.chargeId);
      }

      if (!order && parsed.externalRef) {
        order = repository.findByProviderExternalRef(parsed.externalRef);
      }

      if (!order && parsed.metadataOrderId) {
        order = repository.getByPublicId(parsed.metadataOrderId);
      }

      if (!order && parsed.externalRef) {
        const orderIdFromExternalRef = extractOrderIdFromExternalRef(parsed.externalRef);
        if (orderIdFromExternalRef) {
          order = repository.getByPublicId(orderIdFromExternalRef);
        }
      }

      if (!order) {
        return {
          ok: false,
          applied: false,
          reason: 'ORDER_NOT_FOUND',
          parsed,
        };
      }

      const nextStatusByEvent = WEBHOOK_EVENT_TO_STATUS[parsed.eventName] || null;
      const nextStatusByProvider = PROVIDER_STATUS_TO_STATUS[parsed.providerStatus] || null;
      const targetStatus = nextStatusByEvent || nextStatusByProvider;
      const currentAttemptWebhook = isCurrentAttemptWebhook(order, parsed);

      const previousStatus = order.status;
      let transitioned = false;

      order = repository.update(order.publicId, (draft) => {
        const receivedAt = nowIso();

        draft.provider = {
          ...draft.provider,
          chargeId: currentAttemptWebhook ? parsed.chargeId || draft.provider?.chargeId : draft.provider?.chargeId,
          externalRef: currentAttemptWebhook ? parsed.externalRef || draft.provider?.externalRef : draft.provider?.externalRef,
          rawStatus: currentAttemptWebhook ? parsed.providerStatus || draft.provider?.rawStatus || null : draft.provider?.rawStatus || null,
          lastWebhookPayload: payload,
        };

        if (!Array.isArray(draft.webhookEvents)) {
          draft.webhookEvents = [];
        }

        draft.webhookEvents.push({
          receivedAt,
          event: parsed.eventName || null,
          providerStatus: parsed.providerStatus || null,
          chargeId: parsed.chargeId || null,
          externalRef: parsed.externalRef || null,
        });

        if (draft.webhookEvents.length > 20) {
          draft.webhookEvents = draft.webhookEvents.slice(-20);
        }

        if (currentAttemptWebhook && shouldApplyStatusTransition(draft.status, targetStatus)) {
          draft.status = targetStatus;
          transitioned = true;
        }

        if (draft.status === CHECKOUT_STATUS.PAID && !draft.paidAt) {
          draft.paidAt = receivedAt;
        }

        return draft;
      });

      order = enrichPendingOrderWithExpiration(order, repository);

      return {
        ok: true,
        applied: true,
        transitioned,
        previousStatus,
        targetStatus: targetStatus || null,
        parsed,
        order,
      };
    },

    markPaidNotificationSent(orderId) {
      const order = repository.getByPublicId(orderId);
      if (!order) {
        throw new CheckoutNotFoundError(orderId);
      }

      return repository.update(order.publicId, (draft) => {
        draft.notifications = {
          ...draft.notifications,
          paidEmailSentAt: nowIso(),
        };

        return draft;
      });
    },

    toPublicOrder(order) {
      return {
        orderId: order.publicId,
        status: order.status,
        amountCents: order.amountCents,
        pix: order.pix
          ? {
              qrCode: order.pix.qrCode || '',
              copyPaste: order.pix.copyPaste || '',
              expiresAt: order.pix.expiresAt || '',
            }
          : null,
        paidAt: order.paidAt || null,
        attempts: order.attempts,
      };
    },
  };
}
