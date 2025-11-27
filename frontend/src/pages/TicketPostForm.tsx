import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import API from '../api';
import Dropdown from '../components/Dropdown';

export default function TicketPostForm() {
    const [priority, setPriority] = useState('');
    const [masterDomain, setMasterDomain] = useState('');
    const [subDomain, setSubDomain] = useState('');
    const [subject, setSubject] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const priorityOptions = [
        { value: '', label: 'Select Priority' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
    ];

    const domainOptions = [
        { value: '', label: 'Select Domain' },
        { value: 'tech', label: 'Tech Support' },
        { value: 'hr', label: 'HR' },
        { value: 'sales', label: 'Sales' },
        { value: 'other', label: 'Other' }
    ];

    const subdomainOptionsMap: { [key: string]: { value: string; label: string }[] } = {
        tech: [
            { value: 'hardware', label: 'Hardware' },
            { value: 'software', label: 'Software' },
            { value: 'network', label: 'Network Issue' }
        ],
        hr: [
            { value: 'payroll', label: 'Payroll' },
            { value: 'recruitment', label: 'Recruitment' }
        ],
        sales: [
            { value: 'leads', label: 'New Leads' },
            { value: 'records', label: 'Update Records' }
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

        // If domain is OTHER, subject is required
        if (masterDomain === 'other' && !subject.trim()) {
            setError('Please specify your subject for "Other" domain.');
            return;
        }

        // If domain is not OTHER, subDomain required
        if (masterDomain !== 'other' && subdomainOptionsMap[masterDomain] && !subDomain) {
            setError('Please select a subdomain.');
            return;
        }

        // Always require subject for clarity
        if (!subject.trim()) {
            setError('Subject is required.');
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                priority,
                masterDomain: masterDomain,
                subDomain: masterDomain !== 'other' ? subDomain : undefined,
                subject
            };
            await API.post('/tickets', payload);
            setSuccess('Ticket posted successfully!');
            // Reset form
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

    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #ececec', padding: 24 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2>Post a Support Ticket</h2>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
                <Dropdown
                    label="Priority"
                    options={priorityOptions}
                    value={priority}
                    onChange={setPriority}
                    required
                />
                <Dropdown
                    label="Domain"
                    options={domainOptions}
                    value={masterDomain}
                    onChange={val => {
                        setMasterDomain(val);
                        setSubDomain('');
                        setSubject('');
                    }}
                    required
                />

                {/* Subdomain dropdown only if masterDomain not OTHER */}
                {masterDomain && masterDomain !== 'other' && subdomainOptionsMap[masterDomain] && (
                    <Dropdown
                        label="Subdomain"
                        options={[
                            { value: '', label: 'Select Subdomain' },
                            ...subdomainOptionsMap[masterDomain]
                        ]}
                        value={subDomain}
                        onChange={setSubDomain}
                        required
                    />
                )}

                {/* If masterDomain is "Other" or ANY, subject input always shown */}
                <Input
                    label={masterDomain === 'other' ? "How can we help you?" : "Additional comments (if any)"}
                    type="text"
                    value={subject}
                    required
                    placeholder={masterDomain === 'other'
                        ? "Describe your issue"
                        : "What do you need help with?"}
                    onChange={e => setSubject(e.target.value)}
                />

                <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Post Ticket'}
                </Button>
            </form>
        </div>
    );
}
