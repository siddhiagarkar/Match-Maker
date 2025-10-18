import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await API.post('auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/chat');
        } catch (error) {
            setErr(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="center-container">
            <form className="form-box"  onSubmit={handleLogin} style={{ width: 350, margin: '3rem auto', textAlign: 'center' }}>
            <h2>Login</h2>
            {err && <div style={{ color: 'red' }}>{err}</div>}
            <Input label="Email" type="email" value={email} required onChange={e => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} required onChange={e => setPassword(e.target.value)} />
            <Button type="submit">Login</Button>
            </form>
        </div>
    );
}
