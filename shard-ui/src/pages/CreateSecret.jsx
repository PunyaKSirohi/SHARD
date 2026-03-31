import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShardVisualizer from '../components/ShardVisualizer';
import { sealVault } from '../api/vaultApi';

const generateVaultId = () => 'shrd_' + Math.random().toString(36).slice(2, 10);

const STEPS = ['Secret Details', 'Threshold Config', 'Invite Shareholders'];

export default function CreateSecret() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vaultId] = useState(generateVaultId());
  const [name, setName]       = useState('');
  const [secret, setSecret]   = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [n, setN] = useState(5);
  const [k, setK] = useState(3);
  const [emails, setEmails]   = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const addEmail = () => {
    if (emailInput && !emails.includes(emailInput)) {
      setEmails(p => [...p, emailInput]);
      setEmailInput('');
    }
  };

  const handleSeal = async () => {
    setLoading(true);
    setError('');
    try {
      await sealVault({ vault_id: vaultId, secret, name, k, n });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to seal vault. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px 32px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Secret Sealed</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
          Vault ID:
        </div>
        <div className="mono" style={{
          background: 'var(--bg)', padding: '8px 16px',
          borderRadius: 8, fontSize: 13, color: 'var(--blue)',
          marginBottom: 24, display: 'inline-block',
        }}>{vaultId}</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          Shares distributed to {n} nodes. Any {k} can reconstruct.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/vaults')}>My Vaults</button>
          <button className="btn btn-primary"   onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: i <= step ? 'var(--grad)' : 'var(--border)',
                color: i <= step ? '#fff' : 'var(--hint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
              }}>{i + 1}</div>
              <div style={{
                fontSize: 11, fontWeight: i === step ? 600 : 400,
                color: i === step ? 'var(--teal)' : 'var(--hint)',
                whiteSpace: 'nowrap',
              }}>{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 18,
                background: i < step ? 'var(--teal)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card" style={{ padding: '28px 32px' }}>

        {/* Step 0 — Secret Details */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                Vault Name
              </label>
              <input className="input" placeholder="e.g. AWS Root Keys" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                Secret
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="input"
                  placeholder="Paste your secret here..."
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical', paddingRight: 40, fontFamily: showSecret ? 'JetBrains Mono' : 'inherit' }}
                />
                <button type="button" onClick={() => setShowSecret(p => !p)} style={{
                  position: 'absolute', right: 10, top: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--hint)', fontSize: 14,
                }}>{showSecret ? '🙈' : '👁'}</button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                Vault ID (auto-generated)
              </label>
              <div style={{
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 8, padding: '9px 12px',
                fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--blue)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {vaultId}
                <button type="button" onClick={() => navigator.clipboard.writeText(vaultId)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--hint)', fontSize: 13,
                }}>📋</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Threshold Config */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>
                  Total Shares (N)
                </label>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{n}</span>
              </div>
              <input type="range" min={2} max={10} value={n}
                onChange={e => { const val = Number(e.target.value); setN(val); if (k > val) setK(val); }}
                style={{ width: '100%', accentColor: 'var(--blue)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>
                  Threshold (K)
                </label>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{k}</span>
              </div>
              <input type="range" min={1} max={n} value={k}
                onChange={e => setK(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--teal)' }}
              />
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 20 }}>
              <ShardVisualizer n={n} k={k} />
            </div>
          </div>
        )}

        {/* Step 2 — Invite */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Optionally invite shareholders by email. Each gets one shard.
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="shareholder@email.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEmail()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={addEmail}>Add</button>
            </div>

            {emails.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {emails.map((email, i) => (
                  <div key={email} className="card" style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 14px',
                  }}>
                    <div>
                      <span style={{ fontSize: 13 }}>{email}</span>
                      <span style={{ fontSize: 11, color: 'var(--hint)', marginLeft: 8 }}>Shard #{i + 1}</span>
                    </div>
                    <button onClick={() => setEmails(p => p.filter(e => e !== email))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={{ background: '#FDE8E8', color: 'var(--danger)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button className="btn btn-secondary"
            onClick={() => step === 0 ? navigate('/dashboard') : setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {step < 2
            ? <button className="btn btn-primary"
                disabled={step === 0 && (!name || !secret)}
                onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            : <button className="btn btn-primary" onClick={handleSeal} disabled={loading}>
                {loading ? 'Sealing…' : '🔐 Seal Secret'}
              </button>
          }
        </div>

      </div>
    </div>
  );
}