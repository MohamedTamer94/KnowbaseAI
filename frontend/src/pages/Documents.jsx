import React from 'react';
import { listDocuments, uploadDocument, deleteDocument, updateDocumentName } from '../api/tenant';
import { formatDate } from '../utils/utils';
import '../styles/document.css';

export default function Documents() {
    const [documents, setDocuments] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [showUrlDialog, setShowUrlDialog] = React.useState(false);
    const [urlInput, setUrlInput] = React.useState('');
    const [openDocMenu, setOpenDocMenu] = React.useState(null);
    const [renameDialog, setRenameDialog] = React.useState(null);
    const [renamingId, setRenamingId] = React.useState(null);
    const [renameValue, setRenameValue] = React.useState('');
    const [deletingId, setDeletingId] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const menuRef = React.useRef(null);
    const addBtnRef = React.useRef(null);

    React.useEffect(() => {
        refresh();
    }, []);

    async function refresh() {
        try {
            const docs = await listDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        }
    }

    function handleChooseFile() {
        setError('');
        fileInputRef.current?.click();
    }

    // click outside handler for menu
    React.useEffect(() => {
        function onDocClick(e) {
            if (!menuRef.current || !addBtnRef.current) return;
            if (menuRef.current.contains(e.target) || addBtnRef.current.contains(e.target)) return;
            setMenuOpen(false);
        }
        if (menuOpen) {
            document.addEventListener('mousedown', onDocClick);
            return () => document.removeEventListener('mousedown', onDocClick);
        }
    }, [menuOpen]);

    // helper that handles file upload
    async function uploadFile(file) {
        setError('');
        setSuccess('');
        setUploading(true);
        try {
            await uploadDocument({ file });
            setSuccess('File uploaded successfully.');
            await refresh();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed.');
        } finally {
            setUploading(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    // helper that handles URL crawl upload
    async function uploadUrl(websiteUrl) {
        setError('');
        setSuccess('');
        if (!websiteUrl || !websiteUrl.trim()) {
            setError('Please enter a valid URL.');
            return;
        }
        setUploading(true);
        try {
            await uploadDocument({ url: websiteUrl.trim() });
            setSuccess('Website submitted for crawling.');
            await refresh();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    }

    function handleFileChange(e) {
        setError('');
        setSuccess('');
        const f = e.target.files && e.target.files[0];
        if (f) {
            setSelectedFile(f);
            // Immediately upload the selected file
            uploadFile(f);
        }
    }

    async function handleDelete(docId) {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        
        setError('');
        setSuccess('');
        setDeletingId(docId);
        try {
            await deleteDocument(docId);
            setSuccess('Document deleted successfully.');
            setOpenDocMenu(null);
            await refresh();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Delete failed.');
        } finally {
            setDeletingId(null);
        }
    }

    function openRenameDialog(doc) {
        setRenameDialog(doc);
        setRenameValue(doc.filename);
        setOpenDocMenu(null);
    }

    async function handleRename() {
        if (!renameValue.trim()) {
            setError('Please enter a filename.');
            return;
        }

        setError('');
        setSuccess('');
        setRenamingId(renameDialog.id);
        try {
            await updateDocumentName(renameDialog.id, renameValue);
            setSuccess('Document renamed successfully.');
            setRenameDialog(null);
            await refresh();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Rename failed.');
        } finally {
            setRenamingId(null);
        }
    }

  return (
    <div>
      <div className="documents-header">
        <h2>Documents</h2>
        <div className="add-btn-wrapper">
          <button ref={addBtnRef} className="btn" onClick={() => setMenuOpen((s) => !s)} aria-haspopup="true" aria-expanded={menuOpen}>
            Add Document
          </button>

          {menuOpen && (
            <div ref={menuRef} className="add-menu">
              <button className="menu-item" onClick={() => { setMenuOpen(false); handleChooseFile(); }}>Upload file</button>
              <button className="menu-item" onClick={() => { setMenuOpen(false); setShowUrlDialog(true); }}>Crawl website</button>
            </div>
          )}
        </div>
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        className="hidden-file"
        onChange={handleFileChange}
      />

      {/* URL dialog */}
      {showUrlDialog && (
        <div className="url-overlay">
          <div className="url-dialog">
            <h3>Crawl website</h3>
            <p className="small-muted">Enter the website URL to crawl and extract documents.</p>
            <input className="input" placeholder="https://example.com" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
            <div className="dialog-actions">
              <button className="btn" onClick={() => { setShowUrlDialog(false); setUrlInput(''); }}>Cancel</button>
              <button className="btn" onClick={() => { setShowUrlDialog(false); uploadUrl(urlInput); setUrlInput(''); }} disabled={uploading}>{uploading ? 'Submitting...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      {renameDialog && (
        <div className="url-overlay">
          <div className="url-dialog">
            <h3>Rename document</h3>
            <input className="input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="New filename" />
            <div className="dialog-actions">
              <button className="btn" onClick={() => setRenameDialog(null)}>Cancel</button>
              <button className="btn" onClick={handleRename} disabled={renamingId !== null}>{renamingId ? 'Renaming...' : 'Rename'}</button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error message">{error}</div>}
      {success && <div className="success message">{success}</div>}

      <div className="table" role="table" aria-label="Documents">
        <header>
          <div>Name</div>
          <div>Type</div>
          <div>Status</div>
          <div>Created at</div>
          <div style={{ width: '40px' }}></div>
        </header>
        {documents.map((doc) => (
          <div className="row" key={doc.id || doc.filename}>
            <div>{doc.filename}</div>
            <div>{doc.type}</div>
            <div>{doc.status}</div>
            <div>{formatDate(doc.created_at)}</div>
            <div className="doc-actions">
              <button 
                className="action-btn" 
                onClick={() => setOpenDocMenu(openDocMenu === doc.id ? null : doc.id)}
                aria-label="Document actions"
              >
                ⋮
              </button>
              {openDocMenu === doc.id && (
                <div className="doc-menu">
                  <button 
                    className="menu-item" 
                    onClick={() => openRenameDialog(doc)}
                    disabled={renamingId === doc.id}
                  >
                    Rename
                  </button>
                  <button 
                    className="menu-item delete" 
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
