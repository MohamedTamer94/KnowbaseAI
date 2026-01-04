import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectTenant() {
  const navigate = useNavigate();

  function chooseTenant() {
    // In a real app, you'd call the backend to set the active tenant.
    // For now, just redirect back to dashboard.
    navigate('/app/dashboard');
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Select Tenant</h2>
      <p className="small-muted">You don't have an active tenant. Choose one to continue.</p>
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={chooseTenant}>Select Example Tenant</button>
      </div>
    </div>
  );
}
