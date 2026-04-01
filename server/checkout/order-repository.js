function clone(value) {
  return structuredClone(value);
}

export function createInMemoryOrderRepository() {
  const ordersByPublicId = new Map();
  const orderByChargeId = new Map();
  const orderByExternalRef = new Map();

  function reindex(order) {
    if (order?.provider?.chargeId) {
      orderByChargeId.set(order.provider.chargeId, order.publicId);
    }

    if (order?.provider?.externalRef) {
      orderByExternalRef.set(order.provider.externalRef, order.publicId);
    }
  }

  return {
    create(order) {
      const next = clone(order);
      ordersByPublicId.set(next.publicId, next);
      reindex(next);
      return clone(next);
    },

    getByPublicId(publicId) {
      const order = ordersByPublicId.get(publicId);
      return order ? clone(order) : null;
    },

    update(publicId, updater) {
      const current = ordersByPublicId.get(publicId);
      if (!current) {
        return null;
      }

      const draft = clone(current);
      const updated = updater ? updater(draft) || draft : draft;
      updated.updatedAt = new Date().toISOString();

      ordersByPublicId.set(publicId, updated);
      reindex(updated);

      return clone(updated);
    },

    findByProviderChargeId(chargeId) {
      if (!chargeId) {
        return null;
      }

      const publicId = orderByChargeId.get(chargeId);
      if (!publicId) {
        return null;
      }

      const order = ordersByPublicId.get(publicId);
      return order ? clone(order) : null;
    },

    findByProviderExternalRef(externalRef) {
      if (!externalRef) {
        return null;
      }

      const publicId = orderByExternalRef.get(externalRef);
      if (!publicId) {
        return null;
      }

      const order = ordersByPublicId.get(publicId);
      return order ? clone(order) : null;
    },
  };
}
