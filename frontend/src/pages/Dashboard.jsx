import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TenantContext } from '../contexts/TenantContext';

export default function Dashboard() {
    const {tenant, loading} = React.useContext(TenantContext);
    const router = useNavigate();

    if (loading) {
        return <p>Loading tenant info...</p>;
    }
    if (!loading && !tenant) {
        return <p>No tenant information available.</p>;
    }
    return (
        <div>
            <h2>Welcome back to KnowbaseAI</h2>
            <p className="small-muted">Overview of your workspace</p>

            <div className="cards" aria-hidden>
                <div className="card">
                    <h3>Documents</h3>
                    <p>{tenant?.document_count || 0}</p>
                </div>
                <div className="card">
                    <h3>Users</h3>
                    <p>{tenant?.user_count || 0}</p>
                </div>
                <div className="card">
                    <h3>Status</h3>
                    <p>Knowledge base ready</p>
                </div>
            </div>
        </div>
    );
}
