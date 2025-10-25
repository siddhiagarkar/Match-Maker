import { useContext, useEffect, useState } from 'react';
import API from '../api';

import { AuthContext } from "../context/AuthContext"; // adjust path as needed
import type { User } from "../types/User";



type Message = {
    _id: string;
    sender: string; // user _id
    content: string;
    createdAt: string;
};

type ConversationSummary = {
    _id: string;
    participants: User[];
    lastMessage?: string;
    updatedAt?: string;
};


export default function ChatWindow() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');


    const user = useContext(AuthContext);
    const userId = user?._id;

    function renderUserName(participants: User[]) {
        const other = participants.find(u => u._id !== userId);
        return other ? other.name : 'Unknown';
    }
    function formatDate(iso: string) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    useEffect(() => {
        API.get('/conversations')
            .then(res => setConversations(res.data))
            .catch(() => setConversations([]));
    }, []);

    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }
        API.get(`/messages/${selectedId}`)
            .then(res => setMessages(res.data))
            .catch(() => setMessages([]));
    }, [selectedId]);

    const onSend = () => {
        if (!input.trim() || !selectedId) return;
        API.post('/messages', {
            conversation: selectedId,
            content: input
        }).then(res => {
            setMessages([...messages, res.data]);
            setInput('');
        });
    };

    const getBubbleClass = (senderId: string) =>
        senderId?.toString() === userId?.toString() ? 'me' : 'them';


    console.log("Logged in userId:", userId);
    messages.forEach(m => {
        console.log("Msg sender:", m.sender, "== me?", m.sender === userId);
    });



    // Chat area auto scroll to bottom on new message
    useEffect(() => {
        const elem = document.querySelector('.chat-messages');
        if (elem) elem.scrollTop = elem.scrollHeight;
    }, [messages]);

    return (
        <div className="chat-app-bg">
            <div className="chat-app-row">
                {/* Left sidebar */}
                <div className="sidebar-chat">
                    <div className="sidebar-header">
                        <span className="sidebar-title">Chats</span>
                        <button className="sidebar-new-chat">+ New Chat</button>
                    </div>
                    <div className="sidebar-list">
                        {conversations.map(conv => (
                            <div
                                key={conv._id}
                                className={`sidebar-chat-item ${conv._id === selectedId ? 'active' : ''}`}
                                onClick={() => setSelectedId(conv._id)}
                            >
                                <div className="sidebar-chat-item-name">
                                    {renderUserName(conv.participants)}
                                </div>
                                {conv.lastMessage && (
                                    <div className="sidebar-chat-item-snippet">
                                        {conv.lastMessage}
                                    </div>
                                )}
                                {conv.updatedAt && (
                                    <div className="sidebar-chat-item-date">
                                        {formatDate(conv.updatedAt)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Right chat UI */}
                <div className="chat-right-panel">
                    {selectedId ? (
                        <>
                            <div className="chat-header-bar">
                                <span className="chat-header-name">
                                    {renderUserName(
                                        conversations.find(c => c._id === selectedId)?.participants || []
                                    )}
                                </span>
                            </div>
                            <div className="chat-messages">
                                {messages.map(m => (
                                    <div
                                        key={m._id}
                                        className={`message-bubble-row ${getBubbleClass(m.sender)}`}
                                    >
                                        <span className="message-bubble">{m.content}</span>
                                    </div>
                                ))}
                            </div>

                            <form
                                className="chat-input-bar"
                                onSubmit={e => {
                                    e.preventDefault();
                                    onSend();
                                }}
                            >
                                <input
                                    value={input}
                                    type="text"
                                    placeholder="Type a message…"
                                    onChange={e => setInput(e.target.value)}
                                />
                                <button type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <span>Select a chat to view messages</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
