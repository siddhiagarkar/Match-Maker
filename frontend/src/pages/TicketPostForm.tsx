import { useContext, useEffect, useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import API from '../api';
import Dropdown from '../components/Dropdown';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '../components/ChatHeader';

export default function TicketPostForm() {
  const [priority, setPriority] = useState('');
  const [masterDomain, setMasterDomain] = useState('');
  const [subDomain, setSubDomain] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const user = useContext(AuthContext);
  const navigate = useNavigate();

  // Guard: only clients can access this page
  useEffect(() => {
    if (!user) return; // can also redirect to login here
    if (user.role !== 'client') {
      navigate('/'); // or '/employee/dashboard'
      // alert('Unauthorized') 
    }
  }, [user, navigate]);

  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const domainOptions = [
    { value: '', label: 'Select domain' },
    { value: 'tech', label: 'Tech Support' },
    { value: 'hr', label: 'HR' },
    { value: 'sales', label: 'Sales' },
    { value: 'other', label: 'Other' }
  ];

  const subdomainOptionsMap: { [key: string]: { value: string; label: string }[] } = {
    tech: [
      { value: 'hardware', label: 'Hardware' },
      { value: 'software', label: 'Software' },
      { value: 'network', label: 'Network issue' }
    ],
    hr: [
      { value: 'payroll', label: 'Payroll' },
      { value: 'recruitment', label: 'Recruitment' }
    ],
    sales: [
      { value: 'leads', label: 'New leads' },
      { value: 'records', label: 'Update records' }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!priority) {
      setError('Priority is required.');
      return;
    }
    if (!masterDomain) {
      setError('Domain is required.');
      return;
    }
    if (masterDomain === 'other' && !subject.trim()) {
      setError('Please specify your subject for "Other" domain.');
      return;
    }
    if (masterDomain !== 'other' && subdomainOptionsMap[masterDomain] && !subDomain) {
      setError('Please select a subdomain.');
      return;
    }
    if (masterDomain == 'other' && !subject.trim()) {
      setError('Please provide a brief description of your issue.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        priority,
        masterDomain,
        subDomain: masterDomain !== 'other' ? subDomain : undefined,
        subject
      };
      await API.post('/tickets', payload);
      setSuccess('Ticket posted successfully!');
      setPriority('');
      setMasterDomain('');
      setSubDomain('');
      setSubject('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to post ticket.');
    } finally {
      setLoading(false);
    }
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
        onDashboard={() => navigate('/client/tickets')}
        onChat={() => navigate('/chat')}
        onLogout={() => {
          // add your logout logic here
          navigate('/login');
        }}
        userName={user?.name || 'Current User'}
        userInitials={userInitials}
        online={true}
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '3.5rem 1rem 2.5rem'
        }}
      >
        <ChatHeader onBack={() => 
                  {navigate('/chat') }
                } 
                  title={user?.role === 'client' ? 'My Tickets' : 'Ticket Dashboard'}
                  />
        
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
            padding: '2.3rem 2.6rem',
            border: '1px solid #eef0f7',
            marginTop: '5%'
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 6,
              color: '#111827'
            }}
          >
            How can we help?
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 18 }}>
            Create a ticket and our team will get back to you as soon as possible.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: '0.55rem 0.85rem',
                borderRadius: 14,
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: 13.5
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                marginBottom: 12,
                padding: '0.55rem 0.85rem',
                borderRadius: 14,
                background: '#ecfdf3',
                color: '#166534',
                fontSize: 13.5
              }}
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6 }}
          >
            {/* First row: priority + domain */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Dropdown
                  label="Priority"
                  options={priorityOptions}
                  value={priority}
                  onChange={setPriority}
                  required
                  style={{
                    borderRadius: 999,
                    borderColor: '#e5e7eb',
                    padding: '0.55rem 0.9rem',
                    background: '#f9fafb',
                    paddingBlock: '1rem',
                    paddingBlockStart: '0.9rem',
                    paddingBlockEnd: '0.9rem',
              
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Dropdown
                  label="Domain"
                  options={domainOptions}
                  value={masterDomain}
                  onChange={val => {
                    setMasterDomain(val);
                    setSubDomain('');
                  }}
                  required
                  style={{
                    borderRadius: 999,
                    borderColor: '#e5e7eb',
                    padding: '0.55rem 0.9rem',
                    background: '#f9fafb',
                    paddingBlock: '1rem',
                    paddingBlockStart: '0.9rem',
                    paddingBlockEnd: '0.9rem',
                  }}
                />
              </div>
            </div>

            {masterDomain && masterDomain !== 'other' && subdomainOptionsMap[masterDomain] && (
              <Dropdown
                label="Subdomain"
                options={[
                  { value: '', label: 'Select subdomain' },
                  ...subdomainOptionsMap[masterDomain]
                ]}
                value={subDomain}
                onChange={setSubDomain}
                required
                style={{
                  borderRadius: 999,
                  borderColor: '#e5e7eb',
                  padding: '0.55rem 0.9rem',
                  background: '#f9fafb'
                }}
              />
            )}

            <Input
              label={masterDomain === 'other' ? 'How can we help you?' : 'Describe your request'}
              type="text"
              value={subject}
              placeholder={
                masterDomain === 'other'
                  ? 'Briefly describe the problem…'
                  : 'Add any additional details or context…'
              }
              onChange={e => setSubject(e.target.value)}
              style={{
                borderRadius: 18,
                borderColor: '#e5e7eb',
                background: '#f9fafb',
                padding: '0.7rem 0.9rem'
              }}
            />

            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: 999,
                  padding: '0.7rem 1.9rem',
                  fontSize: 15,
                  fontWeight: 600,
                  background: loading ? '#d1d5db' : '#2563eb',
                  color: '#fff',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
                  width: '100%',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Submitting…' : 'SEND QUERY'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
