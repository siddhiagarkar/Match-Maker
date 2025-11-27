import { useContext, useEffect, useState, useRef } from 'react';
import API from '../api';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from "../context/AuthContext";
import type { User } from "../types/User";
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

type Message = {
    conversation: string | null;
    _id: string;
    sender: string;
    content: string;
    createdAt: string;
};

type ConversationSummary = {
    _id: string;
    ticket: {
        _id: string;
        subject: string;
        status: 'open' | 'accepted' | 'resolved';
    };
    participants: User[];
    lastMessage?: string;
    updatedAt?: string;
};

const TICKET_STATUSES = ['open', 'accepted', 'resolved'] as const;

export default function ChatWindow() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [activeTab, setActiveTab] = useState<'open' | 'accepted' | 'resolved'>('open');

    const user = useContext(AuthContext);
    const userId = user?._id;
    const userToken = user?.token;

    const socketRef = useRef<Socket | null>(null);
    const navigate = useNavigate();

    // Setup socket
    useEffect(() => {
        if (userId && userToken && !socketRef.current) {
            socketRef.current = io('http://localhost:5000', {
                auth: { token: userToken },
                transports: ['websocket'],
            });

            socketRef.current.on('connect', () => setIsSocketConnected(true));
            socketRef.current.on('disconnect', () => setIsSocketConnected(false));
            socketRef.current.on('connect_error', err => setIsSocketConnected(false));
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId, userToken]);

    // Initial conversations
    useEffect(() => {
        API.get('/conversations')
            .then(res => setConversations(res.data))
            .catch(() => setConversations([]));
    }, []);

    // Join room and load messages
    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }
        API.get(`/messages/${selectedId}`)
            .then(res => setMessages(res.data))
            .catch(() => setMessages([]));
        if (socketRef.current && selectedId) {
            socketRef.current.emit('join_conversation', {
                conversationId: selectedId
            });
        }
    }, [selectedId]);

    // Listen for real-time messages
    useEffect(() => {
        if (!socketRef.current) return;
        const handler = (msg: Message) => {
            if (msg.conversation === selectedId)
                setMessages(prev => [...prev, msg]);
        };
        socketRef.current.on('receive_message', handler);
        return () => {
            socketRef.current?.off('receive_message', handler);
        };
    }, [selectedId]);

    useEffect(() => {
        const elem = document.querySelector('.chat-messages');
        if (elem) elem.scrollTop = elem.scrollHeight;
    }, [messages]);

    const onSend = () => {
        if (!input.trim() || !selectedId || !socketRef.current) return;
        if (!isSocketConnected) {
            alert('Not connected to chat. Please wait or reload.');
            return;
        }
        socketRef.current.emit('send_message', {
            conversationId: selectedId,
            content: input
        });
        setInput('');
    };

    const renderUserName = (participants: User[]) => {
        const other = participants.find(u => u._id !== userId);
        return other ? other.name : 'Unknown';
    };

    const formatDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getBubbleClass = (senderId: string) =>
        String(senderId) === String(userId) ? 'me' : 'them';

    // Tab-filtered conversations
    const filteredConversations = conversations.filter(conv => conv.ticket?.status === activeTab);

    // Get ticket subject for current chat
    const currentConversation = conversations.find(c => c._id === selectedId);

    return (
        <div style={{ minHeight: "100vh", background: "#f6faff" }}>
            {/* Tabs at full width, top center */}
            <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: 36,
                background: "#fff",
                borderBottom: "1px solid #e5e5e5",
                padding: "1.2rem 0 1.2rem 0",
                boxShadow: "0 2px 7px rgba(67,120,235,0.03)"
            }}>
                {TICKET_STATUSES.map(status => (
                    <Button
                        key={status}
                        variant={activeTab === status ? "primary" : "default"}
                        style={{
                            minWidth: 150,
                            fontWeight: activeTab === status ? "bold" : "normal",
                            fontSize: 19,
                            boxShadow: activeTab === status ? "0 2px 8px #d2e2ff" : undefined,
                            border: activeTab === status ? "2px solid #3677cb" : "1px solid #dedede",
                            borderRadius: "999px",
                            padding: "0.8rem 2.3rem"
                        }}
                        onClick={() => setActiveTab(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>
            {/* Main row: sidebar + chat */}
            <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 75px)" }}>
                {/* Sidebar */}
                <div style={{
                    width: 370,
                    background: "#fff",
                    borderRight: "1px solid #eaeaea",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{
                        padding: "2rem 1rem 1rem 1rem",
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        color: "#234"
                    }}>
                        Chats
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {filteredConversations.length === 0 ? (
                            <div style={{ color: "#777", padding: "1rem", textAlign: "center" }}>
                                No conversations under this status.
                            </div>
                        ) : filteredConversations.map(conv => (
                            <div
                                key={conv._id}
                                className={`sidebar-chat-item ${conv._id === selectedId ? 'active' : ''}`}
                                onClick={() => setSelectedId(conv._id)}
                                style={{
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee",
                                    padding: "0.83rem 1rem",
                                    background: conv._id === selectedId ? "#eaf4ff" : undefined,
                                    borderLeft: conv._id === selectedId ? "4px solid #3677cb" : "4px solid transparent",
                                    marginBottom: 3
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                                    {renderUserName(conv.participants)}
                                </div>
                                <div style={{ fontSize: 14, marginBottom: 2 }}>
                                    <strong>Subject:</strong> {conv.ticket?.subject?.slice(0, 36) || 'No subject'}
                                </div>
                                <div style={{ color: "#595", fontSize: 13 }}>
                                    Status: <span style={{ fontWeight: "bold" }}>{conv.ticket?.status}</span>
                                </div>
                                {conv.lastMessage && (
                                    <div
                                        style={{ color: "#888", fontSize: 12, marginTop: 3 }}
                                    >
                                        {conv.lastMessage.slice(0, 30)}
                                    </div>
                                )}
                                {conv.updatedAt && (
                                    <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
                                        {formatDate(conv.updatedAt)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {user?.role === 'client' && (
                        <Button variant="red" style={{ margin: "1.3rem" }} onClick={() => navigate('/tickets/new')}>
                            Post a Ticket
                        </Button>
                    )}
                    {user?.role === 'agent' && (
                        <Button variant="red" style={{ margin: "1.3rem" }} onClick={() => navigate('/employee/dashboard')}>
                            View Ticket Dashboard
                        </Button>
                    )}
                </div>
                {/* Main chat panel */}
                <div style={{
                    flex: 1,
                    background: "#f7faff",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    height: "100%"
                }}>
                    {selectedId ? (
                        <>
                            {/* Subject prominently at top */}
                            <div style={{
                                padding: "1.5rem 2.2rem 0.9rem 2.2rem",
                                background: "#fff",
                                borderBottom: "1px solid #eaeaea",
                                fontSize: "1.32rem",
                                fontWeight: 700,
                                color: "#1965d2",
                                letterSpacing: 0.5,
                                boxShadow: "0 1px 7px #f2f2f2"
                            }}>
                                {currentConversation?.ticket?.subject || "No subject"}
                            </div>
                            <div style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "1.1rem 2.2rem"
                            }}>
                                {messages.map(m => (
                                    <div
                                        key={m._id}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: getBubbleClass(m.sender) === "me" ? "flex-end" : "flex-start",
                                            marginBottom: "1.4rem"
                                        }}
                                    >
                                        <span
                                            style={{
                                                maxWidth: "65%",
                                                background: getBubbleClass(m.sender) === "me" ? "#3677cb" : "#e4e8f3",
                                                color: getBubbleClass(m.sender) === "me" ? "#fff" : "#234",
                                                padding: "10px 16px",
                                                borderRadius: "18px",
                                                fontSize: "1rem",
                                                boxShadow: "0 1px 6px rgba(0,0,0,0.03)"
                                            }}
                                        >
                                            {m.content}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                                            [sender: {m.sender}]
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <form
                                style={{
                                    padding: "1rem 2rem",
                                    background: "#fff",
                                    borderTop: "1px solid #eaeaea",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1.1rem"
                                }}
                                onSubmit={e => {
                                    e.preventDefault();
                                    onSend();
                                }}
                            >
                                <input
                                    value={input}
                                    type="text"
                                    disabled={!isSocketConnected}
                                    placeholder="Type a message…"
                                    onChange={e => setInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        fontSize: "1.15rem",
                                        borderRadius: "8px",
                                        border: "1px solid #d4dbe7",
                                        padding: "11px 16px"
                                    }}
                                />
                                <Button type="submit" variant="primary" disabled={!isSocketConnected || !input.trim()}>
                                    Send
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            color: "#666"
                        }}>
                            <span>Select a chat to view messages</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
