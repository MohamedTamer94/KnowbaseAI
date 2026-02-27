import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';
import { login } from '../api/tenant';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // basic client-side validation
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            // Create form data
            const data = await login(email, password);

            if (!res.ok) {
                setError(data.detail || data.message || 'Failed to login.');
                setLoading(false);
                return;
            }

            if (data.access_token) {
                localStorage.removeItem('chatSessionId');
                localStorage.setItem('token', data.access_token);
                navigate('/app');
            } else {
                setError('No access token received from server.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">KnowbaseAI</div>
                <div className="auth-subtitle">Sign in to your account</div>

                <form onSubmit={handleSubmit} aria-live="polite">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error" role="alert" aria-live="assertive">
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: 14 }}>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="small-muted" style={{ marginTop: 14 }}>
                    New here? <Link to="/signup" className="link">Create an account</Link>
                </div>
            </div>
        </div>
    );
}
