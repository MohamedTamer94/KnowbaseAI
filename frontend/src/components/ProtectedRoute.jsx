import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = parseJwt(token);
  console.log(payload)
  if (!payload) {
    // invalid token
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // If no tenant_id in token, send user to tenant selection
  if (!payload.tenant_id) {
    return <Navigate to="/select-tenant" replace />;
  }

  return <Outlet />;
}
