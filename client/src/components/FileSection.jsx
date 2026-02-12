import { useState, useEffect } from 'react';

export default function FileSection({ groupId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/files/${groupId}`, {
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
  };

  useEffect(() => {
    fetchFiles();
  }, [groupId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
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
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Content-Type is automatically set by browser for FormData
        },
        body: formData
      });

      if (res.ok) {
        await fetchFiles(); // Refresh list
      } else {
        alert('Failed to upload file');
      }
    } catch (err) {
      console.error("Upload error", err);
      alert('Network error during upload');
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
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

      <div className="file-list">
        {loading ? <p>Loading files...</p> : files.length === 0 ? <p className="chat-empty">No files uploaded yet.</p> : files.map(file => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <span className="file-icon">{file.type === 'PDF' ? '📄' : '📝'}</span>
              <div className="file-meta">
                <span className="file-name">{file.name}</span>
                <span className="file-uploader">Uploaded by {file.user?.name} • {new Date(file.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <a href={`http://localhost:3000/uploads/${file.url}`} target="_blank" rel="noreferrer" className="btn-download" download>
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}