import React from "react";

type DropdownProps = {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  disabled,
  required = false,
  style,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && (
      <label
        style={{
          fontWeight: 500,
          fontSize: 13,
          color: "#4b5563",
        }}
      >
        {label}
      </label>
    )}
    <div
      style={{
        position: "relative",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: disabled ? "#f3f4f6" : "#f9fafb",
        padding: "0.4rem 0.9rem",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          color: value ? "#111827" : "#9ca3af",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          paddingRight: 24,
        }}
      >
        <option value="" disabled>
          {label ? `Select ${label.toLowerCase()}` : "Select an option"}
        </option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Chevron indicator */}
      <span
        style={{
          position: "absolute",
          right: 12,
          pointerEvents: "none",
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "6px solid #9ca3af",
        }}
      />
    </div>
  </div>
);

export default Dropdown;
