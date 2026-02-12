import { useState, useEffect, useCallback } from 'react';
import FilePreviewModal from './FilePreviewModal';

export default function FileSection({ groupId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  const fetchFiles = useCallback(async (search = '') => {
    const token = localStorage.getItem('token');
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    try {
      const res = await fetch(`http://localhost:3000/api/files/${groupId}${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Failed to load files", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Debounce search requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchFiles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.md')) {
      alert('Only PDF and Markdown (.md) files are allowed.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/files/${groupId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        await fetchFiles(searchQuery);
      } else {
        alert('Failed to upload file');
      }
    } catch (err) {
      console.error("Upload error", err);
      alert('Network error during upload');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchFiles(searchQuery);
      } else {
        alert('Failed to delete file');
      }
    } catch (err) {
      console.error("Delete error", err);
      alert('Network error during delete');
    }
  };

  return (
    <div className="card file-section-card">
      <div className="notes-header">
        <h3 className="notes-title">Group Files</h3>
        <div className="notes-controls">
          <label className={`btn-save file-upload-label ${uploading ? 'disabled' : ''}`}>
            {uploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept=".pdf,.md"
              onChange={handleFileUpload}
              className="file-input-hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <input
        type="text"
        className="form-input file-search-input"
        placeholder="Deep search files by name or content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="file-list">
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p className="chat-empty">
            {searchQuery ? 'No files match your search.' : 'No files uploaded yet.'}
          </p>
        ) : (
          files.map(file => (
            <div key={file.id} className={`file-item ${file.contentMatch ? 'file-item-content-match' : ''}`}>
              <div className="file-info">
                <span className="file-icon">{file.type === 'PDF' ? '📄' : '📝'}</span>
                <div className="file-meta">
                  <span className="file-name">
                    {file.name}
                    {file.contentMatch && <span className="content-match-badge">Content match</span>}
                  </span>
                  <span className="file-uploader">Uploaded by {file.user?.name} • {new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="file-actions">
                <button className="btn-file-action btn-preview" onClick={() => setPreviewFile(file)}>
                  Preview
                </button>
                <a href={`http://localhost:3000/uploads/${file.url}`} target="_blank" rel="noreferrer" className="btn-file-action btn-download" download>
                  Download
                </a>
                <button className="btn-file-action btn-delete-file" onClick={() => handleDelete(file.id, file.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
