import React from 'react';

const ChatHeader: React.FC<{ title: string }> = ({ title }) => (
    <div style={{
        fontWeight: 'bold',
        fontSize: '1.2rem',
        borderBottom: '1px solid #eee',
        padding: '0.75rem 0',
        marginBottom: '1rem'
    }}>{title}</div>
);

export default ChatHeader;
