import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '../api';
import Input from '../components/Input';
import Button from '../components/Button';
import type { User } from '../types/User';

export default function Login({ setUser }: { setUser: (u: User) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await API.post('auth/login', { email, password });
            const token = res.data.token;
            localStorage.setItem('token', token);

            // Decode JWT right now to populate user context
            const decoded = jwtDecode(token);
            setUser({
                _id: decoded.sub || decoded.id || decoded.userId,
                name: decoded.name || decoded.username || ""
            });

            navigate('/chat');
        } catch (error) {
            setErr(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="center-container">
            <form
                className="form-box"
                onSubmit={handleLogin}
                style={{ width: 350, margin: '3rem auto', textAlign: 'center' }}
            >
                <h2>Login</h2>
                {err && <div style={{ color: 'red' }}>{err}</div>}
                <Input label="Email" type="email" value={email} required onChange={e => setEmail(e.target.value)} />
                <Input label="Password" type="password" value={password} required onChange={e => setPassword(e.target.value)} />
                <Button type="submit">Login</Button>
            </form>
        </div>
    );
}
