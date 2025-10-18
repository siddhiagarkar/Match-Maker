import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post('auth/register', { name, email, password, role });
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
            <Button type="submit">Register</Button>
            </form>
        </div>
    );
}
