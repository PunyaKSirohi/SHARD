import React from 'react';

export default function ShardVisualizer({ n = 5, k = 3 }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: i < k ? 'var(--grad)' : 'var(--bg)',
            border: i < k ? 'none' : '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: i < k ? '#fff' : 'var(--hint)',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            {i + 1}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        Any <strong style={{ color: 'var(--teal)' }}>{k}</strong> of{' '}
        <strong>{n}</strong> shards can reconstruct this secret
      </div>
    </div>
  );
}