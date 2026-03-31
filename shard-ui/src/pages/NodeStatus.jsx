import React, { useEffect, useState, useRef } from 'react';
import Badge from '../components/Badge';
import { getAllNodeStatuses } from '../api/vaultApi';

const NODE_ANGLES = [270, 342, 54, 126, 198];
const CX = 200, CY = 200, R = 130;

function toXY(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

export default function NodeStatus() {
  const [nodes, setNodes]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const intervalRef = useRef(null);

  const fetchNodes = async () => {
    const result = await getAllNodeStatuses();
    setNodes(result);
    setLoading(false);
  };
  useEffect(() => {
    (async () => { await fetchNodes(); })();
    intervalRef.current = setInterval(fetchNodes, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const positions = NODE_ANGLES.map(toXY);
  const selectedNode = nodes[selected - 1] ?? null;

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/* Polygon Mesh SVG */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, alignSelf: 'flex-start' }}>Network Mesh</div>

        {loading
          ? <div style={{ color: 'var(--hint)', fontSize: 13, padding: 40 }}>Pinging nodes…</div>
          : (
          <svg width="400" height="400" viewBox="0 0 400 400">
            {/* Connection lines */}
            {positions.map((a, i) =>
              positions.slice(i + 1).map((b, j) => {
                const ni = nodes[i];
                const nj = nodes[i + j + 1];
                const bothOnline = ni?.online && nj?.online;
                return (
                  <line key={`${i}-${j}`}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={bothOnline ? '#2EC4A0' : '#E05555'}
                    strokeWidth={bothOnline ? 1 : 1}
                    strokeDasharray={bothOnline ? 'none' : '5,4'}
                    strokeOpacity={bothOnline ? 0.3 : 0.4}
                  />
                );
              })
            )}

            {/* Nodes */}
            {positions.map((pos, i) => {
              const node = nodes[i];
              const isOnline = node?.online;
              const isSelected = selected === i + 1;
              return (
                <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelected(i + 1)}>
                  {/* Glow */}
                  {isOnline && (
                    <circle cx={pos.x} cy={pos.y} r={28}
                      fill="rgba(46,196,160,0.12)"
                      stroke="rgba(46,196,160,0.2)"
                      strokeWidth={1}
                    />
                  )}
                  {/* Main circle */}
                  <circle cx={pos.x} cy={pos.y} r={22}
                    fill={isSelected ? '#1B6CA8' : '#fff'}
                    stroke={isOnline ? '#2EC4A0' : '#E05555'}
                    strokeWidth={isSelected ? 0 : 2}
                    strokeDasharray={isOnline ? 'none' : '4,3'}
                  />
                  {/* Label */}
                  <text x={pos.x} y={pos.y - 4} textAnchor="middle"
                    fontSize="10" fontWeight="700" fontFamily="DM Sans"
                    fill={isSelected ? '#fff' : '#0F1E2D'}>
                    Node
                  </text>
                  <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                    fontSize="11" fontWeight="700" fontFamily="JetBrains Mono"
                    fill={isSelected ? '#fff' : '#1B6CA8'}>
                    {String(i + 1).padStart(2, '0')}
                  </text>
                  {/* Status dot */}
                  <circle cx={pos.x + 16} cy={pos.y - 16} r={5}
                    fill={isOnline ? '#2EC4A0' : '#E05555'}
                  />
                </g>
              );
            })}
          </svg>
        )}

        <div style={{ fontSize: 11, color: 'var(--hint)' }}>
          Auto-refreshes every 5s · Click a node for details
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Online',  value: nodes.filter(n => n.online).length, color: 'var(--teal)' },
            { label: 'Offline', value: nodes.filter(n => !n.online).length, color: 'var(--danger)' },
            { label: 'Total',   value: nodes.length, color: 'var(--blue)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Node list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {nodes.map((node, i) => (
            <div key={node.node}
              onClick={() => setSelected(node.node)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: i < nodes.length - 1 ? '1px solid var(--border)' : 'none',
                background: selected === node.node ? '#F0FAFB' : '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: node.online ? '#E8FAF7' : '#FDE8E8',
                  border: `2px solid ${node.online ? 'var(--teal)' : 'var(--danger)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: node.online ? 'var(--teal)' : 'var(--danger)',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {String(node.node).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Node-{String(node.node).padStart(2, '0')}</div>
                  <div style={{ fontSize: 11, color: 'var(--hint)', fontFamily: 'JetBrains Mono' }}>
                    :500{node.node}
                  </div>
                </div>
              </div>
              <Badge type={node.online ? 'online' : 'offline'} />
            </div>
          ))}
        </div>

        {/* Selected node detail */}
        {selectedNode && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
              Node-{String(selectedNode.node).padStart(2, '0')} Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Port',    value: `500${selectedNode.node}` },
                { label: 'Status',  value: selectedNode.online ? 'Online' : 'Offline' },
                { label: 'Health',  value: selectedNode.status ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 500, fontFamily: 'JetBrains Mono', fontSize: 12 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedNode && (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--hint)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>◈</div>
            <div style={{ fontSize: 13 }}>Click a node in the mesh to see details</div>
          </div>
        )}
      </div>
    </div>
  );
}