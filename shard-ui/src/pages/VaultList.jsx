import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VaultTable from '../components/VaultTable';
import Badge from '../components/Badge';
import { listVaults } from '../api/vaultApi';

const FILTERS = ['All', 'Sealed', 'Unsealed'];

export default function VaultList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listVaults()
      .then(data => setVaults(data.map(v => ({ ...v, status: 'sealed', k: 3, n: 5, nodes_written: 5 }))))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vaults.filter(v => {
    if (filter === 'All') return true;
    return v.status === filter.toLowerCase();
  });

  const sealedCount   = vaults.filter(v => v.status === 'sealed').length;
  const unsealedCount = vaults.filter(v => v.status === 'unsealed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 8, padding: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: filter === f ? 600 : 400,
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? 'var(--text)' : 'var(--muted)',
              boxShadow: filter === f ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
            }}>
              {f}
              <span style={{ marginLeft: 6, fontSize: 11, color: filter === f ? 'var(--teal)' : 'var(--hint)', fontWeight: 600 }}>
                {f === 'All' ? vaults.length : f === 'Sealed' ? sealedCount : unsealedCount}
              </span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create')}>+ New Secret</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <div style={{ padding: 24, color: 'var(--hint)', fontSize: 13 }}>Loading vaults…</div>
          : <VaultTable vaults={filtered} onUnseal={(id) => navigate(`/unseal?vault_id=${id}`)} />}
      </div>

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--hint)', paddingLeft: 4 }}>
          <span>Showing {filtered.length} vault{filtered.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge type="sealed" />{sealedCount} sealed</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Badge type="unsealed" />{unsealedCount} unsealed</span>
        </div>
      )}
    </div>
  );
}