import React from 'react';

const styles = {
  sealed:   { background: '#E8FAF7', color: '#1a9e7a' },
  unsealed: { background: '#E8F4FB', color: '#1B6CA8' },
  online:   { background: '#E8FAF7', color: '#1a9e7a' },
  offline:  { background: '#FDE8E8', color: '#E05555' },
  warn:     { background: '#FFF4E0', color: '#c27c00' },
};

export default function Badge({ type = 'sealed', children }) {
  return (
    <span style={{
      ...styles[type],
      borderRadius: 20,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 500,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {children ?? type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}