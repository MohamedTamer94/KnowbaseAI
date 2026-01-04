import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div>
      <h2>Settings</h2>
      <div style={{ marginTop: 12 }}>
        <div><strong>Email:</strong> you@example.com</div>
        <div style={{ marginTop: 8 }}><strong>Tenant:</strong> Example Tenant</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
