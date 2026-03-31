import React from 'react';
import Badge from './Badge';

export default function NodeGrid({ nodes = [] }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {nodes.map((node) => (
        <div key={node.node} className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '14px 18px',
          minWidth: 90,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: node.online ? '#E8FAF7' : '#FDE8E8',
            border: `2px solid ${node.online ? 'var(--teal)' : 'var(--danger)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            boxShadow: node.online ? '0 0 8px rgba(46,196,160,0.3)' : 'none',
            transition: 'all 0.3s',
          }}>
            ◈
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
            Node-{String(node.node).padStart(2, '0')}
          </div>
          <Badge type={node.online ? 'online' : 'offline'} />
        </div>
      ))}
    </div>
  );
}