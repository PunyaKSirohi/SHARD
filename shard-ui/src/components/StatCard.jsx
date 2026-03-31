import React from 'react';

export default function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--hint)' }}>{sub}</div>}
    </div>
  );
}