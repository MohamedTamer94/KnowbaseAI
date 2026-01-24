import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">KnowbaseAI</div>
      <nav className="nav" aria-label="Main navigation">
        <NavLink to="/app/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/app/documents" className={({isActive}) => isActive ? 'active' : ''}>Documents</NavLink>
        <NavLink to="/app/chat" className={({isActive}) => isActive ? 'active' : ''}>Chat</NavLink>
        <NavLink to="/app/widgets" className={({isActive}) => isActive ? 'active' : ''}>Widgets</NavLink>
        <NavLink to="/app/settings" className={({isActive}) => isActive ? 'active' : ''}>Settings</NavLink>
      </nav>
    </aside>
  );
}
