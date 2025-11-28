// components/chat/ChatLayout.tsx
import React from 'react';

export const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
      {children}
    </div>
  </div>
);

export const ChatShell: React.FC<{ sidebar: React.ReactNode; content: React.ReactNode }> = ({
  sidebar,
  content,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: '1.25rem',
      height: 'calc(100vh - 200px)',
    }}
  >
    {sidebar}
    {content}
  </div>
);
