import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const sealVault = async ({ vault_id, secret, name = '' }) => {
  const res = await axios.post(`${BASE_URL}/api/vault/seal`, { vault_id, secret, name });
  return res.data;
};

export const unsealVault = async ({ vault_id }) => {
  const res = await axios.post(`${BASE_URL}/api/vault/unseal`, { vault_id });
  return res.data; // { vault_id, secret, status }
};

export const checkNode = async (nodeIndex) => {
  const port = 5000 + nodeIndex;
  try {
    const res = await axios.get(`http://localhost:${port}/health`, { timeout: 3000 });
    return { node: nodeIndex, port, ...res.data, online: true };
  } catch {
    return { node: nodeIndex, port, online: false, status: 'offline' };
  }
};

export const getAllNodeStatuses = async () => {
  return Promise.all([1, 2, 3, 4, 5].map(checkNode));
};

export async function listVaults() {
  const res = await fetch(`${BASE_URL}/api/vault/list`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch');
  return data.vaults;
}