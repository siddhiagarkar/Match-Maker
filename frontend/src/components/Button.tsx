import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button {...props} style={{ padding: '0.5rem 1.5rem', marginTop: '0.5rem' }}>
        {props.children}
    </button>
);

export default Button;
