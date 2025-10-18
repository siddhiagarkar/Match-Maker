import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

const Input: React.FC<Props> = ({ label, ...props }) => (
    <div style={{ marginBottom: "1rem" }}>
        <label>
            {label}<br />
            <input {...props} style={{ padding: '0.5rem', width: '90%' }} />
        </label>
    </div>
);

export default Input;
