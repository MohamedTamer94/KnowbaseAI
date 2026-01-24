import React, { useEffect, useState, useContext } from 'react';
import { TenantContext } from '../contexts/TenantContext';
import { listWidgets, createWidget, updateWidget, deleteWidget } from '../api/tenant';
import '../styles/widgets.css';

export default function Widgets() {
  const { tenant } = useContext(TenantContext);
  const isAdmin = tenant?.role === 'admin';

  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [createdToken, setCreatedToken] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDomains, setFormDomains] = useState('');

  useEffect(() => {
    loadWidgets();
  }, []);

  async function loadWidgets() {
    try {
      setLoading(true);
      const data = await listWidgets();
      setWidgets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load widgets: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setFormName('');
    setFormDomains('');
    setCreatedToken(null);
    setCreateDialog(true);
  }

  function closeCreateDialog() {
    setCreateDialog(false);
    setFormName('');
    setFormDomains('');
  }

  function openEditDialog(widget) {
    setEditingWidget(widget);
    setFormName(widget.name);
    setFormDomains((widget.allowed_domains || []).join('\n'));
    setEditDialog(true);
  }

  function closeEditDialog() {
    setEditDialog(false);
    setEditingWidget(null);
    setFormName('');
    setFormDomains('');
  }

  async function handleCreate() {
    if (!formName.trim()) {
      setError('Widget name is required');
      return;
    }

    const domains = formDomains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    try {
      setError(null);
      const result = await createWidget(formName, domains);
      setWidgets([...widgets, result]);
      setSuccess('Widget created successfully!');
      setCreatedToken(result.public_token);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Failed to create widget: ' + (err.message || 'Unknown error'));
    }
  }

  async function handleUpdate() {
    if (!formName.trim()) {
      setError('Widget name is required');
      return;
    }

    const domains = formDomains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    try {
      setError(null);
      await updateWidget(editingWidget.id, formName, domains);
      setWidgets(widgets.map(w => w.id === editingWidget.id ? { ...w, name: formName, allowed_domains: domains } : w));
      setSuccess('Widget updated successfully!');
      closeEditDialog();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Failed to update widget: ' + (err.message || 'Unknown error'));
    }
  }

  async function handleDelete() {
    try {
      setError(null);
      await deleteWidget(deleteConfirm.id);
      setWidgets(widgets.filter(w => w.id !== deleteConfirm.id));
      setSuccess('Widget deleted successfully!');
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Failed to delete widget: ' + (err.message || 'Unknown error'));
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div className="widgets-page">
      <div className="page-header">
        <h2>Widgets</h2>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreateDialog}>+ New Widget</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="loading">Loading widgets...</div>
      ) : widgets.length === 0 ? (
        <div className="empty-state">
          <p>No widgets created yet</p>
          {isAdmin && <p className="text-muted">Create your first widget to get started</p>}
        </div>
      ) : (
        <div className="widgets-list">
          <div className="table">
            <div className="header">
              <div className="col-name">Name</div>
              <div className="col-domains">Allowed Domains</div>
              <div className="col-token">Token</div>
              {isAdmin && <div className="col-actions">Actions</div>}
            </div>

            {widgets.map((widget) => (
              <div key={widget.id} className="row">
                <div className="col-name">{widget.name}</div>
                <div className="col-domains">
                  {widget.allowed_domains && widget.allowed_domains.length > 0
                    ? widget.allowed_domains.join(', ')
                    : 'All domains'}
                </div>
                <div className="col-token">
                  <code className="token-display">{widget.public_token.substring(0, 16)}...</code>
                  <button className="copy-token-btn" onClick={() => copyToClipboard(widget.public_token)} title="Copy full token">Copy</button>
                  {!isAdmin && (
                    <span className="text-muted">(View only)</span>
                  )}
                </div>
                {isAdmin && (
                  <div className="col-actions">
                    <button className="action-btn" onClick={() => openEditDialog(widget)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(widget)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {createDialog && (
        <div className="overlay" onClick={closeCreateDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Widget</h3>
            {createdToken ? (
              <div className="token-display-section">
                <p className="text-muted">Your widget has been created! Copy the token below and use the code snippet to embed it.</p>
                
                <div className="token-box">
                  <label>Public Token:</label>
                  <div className="token-copy">
                    <code>{createdToken}</code>
                    <button className="copy-btn" onClick={() => copyToClipboard(createdToken)}>Copy</button>
                  </div>
                </div>

                <div className="code-snippet">
                  <label>Implementation:</label>
                  <p className="text-muted">Add this to your website's HTML:</p>
                  <pre><code>{`<script>
  window.KnowbaseChat = {
    token: "${createdToken}",
    theme: "light",
    position: "bottom-right"
  };
</script>
<script src="http://localhost:3002/static/embed.js"></script>`}</code></pre>
                  <button className="copy-btn" onClick={() => copyToClipboard(`<script>
  window.KnowbaseChat = {
    token: "${createdToken}",
    theme: "light",
    position: "bottom-right"
  };
</script>
<script src="http://localhost:3002/static/embed.js"><\/script>`)}>Copy Code</button>
                </div>

                <button className="btn-primary" onClick={closeCreateDialog}>Done</button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Widget Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Support Chat"
                  />
                </div>

                <div className="form-group">
                  <label>Allowed Domains</label>
                  <textarea
                    value={formDomains}
                    onChange={(e) => setFormDomains(e.target.value)}
                    placeholder="Enter one domain per line (leave blank for all)&#10;example.com&#10;sub.example.com"
                    rows={4}
                  />
                </div>

                <div className="dialog-actions">
                  <button className="btn-secondary" onClick={closeCreateDialog}>Cancel</button>
                  <button className="btn-primary" onClick={handleCreate}>Create Widget</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editDialog && (
        <div className="overlay" onClick={closeEditDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Widget</h3>
            <div className="form-group">
              <label>Widget Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Widget name"
              />
            </div>

            <div className="form-group">
              <label>Allowed Domains</label>
              <textarea
                value={formDomains}
                onChange={(e) => setFormDomains(e.target.value)}
                placeholder="Enter one domain per line (leave blank for all)"
                rows={4}
              />
            </div>

            <div className="dialog-actions">
              <button className="btn-secondary" onClick={closeEditDialog}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdate}>Update Widget</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Widget?</h3>
            <p>Are you sure you want to delete "<strong>{deleteConfirm.name}</strong>"? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
