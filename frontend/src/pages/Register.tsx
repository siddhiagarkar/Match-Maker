import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Input from '../components/Input';
import Button from '../components/Button';


const DOMAIN_OPTIONS = [
    "Tech Support",
    "HR",
    "Finance",
    "Legal",
    "Sales",
    "Customer Service",
    "IT",
    "Operations"
];

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const [domains, setDomains] = useState<string[]>([]);


    function DomainSelector({ domains, onChange }) {
        const handleChange = (e) => {
            const val = e.target.value;
            onChange(
                e.target.checked
                    ? [...domains, val]
                    : domains.filter(d => d !== val)
            );
        };

        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem 2.5rem",
                maxHeight: "240px",
                overflowY: "auto",
                paddingBottom: "1rem"
            }}>
                {DOMAIN_OPTIONS.map(opt => (
                    <label
                        key={opt}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                    >
                        <input
                            type="checkbox"
                            value={opt}
                            checked={domains.includes(opt)}
                            onChange={handleChange}
                            style={{ accentColor: "#007bff" }} // Optional: blue check
                        />
                        <span style={{ fontWeight: "500", fontSize: "1rem" }}>
                            {opt}
                        </span>
                    </label>
                ))}
            </div>
        );
    }



    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // For agents, send domains array; else, omit it or send empty
            const userData = { name, email, password, role, domains };
            if (role === "agent")
            {
                userData["domains"] = domains;
            }
            await API.post('auth/register', userData);
            navigate('/login');
        } catch (error: any) {
            setErr(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="center-container">
        <form className="form-box" onSubmit={handleRegister} style={{ width: 350, margin: '3rem auto', textAlign: 'center' }}>
            <h2>Register</h2>
                {err && <div style={{ color: 'red' }}>{err}</div>}
                <Input label="Name" type="text" value={name} required onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} required onChange={e => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} required onChange={e => setPassword(e.target.value)} />
            <div style={{ marginBottom: '1rem' }}>
                <label>
                    Role<br />
                    <select value={role} onChange={e => setRole(e.target.value)}>
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>
            </div>

                {/* Show if role is agent */}
                {role === "agent" && (
                    <div style={{
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "0.75rem",
                        background: "#fafbfc",
                        marginBottom: "1rem",
                        overflow: "auto"
                    }}>
                        <strong style={{ fontSize: "1rem" }}>Specialization Domains (choose multiple):</strong>
                        <DomainSelector domains={domains} onChange={setDomains} />
                    </div>

                )}

            <Button type="submit">Register</Button>
            </form>
        </div>
    );
}
