import { useContext, useEffect, useState } from 'react';
import API from '../api';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Ticket = {
    _id: string;
    code: string;
    client: { _id: string; name: string };
    masterDomain: string;
    subDomain?: string;
    subject: string;
    additional_comment?: string;
    createdAt: string;
    status: 'open' | 'accepted' | 'resolved';
    acceptedBy?: { _id: string; name: string } | null;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
};

type Stats = {
    total: number;
    open: number;
    accepted: number;
    resolved: number;
};

const TABS = ['open', 'accepted', 'resolved'] as const;

function getPriorityStyle(priority?: string) {
    switch (priority) {
        case 'urgent': return { background: "#fee2e2", color: "#b91c1c" };
        case 'high': return { background: "#ffedd5", color: "#c2410c" };
        case 'medium': return { background: "#dbeafe", color: "#1d4ed8" };
        case 'low': return { background: "#f3f4f6", color: "#374151" };
        default: return { background: "#f3f4f6", color: "#374151" };
    }
}

export default function EmployeeDashboard() {
    const [activeTab, setActiveTab] = useState<'open' | 'accepted' | 'resolved'>('open');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    // const [allUser, setAllUser] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats>({ total: 0, open: 0, accepted: 0, resolved: 0 });

    const user = useContext(AuthContext);
    const navigate = useNavigate();

        const fetchStats = async () => {
            try {
                const response = await API.get('/tickets/dashboard-all');
                const allTickets = response.data as Ticket[];

                setStats({
                    total: allTickets.length,
                    open: allTickets.filter(t => t.status === 'open').length,
                    accepted: allTickets.filter(t => t.status === 'accepted').length,
                    resolved: allTickets.filter(t => t.status === 'resolved').length,
                });
            } catch {
                setStats({ total: 0, open: 0, accepted: 0, resolved: 0 });
            }
        };

        fetchStats();

    // load tickets for active tab
    useEffect(() => {
        setLoading(true);
        API.get(`tickets/dashboard-${activeTab}`)
            .then(res => setTickets(res.data))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const handleAccept = async (ticketId: string) => {
        await API.post(`/tickets/${ticketId}/accept`);
        fetchStats();
        setTickets(prev => prev.filter(t => t._id !== ticketId));

    };

    const handleResolve = async (ticketId: string) => {
        await API.post(`/tickets/${ticketId}/resolve`);
        fetchStats();
        setTickets(prev => prev.filter(t => t._id !== ticketId));
    };

    const handleLaunchChat = (ticketId: string) => {
        navigate(`/chat?ticket=${ticketId}`);
    };

    const userInitials =
        user?.name
            ? user.name
                .split(' ')
                .map(p => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'CU';

    return (
        <>
            <Navbar
                onDashboard={() => navigate('/employee/dashboard')}
                onChat={() => navigate('/chat')}
                onLogout={() => {
                    // add logout logic
                    navigate('/login');
                }}
                userName={user?.name || 'Current User'}
                userInitials={userInitials}
                online={true}
            />
            
            <div style={{ minHeight: "100vh", background: "#f7f8fa", padding: "2rem 0" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {/* Stat cards row */}
                    <div style={{ display: "flex", gap: 32, marginBottom: 36 }}>
                        <StatCard
                            title="Total Tickets"
                            count={stats.total}
                            bgColor="#F9FAFB" icon={undefined}                        />
                        <StatCard
                            title="Open"
                            count={stats.open}
                            bgColor="#E0E8F9" icon={undefined}                        />
                        <StatCard
                            title="Accepted"
                            count={stats.accepted}
                            bgColor="#FEF9E0" icon={undefined}                        />
                        <StatCard
                            title="Resolved"
                            count={stats.resolved}
                            bgColor="#D1FADF" icon={undefined}                        />
                    </div>

                    {/* Tabs row */}
                    <div style={{
                        display: "inline-flex",
                        borderRadius: 21,
                        background: "#f6f6f9",
                        padding: "6px",
                        gap: 6,
                        marginBottom: 32
                    }}>
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "8px 34px",
                                    border: "none",
                                    borderRadius: 18,
                                    fontWeight: 600,
                                    fontSize: 18,
                                    background: activeTab === tab ? "#fff" : "#f6f6f9",
                                    color: activeTab === tab ? "#222" : "#444",
                                    boxShadow: activeTab === tab ? "0 2px 8px #e1e4f6" : undefined,
                                    outline: "none",
                                    cursor: "pointer"
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({stats[tab]})
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 17,
                        boxShadow: "0 2px 12px #e6e7f9",
                        overflow: "hidden",
                        marginTop: 12
                    }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading...</div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
                                <thead>
                                    <tr style={{ height: "52px", background: "#fff" }}>
                                        <th style={thStyle}>Ticket Code</th>
                                        <th style={thStyle}>Client</th>
                                        <th style={thStyle}>Query</th>
                                        <th style={thStyle}>Sub-query</th>
                                        <th style={thStyle}>Comment</th>
                                        <th style={thStyle}>Priority</th>
                                        <th style={thStyle}>Timestamps</th>
                                        {/* {TABS.map(tab => ( 
                                            activeTab
                                        ))} */}
                                        <th style={thStyle}>Handler</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#ccc", fontSize: 19 }}>
                                                No tickets in this category
                                            </td>
                                        </tr>
                                    ) : tickets.map(ticket => (
                                        <tr key={ticket._id} style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            background: "#fff"
                                        }}>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 500, fontVariant: "tabular-nums" }}>
                                                    {ticket.code}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{ticket.client?.name || "Unknown"}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 500 }}>{ticket.masterDomain}</div>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>{ticket.subDomain || '-'}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div>{ticket.subject}</div>
                                                {/* {ticket.additional_comment && (
                                                    <button
                                                        style={{
                                                            color: "#2563eb",
                                                            border: "none",
                                                            background: "transparent",
                                                            padding: 0,
                                                            marginTop: 4,
                                                            fontSize: 14,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        View comments
                                                    </button>
                                                )} */}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    display: "inline-block",
                                                    minWidth: 56,
                                                    padding: "4px 13px",
                                                    fontWeight: 500,
                                                    fontSize: 15,
                                                    borderRadius: "18px",
                                                    ...getPriorityStyle(ticket.priority)
                                                }}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>{ticket.createdAt || '-'}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ color: "#a1a1aa" }}>
                                                    {typeof ticket.acceptedBy === 'string' ? ticket.acceptedBy : ticket.acceptedBy?.name || "Unassigned"}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, minWidth: 170 }}>
                                                {activeTab === 'open' && (
                                                    <Button variant="primary" onClick={() => handleAccept(ticket._id)}>
                                                        Accept
                                                    </Button>
                                                )}
                                                {activeTab === 'accepted' && (
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        {/* <Button variant="primary" onClick={() => handleResolve(ticket._id)}>
                                                            Resolve
                                                        </Button> */}
                                                        <Button variant="default" onClick={() => handleLaunchChat(ticket._id)}>
                                                            Chat
                                                        </Button>
                                                    </div>
                                                )}
                                                {activeTab === 'resolved' && (
                                                    <span style={{ color: "#22c55e", fontWeight: 500 }}>
                                                        Resolved
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

const thStyle = {
    padding: "16px 19px",
    fontWeight: 600,
    fontSize: 15.7,
    textAlign: "left",
    background: "#fff",
    color: "#222",
    borderBottom: "2px solid #eee"
};

const tdStyle = {
    padding: "17px 19px",
    fontSize: 15.5,
    textAlign: "left",
    borderBottom: "1px solid #f3f4f6",
    background: "#fff",
    verticalAlign: "middle"
};
