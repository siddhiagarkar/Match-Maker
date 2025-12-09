// components/TicketFilters.tsx
import React from 'react';

export type TicketFilterState = {
  client: string | 'all';
  domain: string | 'all';   // masterDomain
  priority: string | 'all';
  handler: string | 'all';
};

type Option = { label: string; value: string | 'all' };

type Props = {
  value: TicketFilterState;
  onChange: (next: TicketFilterState) => void;
  clientOptions: Option[];
  domainOptions: Option[];
  priorityOptions: Option[];
  handlerOptions: Option[];
};

const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
  fontSize: 13,
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: 13,
  outline: 'none',
};

export const TicketFilters: React.FC<Props> = ({
  value,
  onChange,
  clientOptions,
  domainOptions,
  priorityOptions,
  handlerOptions,
}) => {
  const handleChange = (key: keyof TicketFilterState, nextVal: string | 'all') => {
    onChange({ ...value, [key]: nextVal });
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      {/* Filters label pill */}
      <div style={{ ...pillBase, background: '#f3f4f6' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Filters</span>
      </div>

      {/* Client */}
      <div style={pillBase}>
        <span style={{ color: '#6b7280' }}>Client</span>
        <select
          value={value.client}
          onChange={(e) => handleChange('client', e.target.value as any)}
          style={selectStyle}
        >
          {clientOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category / Domain */}
      <div style={pillBase}>
        <span style={{ color: '#6b7280' }}>Category</span>
        <select
          value={value.domain}
          onChange={(e) => handleChange('domain', e.target.value as any)}
          style={selectStyle}
        >
          {domainOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div style={pillBase}>
        <span style={{ color: '#6b7280' }}>Priority</span>
        <select
          value={value.priority}
          onChange={(e) => handleChange('priority', e.target.value as any)}
          style={selectStyle}
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Handler */}
      <div style={pillBase}>
        <span style={{ color: '#6b7280' }}>Handler</span>
        <select
          value={value.handler}
          onChange={(e) => handleChange('handler', e.target.value as any)}
          style={selectStyle}
        >
          {handlerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
