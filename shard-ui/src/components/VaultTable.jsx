import React from 'react';
import Badge from './Badge';

export default function VaultTable({ vaults = [], onUnseal }) {
  if (!vaults.length) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--hint)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⬡</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>No vaults yet</div>
      <div style={{ fontSize: 12 }}>Create your first secret to get started</div>
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Vault ID', 'Name', 'Created', 'Threshold', 'Nodes', 'Status', 'Actions'].map(h => (
              <th key={h} style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--hint)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vaults.map((v) => (
            <tr key={v.vault_id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--blue)' }}>
                {v.vault_id}
              </td>
              <td style={{ padding: '12px', fontWeight: 500 }}>{v.name ?? '—'}</td>
              <td style={{ padding: '12px', color: 'var(--muted)' }}>{v.created ?? '—'}</td>
              <td style={{ padding: '12px', color: 'var(--muted)' }}>{v.k}/{v.n}</td>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: i < (v.nodes_written ?? 0) ? 'var(--teal)' : 'var(--border)',
                    }} />
                  ))}
                </div>
              </td>
              <td style={{ padding: '12px' }}>
                <Badge type={v.status === 'sealed' ? 'sealed' : 'unsealed'} />
              </td>
              <td style={{ padding: '12px' }}>
                {v.status === 'sealed' && (
                  <button className="btn btn-secondary" onClick={() => onUnseal?.(v.vault_id)}>
                    Unseal
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}