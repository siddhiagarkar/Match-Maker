// components/chat/ChatHeader.tsx
import React from 'react';

type Props = {
  onBack?: () => void;
};

export const ChatHeader: React.FC<Props> = ({ onBack }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.25rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '1.5rem',
            lineHeight: 1,
          }}
        >
          ←
        </button>
      )}
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>My Tickets</div>
      </div>
    </div>
  </div>
);
