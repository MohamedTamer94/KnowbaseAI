// layouts/TenantLayout.jsx
import { Outlet } from 'react-router-dom';
import { TenantProvider } from '../contexts/TenantContext';

export default function TenantLayout() {
  return (
    <TenantProvider>
      <Outlet />
    </TenantProvider>
  );
}
