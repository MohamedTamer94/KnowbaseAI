import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TenantContext } from '../contexts/TenantContext';
import { getTenant, getTenantUsers, inviteUserToTenant, removeUserFromTenant, getCurrentUser } from '../api/tenant';
import '../styles/settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { tenant } = useContext(TenantContext);
  const [removingEmail, setRemovingEmail] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      
      // Get tenant info
      setIsAdmin(tenant?.role === 'admin');
      
      // Get users
      const usersData = await getTenantUsers();
      setUsers(usersData);
      
      // Get current user from localStorage (set during login)
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setError('');
    setSuccess('');
    setInviting(true);
    
    try {
      await inviteUserToTenant(inviteEmail);
      setSuccess(`${inviteEmail} invited successfully`);
      setInviteEmail('');
      setShowInviteDialog(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveUser(email) {
    if (!window.confirm(`Remove ${email} from tenant?`)) return;

    setError('');
    setSuccess('');
    setRemovingEmail(email);
    
    try {
      await removeUserFromTenant(email);
      setSuccess(`${email} removed successfully`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to remove user');
    } finally {
      setRemovingEmail(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('chatSessionId');
    navigate('/login');
  }

  if (loading) {
    return <div className="settings-page"><p>Loading...</p></div>;
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      
      {/* Tenant info */}
      <div className="settings-section">
        <h3>Tenant Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Tenant Name</label>
            <p>{tenant?.name || 'N/A'}</p>
          </div>
          {tenant?.document_count !== undefined && (
            <div className="info-item">
              <label>Documents</label>
              <p>{tenant.document_count}</p>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="settings-section">
        <h3>Your Account</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <p>{currentUser?.email || 'N/A'}</p>
          </div>
          <div className="info-item">
            <label>Role</label>
            <p className="role-badge" data-role={isAdmin ? 'admin' : 'member'}>
              {isAdmin ? 'Admin' : 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Team Members</h3>
          {isAdmin && (
            <button className="btn-small" onClick={() => setShowInviteDialog(true)}>Invite</button>
          )}
        </div>

        {users.length === 0 ? (
          <p className="no-data">No team members yet</p>
        ) : (
          <div className="users-list">
            {users.map((user) => (
              <div key={user.email} className="user-item">
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-role" data-role={user.role}>{user.role}</div>
                </div>
                {isAdmin && user.email !== currentUser?.email && (
                  <button
                    className="btn-remove"
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleRemoveUser(user.email)}
                    disabled={removingEmail === user.email}
                  >
                    {removingEmail === user.email ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite dialog */}
      {showInviteDialog && (
        <div className="overlay">
          <div className="dialog">
            <h3>Invite User</h3>
            <input
              className="input"
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="dialog-actions">
              <button className="btn" onClick={() => setShowInviteDialog(false)}>Cancel</button>
              <button className="btn" onClick={handleInvite} disabled={inviting}>
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* Logout */}
      <div className="settings-section">
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
