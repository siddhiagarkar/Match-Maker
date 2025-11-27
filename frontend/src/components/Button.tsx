// components/Button.tsx
import React from 'react';

interface ActionButtonProps {
    icon?: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
    style?: React.CSSProperties;
    variant?: 'primary' | 'default' | 'red';
    disabled?: boolean;
}

const colors = {
    primary: {
        background: "#fff", border: "1px solid #e5e7eb", color: "#222"
    },
    red: {
        background: "#fff", border: "1px solid #e5e7eb", color: "#e53e3e"
    },
    default: {
        background: "#fff", border: "1px solid #e5e7eb", color: "#444"
    }
};

const Button: React.FC<ActionButtonProps> = ({ icon, children, onClick, style, variant = 'default', disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: colors[variant].background,
        border: colors[variant].border,
        borderRadius: 8,
        padding: "8px 18px",
        color: colors[variant].color,
        fontWeight: 500,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: "0 1px 5px #f3f4f6",
        ...style
    }}>
        {icon && <span>{icon}</span>}
        {children}
    </button>
);
export default Button;
