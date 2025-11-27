import React from "react";

type DropdownProps = {
    label?: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    style?: React.CSSProperties;
};

const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    value,
    onChange,
    disabled,
    required,
    style,
}) => (
    <div style={style}>
        {label && <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>}
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            style={{
                width: "100%",
                padding: "0.5rem 1rem",
                borderRadius: 5,
                border: "1px solid #b0b8c9",
                fontSize: "1rem",
                background: "#fff",
                marginTop: 3
            }}
        >
            <option value="" disabled>
                {label ? `Select ${label}` : "Select an option"}
            </option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export default Dropdown;
