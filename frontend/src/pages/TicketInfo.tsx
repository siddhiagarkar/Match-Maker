import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

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

export default function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useContext(AuthContext);
  const navigate = useNavigate();

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

  const diffMinutes = (from?: string, to?: string) => {
    if (!from || !to) return null;
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60));
  };

  // Metrics
  const estimatedMinutes = diffMinutes(ticket?.acceptedAt, ticket?.estimatedResolutionAt);
  const actualMinutes = diffMinutes(ticket?.acceptedAt, ticket?.resolvedAt);

  let performanceLabel = 'N/A';
  if (estimatedMinutes != null && actualMinutes != null) {
    if (actualMinutes <= estimatedMinutes) performanceLabel = 'On time or faster';
    else performanceLabel = 'Delayed';
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

  const priorityPillStyle = () => {
    switch (ticket.priority) {
      case 'urgent':
        return { bg: '#fee2e2', color: '#b91c1c' };
      case 'high':
        return { bg: '#ffedd5', color: '#c2410c' };
      case 'medium':
        return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'low':
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const priorityStyle = priorityPillStyle();

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

          {/* Header card */}
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
                {ticket.code}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#eef2ff',
                  color: '#4f46e5',
                  fontWeight: 600,
                }}
              >
                {ticket.status.toUpperCase()}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: priorityStyle.bg,
                  color: priorityStyle.color,
                  fontWeight: 600,
                }}
              >
                {ticket.priority.toUpperCase()} PRIORITY
              </span>
              <span style={{ color: '#9ca3af' }}>
                Created {formatDateTime(ticket.createdAt)}
              </span>
            </div>
          </div>

          {/* Main layout: 2 columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              gap: 18,
            }}
          >
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Domain */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Domains
                </div>
                <div style={{ fontSize: 15, color: '#374151' }}>
                  {ticket.masterDomain || 'No master domain provided.'}
                </div>
                <div style={{ fontSize: 15, color: '#374151' }}>
                  {ticket.subDomain || 'No sub domain provided.'}
                </div>
              </div>


              {/* Subject */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Subject
                </div>
                <div style={{ fontSize: 15, color: '#374151' }}>
                  {ticket.subject || 'No subject provided.'}
                </div>
              </div>

              {/* Additional comments */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                  Additional Comments
                </div>
                <div style={{ fontSize: 15, color: '#374151', whiteSpace: 'pre-wrap' }}>
                  {ticket.additional_comment || 'No additional comments.'}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* People */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>People</div>

                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Client:</strong> {ticket.client.name}
                </div>

                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Accepted By:</strong>{' '}
                  {ticket.acceptedBy ? ticket.acceptedBy.name : '-'}
                </div>
              </div>

              {/* Timings */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Timestamps</div>

                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Posted:</strong> {ticket.createdAt ? formatDateTime(ticket.createdAt) : '-'}
                </div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Accepted:</strong> {ticket.acceptedAt ? formatDateTime(ticket.acceptedAt) : '-'}
                </div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Resolved:</strong> {ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : '-'}
                </div>

                {/* <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Accepted By:</strong>{' '}
                  {ticket.acceptedBy ? ticket.acceptedBy.name : '-'}
                </div> */}
              </div>

              {/* Metrics */}
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '16px 18px',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Metrics</div>

                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Estimated Resolution Time:</strong>{' '}
                  {estimatedMinutes != null ? `${estimatedMinutes} minutes` : '-'}
                </div>

                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Actual Resolution Time:</strong>{' '}
                  {actualMinutes != null ? `${actualMinutes} minutes` : '-'}
                </div>

                <div style={{ fontSize: 14 }}>
                  <strong>Performance:</strong> {performanceLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
