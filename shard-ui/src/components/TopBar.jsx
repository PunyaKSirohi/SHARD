import React from 'react';

export default function TopBar({ title = '' }) {
  return (
    <header style={{
      height: 56,
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg)', border: '1.5px solid var(--border)',
          borderRadius: 8, padding: '6px 12px', gap: 8,
        }}>
          <span style={{ color: 'var(--hint)', fontSize: 13 }}>⌕</span>
          <input placeholder="Search vaults..." style={{
            border: 'none', background: 'transparent', fontSize: 13,
            color: 'var(--text)', outline: 'none', width: 160,
            fontFamily: 'DM Sans, sans-serif',
          }} />
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: 'var(--muted)' }}>🔔</button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>R</div>
      </div>
    </header>
  );
}