// components/chat/ConversationList.tsx
import React, { type ReactNode } from 'react';
import type { User } from '../types/User';

export type ConversationListItem = {
  _id: string;
  code?: string;
  ticket: {
    subDomain: ReactNode;
    masterDomain: ReactNode; 
    subject: string; 
    priority: ReactNode;
    status: 'accepted' 
};
  participants: User[];
  lastMessage?: string;
  updatedAt?: string;
};

type Props = {
  items: ConversationListItem[]; // already only accepted
  activeId: string | null;
  currentUserId?: string;
  onSelect: (id: string) => void;
  disclaimer: string
};

export const ConversationList: React.FC<Props> = ({
  items,
  activeId,
  currentUserId,
  onSelect,
  disclaimer
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 18,
      padding: '1.25rem 1rem',
      boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
      height: '90%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
        {disclaimer}
      </div>
    </div>
    <div style={{ overflowY: 'auto', paddingRight: 4 }}>
      {items.map((c) => {
        const other = c.participants.find((p) => p._id !== currentUserId);
        const isActive = c._id === activeId;
        return (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            style={{
              width: '100%',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              padding: 0,
              marginBottom: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                borderRadius: 18,
                padding: '0.9rem 1rem',
                background: isActive ? '#e5f0ff' : '#f9fafb',
                border: isActive ? '1px solid #93c5fd' : '1px solid transparent',
                display: 'flex',
                gap: '0.9rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '999px',
                  background: '#1d4ed8',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {other?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {c.code || 'TKT'} • {other?.name || 'Unknown'}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#4b5563',
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.ticket.masterDomain} <br></br>
                  {c.ticket.subDomain} <br></br>
                  {c.ticket.subject}
                </div>
                {c.updatedAt && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    {new Date(c.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  borderRadius: 999,
                  padding: '3px 10px',
                  background: '#ecfdf3',
                  color: '#0f766e',
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}
              >
                {c.ticket.priority}
              </span>
            </div>
          </button>
        );
      })}
      {items.length === 0 && (
        <div style={{ fontSize: 14, color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>
          No accepted conversations.
        </div>
      )}
    </div>
  </div>
);
