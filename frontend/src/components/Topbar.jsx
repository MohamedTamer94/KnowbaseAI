import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import { TenantContext } from '../contexts/TenantContext';

export default function Topbar() {
    const {tenant, loading} = React.useContext(TenantContext);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="topbar">
      <div className="tenant">{loading ? 'Loading...' : tenant?.name || 'No Tenant'}</div>
      <div className="user-actions">
        <button onClick={handleLogout} title="Logout">Logout</button>
      </div>
    </div>
  );
}
