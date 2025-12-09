// components/chat/ChatPane.tsx
import React from 'react';

export type Message = {
  _id: string;
  conversation: string;        // ObjectId as string
  sender: string;              // ObjectId as string (User)
  content: string;
  createdAt: string;           // ISO date string
};


type HeaderProps = {
  ticketCode?: string;
  domain?: string;
  subDomain?: string;
  subject?: string;
  clientName?: string;
  priority?: string;
  resolution?: boolean
  onResolve?: () => void;
};

export const ChatPaneHeader: React.FC<HeaderProps> = ({
  ticketCode,
  domain,
  subDomain,
  subject,
  clientName,
  priority,
  resolution,
  onResolve
}) => (
  <div
    style={{
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(90deg,#eff6ff,#eef2ff)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          background: '#111827',
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
        }}
      >
        {clientName?.[0]?.toUpperCase() || '?'}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{clientName || 'Client'}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
          {ticketCode} • {domain} • {subDomain} • {priority} • {subject} 
        </div>
      </div>
    </div>
    {onResolve && (
      <button
        onClick={onResolve}
        style={{
          padding: '0.6rem 1.4rem',
          borderRadius: 999,
          border: 'none',
          background: '#16a34a',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Resolve Ticket
      </button>
    )}
  </div>
);

type MessagesProps = {
  messages: Message[];
  currentUserId?: string;
};

export const ChatMessages: React.FC<MessagesProps> = ({ messages, currentUserId }) => (
  <div
    className="chat-messages"
    style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f9fafb' }}
  >
    {messages.map((m) => {
      const isMe = String(m.sender) === String(currentUserId);
      let lastDate: string | null = null;
      return (
              <div
        key={m._id}
        style={{
          display: 'flex',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '70%',
            background: isMe ? '#2563eb' : '#e5e7eb',
            color: isMe ? '#fff' : '#111827',
            padding: '0.6rem 0.9rem',
            borderRadius: 18,
            fontSize: 14,
          }}
        >
          <div>{m.content}</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              opacity: 0.7,
              textAlign: isMe ? 'right' : 'left',
            }}
          >
            {m.createdAt &&
              new Date(m.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </div>
        </div>
      </div>

      );
    })}
  </div>
);

type InputProps = {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
};

export const ChatInputBar: React.FC<InputProps> = ({ value, disabled, onChange, onSend }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSend();
    }}
    style={{
      padding: '0.9rem 1.5rem',
      borderTop: '1px solid #e5e7eb',
      background: '#fff',
      display: 'flex',
      gap: '0.8rem',
      alignItems: 'center',
    }}
  >
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type a message…"
      style={{
        flex: 1,
        borderRadius: 999,
        border: '1px solid #d1d5db',
        padding: '0.65rem 1rem',
        fontSize: 14,
      }}
    />
    <button
      type="submit"
      disabled={disabled || !value.trim()}
      style={{
        borderRadius: 999,
        border: 'none',
        padding: '0.6rem 1.25rem',
        background: disabled ? '#d1d5db' : '#2563eb',
        color: '#fff',
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      Send
    </button>
  </form>
);
