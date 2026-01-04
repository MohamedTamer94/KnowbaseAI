import React from 'react';
import { listDocuments, uploadDocument } from '../api/tenant';
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

      {error && <div className="error message">{error}</div>}
      {success && <div className="success message">{success}</div>}

      <div className="table" role="table" aria-label="Documents">
        <header>
          <div>Name</div>
          <div>Type</div>
          <div>Status</div>
          <div>Created at</div>
        </header>
        {documents.map((doc) => (
          <div className="row" key={doc.id || doc.filename}>
            <div>{doc.filename}</div>
            <div>{doc.type}</div>
            <div>{doc.status}</div>
            <div>{formatDate(doc.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
