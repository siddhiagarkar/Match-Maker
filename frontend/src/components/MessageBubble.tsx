import React from 'react';

type Props = {
    sender: 'client' | 'agent'; // restrict types for safety
    text: string;
};

const MessageBubble: React.FC<Props> = ({ sender, text }) => (
    <div className={`message-bubble-row ${sender}`}>
        <span className={`message-bubble ${sender}`}>
            {text}
        </span>
    </div>
);

export default MessageBubble;
