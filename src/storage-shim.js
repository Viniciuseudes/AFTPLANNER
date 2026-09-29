// Substitui window.storage (API exclusiva do ambiente de artifacts do Claude)
// por uma implementação equivalente usando localStorage do navegador.
// Mesma assinatura de funções (get/set/delete/list), então o AFTPlanner.jsx
// funciona sem nenhuma edição.

function keyFor(key, shared) {
  return (shared ? 'aft_shared_' : 'aft_local_') + key;
}

window.storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(keyFor(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    localStorage.setItem(keyFor(key, shared), value);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    const existed = localStorage.getItem(keyFor(key, shared)) !== null;
    localStorage.removeItem(keyFor(key, shared));
    return { key, deleted: existed, shared };
  },

  async list(prefix = '', shared = false) {
    const fullPrefix = keyFor(prefix, shared);
    const pfx = shared ? 'aft_shared_' : 'aft_local_';
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) keys.push(k.slice(pfx.length));
    }
    return { keys, prefix, shared };
  },
};
