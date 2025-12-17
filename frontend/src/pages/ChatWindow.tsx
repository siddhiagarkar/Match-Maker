// pages/ChatWindow.tsx
import { useContext, useEffect, useState, useRef } from 'react';
import API from '../api';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../types/User';
import { redirect, useNavigate } from 'react-router-dom';

import { ChatLayout, ChatShell } from '../components/ChatLayout';
import { ChatHeader } from '../components/ChatHeader';
import { ConversationList,type ConversationListItem } from '../components/ConversationList';
import { ChatPaneHeader, ChatMessages, ChatInputBar } from '../components/ChatPane';

import Navbar from '../components/Navbar';

type Message = {
  conversation: string | null;
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
};

type ConversationSummary = {
  _id: string;
  code?: string;
  ticket: {
    masterDomain: string | undefined;
    subDomain: string;
    priority: string | undefined;
    code: string;
    _id: string;
    subject: string;
    status: 'open' | 'accepted' | 'resolved';
  };
  participants: User[];
  lastMessage?: string;
  updatedAt?: string;
};

export default function ChatWindow() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const user = useContext(AuthContext);
  const userId = user?._id;
  const userToken = user?.token;
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  // socket setup
  useEffect(() => {
    if (userId && userToken && !socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        auth: { token: userToken },
        transports: ['websocket'],
      });
      socketRef.current.on('connect', () => setIsSocketConnected(true));
      socketRef.current.on('disconnect', () => setIsSocketConnected(false));
      socketRef.current.on('connect_error', () => setIsSocketConnected(false));
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId, userToken]);

  // load conversations
  useEffect(() => {
    API.get('/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => setConversations([]));
  }, []);

  // load messages for selected conversation
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    API.get(`/messages/${selectedId}`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversationId: selectedId });
    }
  }, [selectedId]);

  // realtime handler
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (msg: Message) => {
      if (msg.conversation === selectedId) setMessages((prev) => [...prev, msg]);
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
    socketRef.current.emit('send_message', { conversationId: selectedId, content: input });
    setInput('');
  };

  const filteredConversations: ConversationListItem[] = conversations
  .filter((c) => c.ticket.status === 'accepted' || c.ticket.status === 'resolved')
  .map((c) => ({ 
    ...c, 
    ticket: { 
      ...c.ticket, 
      status: c.ticket.status as 'accepted' | 'resolved',
      subDomain: c.ticket.subDomain,
      masterDomain: c.ticket.masterDomain || 'General',
      priority: c.ticket.priority || 'no priority',
    } 
  }));


  const currentConversation = conversations.find((c) => c._id === selectedId);
  const currentClient = currentConversation?.participants.find((p) => p._id !== userId) || undefined;


  return (
    <>
      <Navbar
        onDashboard={() => navigate('/employee/dashboard')}
        onChat={() => navigate('/chat')}
        onLogout={() => {
          // your logout logic here
          navigate('/login');
        }}
        userName={user?.name || 'Current User'}
        userInitials={
          user?.name
            ? user.name
                .split(' ')
                .map(p => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'CU'
        }
        online={isSocketConnected}
      />

      <ChatLayout>
        <ChatHeader onBack={() => 
          {user?.role === 'client' ? navigate('/tickets/new') : navigate('/employee/dashboard')}} 
          title={user?.role === 'client' ? 'Create Ticket' : 'Ticket Dashboard'}
          />

        <ChatShell
          sidebar={
            <ConversationList
              items={filteredConversations}
              activeId={selectedId}
              currentUserId={userId}
              onSelect={setSelectedId}
              disclaimer={user?.role === 'client' ? '' : 'My Tickets'}
              msg_noTickets={user?.role === 'client' ? 'NO TICKETS ACCEPTED/CREATED AS YET.' : 'WOHOO NO PENDING TICKETS!' }
            />
          }
          content={
            currentConversation ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >

                
                <ChatPaneHeader
                  ticketCode={currentConversation.code || currentConversation.ticket.code}
                  domain={currentConversation.ticket.masterDomain}
                  subDomain={currentConversation.ticket.subDomain}
                  priority={currentConversation.ticket.priority}
                  subject={currentConversation.ticket.subject}
                  clientName={currentClient?.name}
                  onResolve={
                    user?.role === 'agent' &&
                    currentConversation.ticket.status !== 'resolved'
                      ? () => {
                          API.post(`/tickets/${currentConversation.ticket._id}/resolve`); 
                          setConversations(prev =>
                                            prev.filter(
                                              c => c.ticket._id !== currentConversation.ticket._id
                                            )
                                          );                       
                          alert('Successfully resolved the ticket!');
                        }
                      : undefined
                      // reload the page to reflect changes

                  }
                />
                
                <ChatMessages
                  messages={messages
                    .filter((m) => m.conversation !== null)
                    .map((m) => ({ ...m, conversation: m.conversation as string }))}
                  currentUserId={userId}
                />
                
                <ChatInputBar
                  value={input}
                  disabled={!isSocketConnected}
                  onChange={setInput}
                  onSend={onSend}
                />
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  color: '#9ca3af',
                }}
              >
                Select a conversation from the left to start chatting
              </div>
            )
          }
        />
      </ChatLayout>
    </>
  );
}
