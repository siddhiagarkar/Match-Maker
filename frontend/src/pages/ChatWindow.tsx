import { useState } from 'react';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';


type Message = { sender: 'client' | 'agent'; text: string };

const mockMessages: Message[] = [
    { sender: 'client', text: 'Hello, I need help!' },
    { sender: 'agent', text: 'Hi, happy to assist. What’s the issue?' }
];

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [input, setInput] = useState('');

    const onSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { sender: 'client', text: input }]);
        setInput('');
    };

    return (
        <div className="center-container">
            <div className="chat-box">
                <ChatHeader title="Support Chat" />
                <div style={{
                    height: 250,
                    background: '#fafafa',
                    marginBottom: '1rem',
                    overflowY: 'auto',
                    padding: 10
                }}>
                    {messages.map((m, i) =>
                        <MessageBubble key={i} sender={m.sender} text={m.text} />
                    )}
                </div>
                <MessageInput value={input} onChange={setInput} onSend={onSend} />
            </div>
        </div>

    );
}
