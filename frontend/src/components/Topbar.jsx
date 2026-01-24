import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import { TenantContext } from '../contexts/TenantContext';
import { listUserTenants, switchTenant } from '../api/tenant';

export default function Topbar() {
    const { tenant, loading, refetch } = React.useContext(TenantContext);
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [switchingTenantId, setSwitchingTenantId] = useState(null);

    useEffect(() => {
        loadTenants();
    }, []);

    async function loadTenants() {
        try {
            const data = await listUserTenants();
            setTenants(data);
        } catch (err) {
            console.error('Failed to load tenants:', err);
        }
    }

    async function handleSwitchTenant(tenantId) {
        setSwitchingTenantId(tenantId);
        try {
            const response = await switchTenant(tenantId);
            // Update token in localStorage
            localStorage.setItem('token', response.access_token);
            // Clear chat session when switching tenants
            localStorage.removeItem('chatSessionId');
            setShowDropdown(false);
            // Reload tenant data
            window.location.reload();
        } catch (err) {
            console.error('Failed to switch tenant:', err);
        } finally {
            setSwitchingTenantId(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('chatSessionId');
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <div className="topbar">
            <div className="tenant-selector">
                <button
                    className="tenant-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : tenant?.name || 'No Tenant'}
                    <span className="dropdown-icon">▼</span>
                </button>

                {showDropdown && tenants.length > 0 && (
                    <div className="tenant-dropdown">
                        {tenants.map((t) => (
                            <button
                                key={t.tenant_id}
                                className={`tenant-item ${t.tenant_id === tenant?.id ? 'active' : ''}`}
                                onClick={() => handleSwitchTenant(t.tenant_id)}
                                disabled={switchingTenantId === t.tenant_id}
                            >
                                <span>{t.name}</span>
                                {t.tenant_id === tenant?.id && <span className="checkmark">✓</span>}
                                {switchingTenantId === t.tenant_id && <span className="loading-text">...</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="user-actions">
                <button onClick={handleLogout} title="Logout">Logout</button>
            </div>
        </div>
    );
}
