import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import  Button  from '../components/Button';

type Ticket = {
  _id: string;
  code: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  masterDomain: string;
  subDomain?: string;
  subject?: string;
  additional_comment?: string;
  status: 'open' | 'accepted' | 'resolved';
  client: { _id: string; name: string };
  acceptedBy?: { _id: string; name: string } | null;
  createdAt: string;
  acceptedAt?: string;
  resolvedAt?: string;
  estimatedResolutionAt?: string;
};

type Stats = {
  total: number;
  open: number;
  accepted: number;
  resolved: number;
};

type SuggestedAgent = { _id: string; name: string };

export default function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, accepted: 0, resolved: 0 });

  const [suggestedAgents, setSuggestedAgents] = useState<SuggestedAgent[] | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [etaModalOpen, setEtaModalOpen] = useState(false);
const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
const [estimatedDate, setEstimatedDate] = useState('');


  const fetchStats = async () => {
    try {
      const params: Record<string, string> = {};
      const response = await API.get('/tickets/dashboard-all', { params });
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

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await API.get(`/tickets/${ticketId}`);
        setTicket(res.data);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    if (ticketId) fetchTicket();
  }, [ticketId]);

  // Fetch suggestions for this single ticket
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!ticketId) return;
      try {
        const res = await API.get(`/tickets/suggestions/${ticketId}`);
        setSuggestedAgents(res.data as SuggestedAgent[]);
        setSuggestionsError(null);
      } catch (e: any) {
        setSuggestedAgents(null);
        setSuggestionsError(e.response?.data?.error || 'Failed to load suggestions');
      }
    };
    fetchSuggestions();
  }, [ticketId]);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    const dateStr = d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${dateStr} at ${timeStr}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const diffMinutes = (from?: string, to?: string) => {
    if (!from || !to) return null;
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60));
  };

  // Convert minutes → human-readable (days/hours/minutes)
  const formatDuration = (minutes: number | null) => {
    if (minutes == null) return '-';
    if (minutes === 0) return '0 minutes';

    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(days === 1 ? '1 day' : `${days} days`);
    if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
    if (mins > 0) parts.push(mins === 1 ? '1 minute' : `${mins} minutes`);

    return parts.join(' ');
  };

  // Metrics
  const estimatedMinutes = diffMinutes(ticket?.acceptedAt, ticket?.estimatedResolutionAt);
  const actualMinutes = diffMinutes(ticket?.acceptedAt, ticket?.resolvedAt);

  let performanceLabel = 'N/A';
  let performanceColor = '#6b7280';
  if (estimatedMinutes != null && actualMinutes != null) {
    if (actualMinutes <= estimatedMinutes) {
      performanceLabel = 'On time or faster';
      performanceColor = '#10b981';
    } else {
      performanceLabel = 'Delayed';
      performanceColor = '#dc2626';
    }
  }

  const userInitials =
    user?.name
      ? user.name
          .split(' ')
          .map(p => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'CU';

  if (loading) {
    return (
      <>
        <Navbar
          onDashboard={() => navigate('/employee/dashboard')}
          onChat={() => navigate('/chat')}
          onLogout={() => navigate('/login')}
          userName={user?.name || 'Current User'}
          userInitials={userInitials}
          online={true}
        />
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
          Loading ticket...
        </div>
      </>
    );
  }

  if (error || !ticket) {
    return (
      <>
        <Navbar
          onDashboard={() => navigate('/employee/dashboard')}
          onChat={() => navigate('/chat')}
          onLogout={() => navigate('/login')}
          userName={user?.name || 'Current User'}
          userInitials={userInitials}
          online={true}
        />
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#ef4444' }}>
          {error || 'Ticket not found'}
        </div>
      </>
    );
  }

  const priorityColor = () => {
    switch (ticket.priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#2563eb';
      case 'low':
      default:
        return '#4b5563';
    }
  };

  const suggestedName =
    suggestedAgents && suggestedAgents.length > 0
      ? suggestedAgents[0].name
      : 'Not-suggested';

  // Actions: accept / resolve
  const handleAccept = () => {
  if (!ticket) return;
  setPendingTicketId(ticket._id);  // Open ETA modal first
  setEtaModalOpen(true);
};

const handleConfirmAccept = async () => {
  if (!pendingTicketId || !estimatedDate) return;
  
  try {
    const res = await API.post(`/tickets/${pendingTicketId}/accept`, {
      estimatedResolutionAt: new Date(estimatedDate).toISOString()
    });
    setTicket(res.data);
    setEtaModalOpen(false);
    setPendingTicketId(null);
    setEstimatedDate('');
  } catch (e) {
    console.error('Accept failed:', e);
  }
};



  const handleResolve = async () => {
    if (!ticket) return;
    try {
      const res = await API.post(`/tickets/${ticket._id}/resolve`);
      setTicket(res.data);
    } catch (e) {
      // optionally toast
    }
  };

  return (
    <>
      <Navbar
        onDashboard={() => navigate('/employee/dashboard')}
        onChat={() => navigate('/chat')}
        onLogout={() => navigate('/login')}
        userName={user?.name || 'Current User'}
        userInitials={userInitials}
        online={true}
      />

      <div style={{ minHeight: '100vh', background: '#f7f8fa', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Back link */}
          <button
            onClick={() => navigate('/employee/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              background: 'transparent',
              color: '#4b5563',
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 14,
            }}
          >
            ← Back to Dashboard
          </button>

          {/* Header stats */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 10 }}>
            <StatCard title="Open" count={stats.open} bgColor="#E0E8F9" icon={undefined} />
            <StatCard title="Accepted" count={stats.accepted} bgColor="#FEF9E0" icon={undefined} />
            <StatCard title="Resolved" count={stats.resolved} bgColor="#D1FADF" icon={undefined} />
            <StatCard title="Online Agents" count={0} bgColor="#fbeedfff" icon={undefined} />
          </div>

          {/* Main layout */}
          <div style={{ marginTop: 30 }}>
            {/* Main card with all ticket details */}
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '28px 32px',
                boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
              }}
            >
              {/* Header section */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 24,
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
                    {ticket.code}
                  </div>

                  {/* Performance Metrics below ticket ID */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 32,
                      marginBottom: 16,
                      paddingTop: 8,
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        Estimated resolution
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                        {formatDuration(estimatedMinutes)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        Actual resolution
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                        {formatDuration(actualMinutes)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                        Performance
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: performanceColor }}>
                        {performanceLabel}
                      </div>
                    </div>
                  </div>

                  {/* Status and priority badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        padding: '6px 16px',
                        borderRadius: 999,
                        background: '#eef2ff',
                        color: '#4f46e5',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {ticket.status.toUpperCase()}
                    </div>
                    <div
                      style={{
                        padding: '6px 16px',
                        borderRadius: 999,
                        background: '#fef2f2',
                        color: priorityColor(),
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {ticket.priority.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>
                      Created {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Right-side action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {ticket.status === 'open' && (
                    <button
                      onClick={handleAccept}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      Accept Ticket
                    </button>
                  )}
                  {ticket.status === 'accepted' && (
                    <button
                      onClick={handleResolve}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: 'none',
                        background: '#16a34a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      Resolve Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Two-column layout for details */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                {/* Left column */}
                <div>
                  {/* Client and Handler Info */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 16,
                        color: '#111827',
                      }}
                    >
                      Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          Client
                        </div>
                        <div
                          style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
                        >
                          {ticket.client.name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          Handler
                        </div>
                        <div
                          style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
                        >
                          {ticket.acceptedBy ? ticket.acceptedBy.name : 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Domain section */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 16,
                        color: '#111827',
                      }}
                    >
                      Domain
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          Domain
                        </div>
                        <div
                          style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
                        >
                          {ticket.masterDomain || 'No domain provided.'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          Subject
                        </div>
                        <div
                          style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
                        >
                          {ticket.subject || 'No subject provided.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional details */}
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 16,
                        color: '#111827',
                      }}
                    >
                      Description
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          color: '#374151',
                          lineHeight: 1.6,
                          padding: 16,
                          background: '#f9fafb',
                          borderRadius: 8,
                        }}
                      >
                        {ticket.additional_comment || 'No description provided.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Timeline section */}
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 16,
                      color: '#111827',
                    }}
                  >
                    Timeline
                  </div>
                  <div style={{ position: 'relative', paddingLeft: 20 }}>
                    {/* Timeline line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 6,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: '#e5e7eb',
                      }}
                    ></div>

                    {/* Timeline items */}
                    <div style={{ marginBottom: 32, position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: -20,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: '#10b981',
                          border: '2px solid #fff',
                          zIndex: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: 4,
                        }}
                      >
                        Created
                      </div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>
                        {formatDateTime(ticket.createdAt)}
                      </div>
                    </div>

                    <div style={{ marginBottom: 32, position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: -20,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: ticket.acceptedAt ? '#3b82f6' : '#d1d5db',
                          border: '2px solid #fff',
                          zIndex: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: 4,
                        }}
                      >
                        Accepted
                      </div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>
                        {ticket.acceptedAt
                          ? formatDateTime(ticket.acceptedAt)
                          : 'Not accepted yet'}
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: -20,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: ticket.resolvedAt ? '#8b5cf6' : '#d1d5db',
                          border: '2px solid #fff',
                          zIndex: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: 4,
                        }}
                      >
                        Resolved
                      </div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>
                        {ticket.resolvedAt
                          ? formatDateTime(ticket.resolvedAt)
                          : 'Not resolved yet'}
                      </div>
                    </div>
                  </div>

                  {/* Suggested Handler */}
                  <div
                    style={{
                      marginTop: 40,
                      padding: 20,
                      background: '#fef3c7',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: '#92400e',
                      }}
                    >
                      Suggested Handler
                    </div>
                    <div style={{ fontSize: 14, color: '#92400e' }}>
                      {suggestionsError ? 'Not-suggested' : suggestedName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        value={estimatedDate}
        onChange={e => setEstimatedDate(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}  // No past dates
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          marginBottom: 16,
          fontSize: 14,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          variant="default"
          onClick={() => {
            setEtaModalOpen(false);
            setPendingTicketId(null);
            setEstimatedDate('');
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirmAccept}
          disabled={!estimatedDate}
        >
          Confirm & Accept
        </Button>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
}
