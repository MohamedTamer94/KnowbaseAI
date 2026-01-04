import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

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
            const res = await fetch('http://localhost:3002/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || data.message || 'Failed to create account.');
                setLoading(false);
                return;
            }

            setSuccess(data.message || 'Account created successfully. Redirecting to login...');
            // small delay to show success and then redirect to login
            setTimeout(() => {
                navigate('/login');
            }, 900);
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
                <div className="auth-subtitle">Create a new account</div>

                <form onSubmit={handleSubmit} aria-live="polite">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error" role="alert" aria-live="assertive">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success" role="status">
                            {success}
                        </div>
                    )}

                    <div style={{ marginTop: 14 }}>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>

                <div className="small-muted" style={{ marginTop: 14 }}>
                    Already have an account? <Link to="/login" className="link">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
