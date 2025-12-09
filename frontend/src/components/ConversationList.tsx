import React, { type ReactNode, useMemo, useState } from 'react';
import type { User } from '../types/User';

export type ConversationListItem = {
  _id: string;
  code?: string;
  ticket: {
    subDomain: ReactNode;
    masterDomain: ReactNode;
    subject: string;
    priority: ReactNode;
    status: 'accepted' | 'resolved';
  };
  participants: User[];
  lastMessage?: string;
  updatedAt?: string;
};

type Props = {
  items: ConversationListItem[];
  activeId: string | null;
  currentUserId?: string;
  onSelect: (id: string) => void;
  disclaimer: string;
  msg_noTickets: string;
};

export const ConversationList: React.FC<Props> = ({
  items,
  activeId,
  currentUserId,
  onSelect,
  disclaimer,
  msg_noTickets,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  const filteredItems = useMemo(
  () =>
    items.filter((c) =>
      activeTab === 'pending'
        ? c.ticket.status === 'accepted'
        : c.ticket.status === 'resolved'
    ),
  [items, activeTab]
);

  return (
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
      {/* Header + tabs */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{disclaimer}</div>

        <div
          style={{
            marginTop: 10,
            display: 'inline-flex',
            borderRadius: 999,
            background: '#f3f4f6',
            padding: 4,
            gap: 4,
          }}
        >
          {(['pending', 'resolved'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#111827' : '#6b7280',
                  boxShadow: isActive ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                }}
              >
                {tab === 'pending' ? 'Pending' : 'Resolved'}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', paddingRight: 4 }}>
        {filteredItems.map((c) => {
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
                    {c.ticket.masterDomain} <br />
                    {c.ticket.subDomain} <br />
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
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
            {msg_noTickets}
          </div>
        )}
      </div>
    </div>
  );
}