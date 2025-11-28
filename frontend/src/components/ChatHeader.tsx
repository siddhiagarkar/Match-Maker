// components/chat/ChatHeader.tsx
import React, { use } from 'react';

type Props = {
  onBack?: () => void;
  title: string;
};

export const ChatHeader: React.FC<Props> = ({ onBack, title }) => (
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
        <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>
          {title}
        </div>
      </div>
    </div>
  </div>
);
