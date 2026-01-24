import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import TenantLayout from './layouts/TenantLayout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import Widgets from './pages/Widgets';
import Settings from './pages/Settings';

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<TenantLayout />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="documents" element={<Documents />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="widgets" element={<Widgets />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
}
