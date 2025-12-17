import { useContext, useEffect, useState } from 'react';
import API from '../api';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import { TicketFilters, type TicketFilterState } from '../components/TicketFilters';
import { ChatHeader } from '../components/ChatHeader';
import Select from 'react-select';
import { ExportToExcel } from '../components/ExportToExcel';


type Ticket = {
    _id: string;
    code: string;
    client: { _id: string; name: string };
    masterDomain: string;
    subDomain?: string;
    subject: string;
    additional_comment?: string;
    createdAt: string;
    acceptedAt: Date;
    resolvedAt: Date;
    estimatedResolutionAt: Date;
    status: 'open' | 'accepted' | 'resolved';
    acceptedBy?: { _id: string; name: string } | null;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
};

type Stats = {
    total: number;
    open: number;
    accepted: number;
    resolved: number;
    org_total?: number;
    org_open?: number;
    org_accepted?: number;
    org_resolved?: number;
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


export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'open' | 'accepted' | 'resolved'>('accepted');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats>({ org_total: 0, org_open: 0, org_accepted: 0, org_resolved: 0, total: 0, open: 0, accepted: 0, resolved: 0 });

    const [etaModalOpen, setEtaModalOpen] = useState(false);
    const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
    const [estimatedDate, setEstimatedDate] = useState<string>('');

    const [visibleCount, setVisibleCount] = useState(2);

    type SortOption = 'created-desc' | 'created-asc' | 'priority-desc' | 'priority-asc';
    const [sortBy, setSortBy] = useState<SortOption>('created-desc');

    const user = useContext(AuthContext);
    const navigate = useNavigate();

    const columnsToExport = [
    { key: 'code', label: 'Ticket ID' },
    { key: 'client.name', label: 'Client' },
    { key: 'subject', label: 'Subject' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'acceptedBy.name', label: 'Accepted By' },
    { key: 'estimatedResolutionAt', label: 'Est. Resolution' },
    ];


    const initialFilters: TicketFilterState = {
    client: 'all',
    domain: 'all',
    priority: 'all',
    handler: 'all',
    };

    const [filters, setFilters] = useState<TicketFilterState>(initialFilters);

    const clientOptions = [
    { label: 'Clients', value: 'all' as const },
    ...Array.from(new Set(tickets.map(t => t.client?.name).filter(Boolean))).map(name => ({
        label: name as string,
        value: name as string,
    })),
    ];

    const domainOptions = [
    { label: 'Domains', value: 'all' as const },
    ...Array.from(new Set(tickets.map(t => t.masterDomain).filter(Boolean))).map(d => ({
        label: d,
        value: d,
    })),
    ];

    const priorityOptions = [
    { label: 'Priorities', value: 'all' as const },
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
    ];

    const handlerOptions = [
    { label: 'Handlers', value: 'all' as const },
    ...Array.from(
        new Set(
        tickets
            .map(t => (typeof t.acceptedBy === 'string' ? t.acceptedBy : t.acceptedBy?.name))
            .filter(Boolean)
        )
    ).map(name => ({
        label: name as string,
        value: name as string,
    })),
    ];


    const [dateRange, setDateRange] = useState({
        from: null,
        to: null,
        });

        const handleDateChange = (key: string, value: string) => {
        setDateRange(prev => ({ ...prev, [key]: value }));
        };

        const applyFilters = (tickets: Ticket[], filters: TicketFilterState, sortBy: SortOption) => {
        const filtered = tickets.filter(t => {
            if (filters.client !== 'all' && t.client?.name !== filters.client) return false;
            if (filters.domain !== 'all' && t.masterDomain !== filters.domain) return false;
            if (filters.priority !== 'all' && t.priority !== filters.priority) return false;

            const handlerName =
            typeof t.acceptedBy === 'string' ? t.acceptedBy : t.acceptedBy?.name || 'Unassigned';
            if (filters.handler !== 'all' && handlerName !== filters.handler) return false;

            return true;
        });

        const sorted = [...filtered];

        sorted.sort((a, b) => {
            switch (sortBy) {
            case 'created-asc':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'created-desc':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'priority-desc': {
                const order = { urgent: 4, high: 3, medium: 2, low: 1 } as const;
                return (order[b.priority || 'low'] ?? 0) - (order[a.priority || 'low'] ?? 0);
            }
            case 'priority-asc': {
                const order = { urgent: 4, high: 3, medium: 2, low: 1 } as const;
                return (order[a.priority || 'low'] ?? 0) - (order[b.priority || 'low'] ?? 0);
            }
            default:
                return 0;
            }
        });

        return sorted;
        };


        const visibleTickets = applyFilters(tickets, filters, sortBy);


        const fetchStats = async () => {
        try {
            const params: Record<string, string> = {};
            if (dateRange.from) params.from = dateRange.from;
            if (dateRange.to) params.to = dateRange.to;

            const response = await API.get('/tickets/dashboard-all', { params });
            const allTickets = response.data as Ticket[];

            const filtered = applyFilters(allTickets, filters, sortBy); 

            setStats({
            org_total: allTickets.length,
            org_open: allTickets.filter(t => t.status === 'open').length,
            org_accepted: allTickets.filter(t => t.status === 'accepted').length,
            org_resolved: allTickets.filter(t => t.status === 'resolved').length,

            total: filtered.length,
            open: filtered.filter(t => t.status === 'open').length,
            accepted: filtered.filter(t => t.status === 'accepted').length,
            resolved: filtered.filter(t => t.status === 'resolved').length,
            });
        } catch {
            setStats({ total: 0, open: 0, accepted: 0, resolved: 0 });
        }
        };


          useEffect(() => {
            fetchStats();
            }, [
            dateRange.from,
            dateRange.to,
            filters.client,
            filters.domain,
            filters.priority,
            filters.handler,
            ]);

        

    // load tickets for active tab
      useEffect(() => {
        const fetchTickets = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (dateRange.from) params.from = dateRange.from;
            if (dateRange.to) params.to = dateRange.to;

            const res = await API.get(`/tickets/dashboard-${activeTab}`, { params });
            setTickets(res.data);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
        };

    fetchTickets();
  }, [activeTab, dateRange.from, dateRange.to]);


    const handleAccept = async (ticketId: string) => {
        await API.post(`/tickets/${ticketId}/accept`);
        fetchStats();
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        navigate(`/chat?ticket=${ticketId}`);
    };

    const handleLaunchChat = (ticketId: string) => {
        navigate(`/chat?ticket=${ticketId}`);
    };

    const handleConfirmAccept = async () => {
    if (!pendingTicketId) return;

    const est_date = new Date(estimatedDate).toISOString();
    if (!est_date || est_date.trim() === '') {
        alert('Please enter a valid estimated resolution date.');
        return;
    }

    const etaDate = new Date(est_date).toISOString();

    await API.post(`/tickets/${pendingTicketId}/accept`, {
        estimatedResolutionAt: etaDate,
    });

    await fetchStats();
    setTickets(prev => prev.filter(t => t._id !== pendingTicketId));
    setEtaModalOpen(false);

    navigate(`/chat?ticket=${pendingTicketId}`);
    setPendingTicketId(null);
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

    useEffect(() => {
    setVisibleCount(2);
    }, [activeTab, dateRange.from, dateRange.to, filters.client, filters.domain, filters.priority, filters.handler]);

    // Get data based on active tab
  const getDataByTab = () => {
    // switch (activeTab) {
    //   case 'open':
    //     return openTickets;
    //   case 'accepted':
    //     return acceptedTickets;
    //   case 'resolved':
    //     return resolvedTickets;
    //   default:
    //     return [];
    // }
    return visibleTickets;
  };

  const getFileNameByTab = () => {
    return `${activeTab}_tickets`;
  };

  const currentData = getDataByTab();
  const fileName = getFileNameByTab();




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

                    {/* <ChatHeader onBack={() => 
                          navigate('/chat')} 
                          title={user?.role === 'agent' ? 'CHAT' : 'xyz'}
                          /> */}
                    

                    {/* Stat cards row */}

                    
                    <div style={{ display: "flex", gap: 32, marginBottom: 0 }}>
                        {/* <StatCard
                            title="Total Tickets"
                            count={stats.total}
                            bgColor="#F9FAFB" icon={undefined}                        } */}
                        <StatCard
                            onClick={() => setActiveTab('open')}
                            title="Open"
                            count={stats.org_open}
                            bgColor="#E0E8F9" icon={undefined}                        />
                        <StatCard
                            onClick={() => setActiveTab('accepted')}
                            title="Accepted"
                            count={stats.org_accepted}
                            bgColor="#FEF9E0" icon={undefined}                        />
                        <StatCard
                            onClick={() => setActiveTab('resolved')}
                            title="Resolved"
                            count={stats.org_resolved}
                            bgColor="#D1FADF" icon={undefined}                        />

                        <StatCard
                            title="Online Agents"
                            count={0}
                            bgColor="#fbeedfff" icon={undefined}                        />


                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24}}>
                        <div
                            style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                           
                            borderRadius: 12,
                            background: "#ffffff",
                            boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
                            minWidth: "10%",
                            fontSize: 14,
                            color: "#374151",
                            height: "100%",
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "row", gap: 4, padding: "15px 20px" }}>
                            <span style={{ fontWeight: 500 }}>From : </span>
                            <input
                                type="date"
                                value={dateRange.from || ""}
                                onChange={(e) => handleDateChange("from", e.target.value)}
                                style={{
                                // padding: "10px 15px",
                                borderRadius: 8,
                                border: "1px solid #d1d5db",
                                fontSize: 14,
                                color: "#111827",      
                                }}
                            />
                            </div>

                            <div style={{ display: "flex", flexDirection: "row", gap: 4, padding: "15px 20px" }}>
                            <span style={{ fontWeight: 500 }}>To   :</span>
                            <input
                                type="date"
                                value={dateRange.to || ""}
                                onChange={(e) => handleDateChange("to", e.target.value)}
                                style={{
                                // padding: "10px 15px",
                                borderRadius: 8,
                                border: "1px solid #d1d5db",
                                fontSize: 14,
                                color: "#111827",
                                }}
                            />
                            </div>
                        </div>
                        </div>


                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7, flexDirection: 'row', gap: 8 }}>
                    {/* <TicketFilters
                        value={filters}
                        onChange={setFilters}
                        clientOptions={clientOptions}
                        domainOptions={domainOptions}
                        priorityOptions={priorityOptions}
                        handlerOptions={handlerOptions}
                    /> */}
                    <Select
                    options={clientOptions} // { label, value }
                    value={clientOptions.find(o => o.value === filters.client) || null}
                    onChange={opt =>
                        setFilters(prev => ({ ...prev, client: (opt?.value as string) || 'all' }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Client"
                    />
                    <Select 
                    options={domainOptions} // { label, value }
                    value={domainOptions.find(o => o.value === filters.domain) || null}
                    onChange={opt =>
                        setFilters(prev => ({ ...prev, domain: (opt?.value as string) || 'all' }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Domain"
                    />
                    <Select
                    options={priorityOptions} // { label, value }
                    value={priorityOptions.find(o => o.value === filters.priority) || null}
                    onChange={opt =>
                        setFilters(prev => ({ ...prev, priority: (opt?.value as string) || 'all' }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Priority"
                    />
                    <Select
                    options={handlerOptions} // { label, value }
                    value={handlerOptions.find(o => o.value === filters.handler) || null}
                    onChange={opt =>
                        setFilters(prev => ({ ...prev, handler: (opt?.value as string) || 'all' }))
                    }
                    isClearable
                    isSearchable
                    placeholder="Handler"
                    />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ fontSize: 14, color: '#4b5563' }}>Sort by:</label>
                    <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#111827',
                    }}
                    >
                    <option value="created-desc">Newest first</option>
                    <option value="created-asc">Oldest first</option>
                    <option value="priority-desc">Priority high → low</option>
                    <option value="priority-asc">Priority low → high</option>
                    </select>
                </div>
                    <Button
                        variant="default"
                        onClick={() => setFilters(initialFilters)}
                        style={{ marginLeft: '10px' }}
                    >
                        Reset filters
                    </Button>
                    </div>


                    {/* Tabs row */}
                    {/* Header with tabs and export */}
<div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 16
}}>
    {/* Tabs row */}
    <div style={{
        display: "inline-flex",
        borderRadius: 21,
        background: "#f6f6f9",
        padding: "6px",
        gap: 6,
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

    {/* Export button - positioned on the right */}
    <ExportToExcel
        data={currentData}
        fileName={fileName}
        sheetName={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        columns={columnsToExport}
    />
</div>


                    {/* Table */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 17,
                        boxShadow: "0 2px 12px #e6e7f9",
                        overflow: "hidden",
                        marginTop: 12,
                    }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading...</div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17}}>
                                <thead>
                                    <tr style={{ height: "52px", background: "#fff" }}>
                                        <th style={thStyle}>Ticket</th>
                                        <th style={thStyle}>Client</th>
                                        <th style={thStyle}>Domain</th>
                                        {/* <th style={thStyle}>Subquery</th> */}
                                        <th style={thStyle}>Comment</th>
                                        <th style={thStyle}>Priority</th>
                                        <th style={thStyle}>Posted</th>
                                        {activeTab == 'accepted' && (
                                            <>
                                            <th style={thStyle}>Accepted</th>
                                            </>
                                        )
                                        }
                                        {activeTab == 'resolved' && (
                                            <>
                                            <th style={thStyle}>Accepted</th>
                                            <th style={thStyle}>Resolved</th>
                                            </>
                                        )
                                        }
                                        <th style={thStyle}>Handler</th>
                                        {/* <th style={thStyle}>Actions</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#ccc", fontSize: 19 }}>
                                                No tickets in this category
                                            </td>
                                        </tr>
                                    ) : visibleTickets.slice(0, visibleCount).map(ticket => (
                                        <tr key={ticket._id} style={{
                                            borderBottom: "1px solid #f3f4f6",
                                            background: "#fff"
                                        }}>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 500, fontVariant: "tabular-nums" }}>
                                                    <Link
                                                        to={`/tickets/${ticket._id}`}
                                                        style={{
                                                        fontWeight: 500,
                                                        fontVariant: 'tabular-nums',
                                                        color: '#2563eb',
                                                        textDecoration: 'none',
                                                        }}
                                                    >
                                                        {ticket.code}
                                                    </Link>
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{ticket.client?.name || "Unknown"}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 500 }}>{ticket.masterDomain}</div>
                                                <div style={{ color: "#9494a4ff", fontWeight: 500 }}>{ticket.subDomain || '-'}</div>
                                            </td>

                                            
                                            <td style={tdStyle}>
                                                <div>{ticket.subject}</div>
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
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>
                                                {ticket.createdAt
                                                    ? (() => {
                                                        const d = new Date(ticket.createdAt);

                                                        const day = String(d.getDate()).padStart(2, '0');

                                                        const monthShort = d
                                                        .toLocaleString('en-US', { month: 'short' }) // e.g. "Dec"
                                                        .toUpperCase(); // "DEC"

                                                        const yearShort = String(d.getFullYear()).slice(-2); // "25"

                                                        const hours = String(d.getHours()).padStart(2, '0');
                                                        const minutes = String(d.getMinutes()).padStart(2, '0');

                                                        return `${day}${monthShort}${yearShort} ${hours}:${minutes}`;
                                                    })()
                                                    : '-'}
                                                </div>
                                            </td>

                                            {activeTab == 'accepted' && (
                                            <>
                                            <td style={tdStyle}>
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>
                                                {ticket.acceptedAt
                                                    ? (() => {
                                                        const d = new Date(ticket.acceptedAt);

                                                        const day = String(d.getDate()).padStart(2, '0');

                                                        const monthShort = d
                                                        .toLocaleString('en-US', { month: 'short' }) // e.g. "Dec"
                                                        .toUpperCase(); // "DEC"

                                                        const yearShort = String(d.getFullYear()).slice(-2); // "25"

                                                        const hours = String(d.getHours()).padStart(2, '0');
                                                        const minutes = String(d.getMinutes()).padStart(2, '0');

                                                        return `${day}${monthShort}${yearShort} ${hours}:${minutes}`;
                                                    })()
                                                    : '-'}
                                                </div>
                                            </td>
                                            </>
                                        )
                                        }

                                        {activeTab == 'resolved' && (
                                            <>
                                            <td style={tdStyle}>
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>
                                                {ticket.acceptedAt
                                                    ? (() => {
                                                        const d = new Date(ticket.acceptedAt);

                                                        const day = String(d.getDate()).padStart(2, '0');

                                                        const monthShort = d
                                                        .toLocaleString('en-US', { month: 'short' }) // e.g. "Dec"
                                                        .toUpperCase(); // "DEC"

                                                        const yearShort = String(d.getFullYear()).slice(-2); // "25"

                                                        const hours = String(d.getHours()).padStart(2, '0');
                                                        const minutes = String(d.getMinutes()).padStart(2, '0');

                                                        return `${day}${monthShort}${yearShort} ${hours}:${minutes}`;
                                                    })()
                                                    : '-'}
                                                </div>

                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ color: "#71717a", fontWeight: 500 }}>
                                                {ticket.resolvedAt
                                                    ? (() => {
                                                        const d = new Date(ticket.resolvedAt);

                                                        const day = String(d.getDate()).padStart(2, '0');

                                                        const monthShort = d
                                                        .toLocaleString('en-US', { month: 'short' }) // e.g. "Dec"
                                                        .toUpperCase(); // "DEC"

                                                        const yearShort = String(d.getFullYear()).slice(-2); // "25"

                                                        const hours = String(d.getHours()).padStart(2, '0');
                                                        const minutes = String(d.getMinutes()).padStart(2, '0');

                                                        return `${day}${monthShort}${yearShort} ${hours}:${minutes}`;
                                                    })()
                                                    : '-'}
                                                </div>

                                            </td>
                                            </>
                                        )
                                        }

                                            <td style={tdStyle}>
                                            <span style={{ color: "#a1a1aa" }}>
                                                {typeof ticket.acceptedBy === 'string'
                                                ? ticket.acceptedBy
                                                : ticket.acceptedBy?.name
                                                    || ("Not-suggested")}
                                            </span>
                                            </td>


                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {/* Load more button */}
                        {visibleTickets.length > visibleCount && (
                        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <Button
                            variant="default"
                            onClick={() => setVisibleCount(c => c + 2)}
                            >
                            Load more
                            </Button>
                        </div>
                        )}

                    </div>

                    {etaModalOpen && (
                <div
                    style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15,23,42,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    }}
                >
                    <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '20px 24px',
                        minWidth: 320,
                        boxShadow: '0 10px 40px rgba(15,23,42,0.18)',
                    }}
                    >
                    <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
                        Estimated completion time
                    </h3>
                    <p style={{ marginBottom: 14, fontSize: 14, color: '#6b7280' }}>
                        By when do you expect to resolve this ticket?
                    </p>
                    <input
                        type="datetime-local"
                        min={1}
                        value={estimatedDate}
                        onChange={e => setEstimatedDate(e.target.value)}
                        style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        marginBottom: 16,
                        fontSize: 14,
                        }}
                        placeholder="e.g. 30"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                        variant="default"
                        onClick={() => {
                            setEtaModalOpen(false);
                            setPendingTicketId(null);
                        }}
                        >
                        Cancel
                        </Button>
                        <Button variant="primary" onClick={handleConfirmAccept}>
                        Confirm & Accept
                        </Button>
                    </div>
                    </div>
                </div>
                )}

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
