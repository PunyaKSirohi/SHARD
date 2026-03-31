import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: wire up real auth
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Polygon mesh background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mesh" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0 L80 40 L40 80 Z" fill="none" stroke="#000000" strokeWidth="1"/>
            <path d="M40 0 L80 0 L80 40 Z" fill="none" stroke="#000000" strokeWidth="1"/>
            <path d="M0 40 L0 80 L40 80 Z" fill="none" stroke="#000000" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" />
      </svg>

      {/* Card */}
      <div className="card" style={{
        width: 420,
        padding: '40px 36px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src={logo} alt="SHARD" style={{ width: 34, height: 34 }} />
          <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.5px' }}>S.H.A.R.D.</div>
          <div style={{ fontSize: 12, color: 'var(--hint)', marginTop: 4 }}>
            Your secrets, shattered. Never stolen.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--hint)', fontSize: 14,
                }}
              >{showPass ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: 8, padding: '10px 16px', fontSize: 14 }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--hint)' }}>
          Don't have an account?{' '}
          <span style={{ color: 'var(--ocean)', cursor: 'pointer', fontWeight: 500 }}>
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}