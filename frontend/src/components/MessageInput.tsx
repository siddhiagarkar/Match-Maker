import React from 'react';

type Props = {
    value: string;
    onChange: (val: string) => void;
    onSend: () => void;
};

const MessageInput: React.FC<Props> = ({ value, onChange, onSend }) => (
    <form onSubmit={e => { e.preventDefault(); onSend(); }} style={{ display: 'flex', gap: 10 }}>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit">Send</button>
    </form>
);

export default MessageInput;
