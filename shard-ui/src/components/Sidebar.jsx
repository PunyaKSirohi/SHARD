import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const nav = [
  { to: '/dashboard',  icon: '⬡',  label: 'Dashboard' },
  { to: '/vaults',     icon: '🔐', label: 'My Vaults' },
  { to: '/create',     icon: '+',  label: 'Create Secret' },
  { to: '/unseal',     icon: '🔓', label: 'Unseal Vault' },
  { to: '/nodes',      icon: '◈',  label: 'Node Status' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="SHARD" style={{ width: 34, height: 34 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.5px' }}>S.H.A.R.D.</div>
            <div style={{ fontSize: 10, color: 'var(--hint)' }}>Secret Vault</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {nav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            color: isActive ? 'var(--teal)' : 'var(--muted)',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 600 : 400,
            background: isActive ? '#F0FAFB' : 'transparent',
            borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--hint)',
      }}>
        v1.0.0 · Shamir SSS · AES-256-GCM
      </div>
    </aside>
  );
}