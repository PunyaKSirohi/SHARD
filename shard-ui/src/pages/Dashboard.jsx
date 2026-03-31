import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import NodeGrid from '../components/NodeGrid';
import VaultTable from '../components/VaultTable';
import { getAllNodeStatuses, listVaults } from '../api/vaultApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [loadingNodes, setLoadingNodes] = useState(true);
  const [loadingVaults, setLoadingVaults] = useState(true);

  useEffect(() => {
    getAllNodeStatuses().then(setNodes).finally(() => setLoadingNodes(false));
    listVaults()
      .then(data => setVaults(data.map(v => ({ ...v, status: 'sealed', k: 3, n: 5, nodes_written: 5 }))))
      .finally(() => setLoadingVaults(false));
  }, []);

  const onlineCount = nodes.filter(n => n.online).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard icon="⬡" label="Total Vaults"  value={loadingVaults ? '…' : vaults.length} sub="across all nodes" />
        <StatCard icon="◈" label="Active Nodes"  value={loadingNodes ? '…' : `${onlineCount} / 5`} sub="health checked" />
        <StatCard icon="⅄" label="Avg Threshold" value="3/5" sub="shares needed" />
        <StatCard icon="🔐" label="Secured Since" value="12 Mar" sub="2026" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Node Health</span>
          <button className="btn btn-secondary" onClick={() => navigate('/nodes')}>View All</button>
        </div>
        {loadingNodes
          ? <div style={{ color: 'var(--hint)', fontSize: 13 }}>Pinging nodes…</div>
          : <NodeGrid nodes={nodes} />}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Vaults</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/vaults')}>View All</button>
            <button className="btn btn-primary"   onClick={() => navigate('/create')}>+ Create</button>
          </div>
        </div>
        {loadingVaults
          ? <div style={{ color: 'var(--hint)', fontSize: 13 }}>Loading vaults…</div>
          : <VaultTable vaults={vaults.slice(0, 3)} onUnseal={(id) => navigate(`/unseal?vault_id=${id}`)} />}
      </div>
    </div>
  );
}