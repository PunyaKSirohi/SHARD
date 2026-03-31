import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShardVisualizer from '../components/ShardVisualizer';
import { unsealVault, getAllNodeStatuses } from '../api/vaultApi';

const AUTO_HIDE_SECONDS = 30;

export default function UnsealPage() {
  const [searchParams] = useSearchParams();
  const [vaultId, setVaultId]     = useState(searchParams.get('vault_id') || '');
  const [nodes, setNodes]         = useState([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [nodesChecked, setNodesChecked] = useState(false);
  const [secret, setSecret]       = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_HIDE_SECONDS);
  const [unsealing, setUnsealing] = useState(false);
  const [error, setError]         = useState('');
  const timerRef = useRef(null);

  const onlineCount = nodes.filter(n => n.online).length;
  // For demo: assume K=3. In production, fetch from vault metadata.
  const K = 3;
  const canReconstruct = onlineCount >= K;

  const checkNodes = async () => {
    setLoadingNodes(true);
    setNodesChecked(false);
    setError('');
    try {
      const result = await getAllNodeStatuses();
      setNodes(result);
      setNodesChecked(true);
    } catch {
      setError('Failed to reach nodes.');
    } finally {
      setLoadingNodes(false);
    }
  };

  const handleUnseal = async () => {
    setUnsealing(true);
    setError('');
    try {
      const res = await unsealVault({ vault_id: vaultId });
      setSecret(res.secret);
      setShowSecret(true);
      setCountdown(AUTO_HIDE_SECONDS);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to unseal. Check vault ID and node availability.');
    } finally {
      setUnsealing(false);
    }
  };

  // Auto-hide countdown
  useEffect(() => {
    if (!showSecret) return;
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); setShowSecret(false); setSecret(''); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [showSecret]);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Vault ID Input */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Vault ID</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input input-mono"
            placeholder="shrd_xxxxxxxx"
            value={vaultId}
            onChange={e => { setVaultId(e.target.value); setNodesChecked(false); setSecret(''); }}
            style={{ flex: 1, fontFamily: 'JetBrains Mono' }}
          />
          <button
            className="btn btn-primary"
            onClick={checkNodes}
            disabled={!vaultId || loadingNodes}
          >
            {loadingNodes ? 'Checking…' : 'Load'}
          </button>
        </div>
      </div>

      {/* Node Status */}
      {nodesChecked && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            Node Status —{' '}
            <span style={{ color: canReconstruct ? 'var(--teal)' : 'var(--danger)', fontWeight: 700 }}>
              {onlineCount} of 5 online
            </span>
          </div>

          {/* Shard progress */}
          <div style={{ marginBottom: 20 }}>
            <ShardVisualizer n={5} k={Math.min(onlineCount, 5)} />
          </div>

          {/* Progress bar */}
          <div style={{ background: 'var(--border)', borderRadius: 20, height: 8, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(onlineCount / 5) * 100}%`,
              background: canReconstruct ? 'var(--grad)' : 'var(--warn)',
              borderRadius: 20,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {canReconstruct
              ? `✅ Quorum reached — ${onlineCount} shards available (need ${K})`
              : `⚠️ Need at least ${K} nodes online — only ${onlineCount} reachable`
            }
          </div>
        </div>
      )}

      {/* Reconstruct Button */}
      {nodesChecked && (
        <button
          className="btn btn-primary"
          onClick={handleUnseal}
          disabled={!canReconstruct || unsealing || !!secret}
          style={{ padding: '12px 16px', fontSize: 14 }}
        >
          {unsealing ? 'Reconstructing…' : '🔓 Reconstruct Secret'}
        </button>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#FDE8E8', color: 'var(--danger)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Revealed Secret */}
      {showSecret && secret && (
        <div className="card" style={{ border: '1.5px solid var(--teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>🔓 Secret Revealed</span>
            <span style={{ fontSize: 12, color: 'var(--hint)' }}>
              Auto-hides in {countdown}s
            </span>
          </div>

          {/* Countdown bar */}
          <div style={{ background: 'var(--border)', borderRadius: 20, height: 4, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(countdown / AUTO_HIDE_SECONDS) * 100}%`,
              background: 'var(--teal)',
              borderRadius: 20,
              transition: 'width 1s linear',
            }} />
          </div>

          <div style={{
            background: 'var(--bg)', borderRadius: 8, padding: '12px 14px',
            fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text)',
            wordBreak: 'break-all', marginBottom: 12,
          }}>
            {secret}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(secret)}>
              📋 Copy
            </button>
            <button className="btn btn-danger" onClick={() => { setShowSecret(false); setSecret(''); }}>
              Hide Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}