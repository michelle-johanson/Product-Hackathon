import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function FilePreviewModal({ file, onClose }) {
  const [mdContent, setMdContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fileUrl = `http://localhost:3000/uploads/${file.url}`;

  useEffect(() => {
    if (file.type !== 'MD') return;

    setLoading(true);
    fetch(fileUrl)
      .then(res => res.ok ? res.text() : Promise.reject('Failed to load'))
      .then(text => setMdContent(text))
      .catch(() => setMdContent('Failed to load file content.'))
      .finally(() => setLoading(false));
  }, [file, fileUrl]);

  // Fix for line breaks: Markdown ignores single newlines. 
  // We replace single newlines with "  \n" (two spaces + newline) to force a visual break.
  const formatMarkdown = (content) => {
    if (!content) return '';
    return content.replace(/\n/g, '  \n');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3 className="modal-title">{file.name}</h3>
          <div className="preview-header-actions">
            <a href={fileUrl} target="_blank" rel="noreferrer" className="btn-download" download>
              Download
            </a>
            <button className="modal-close-btn-inline" onClick={onClose}>&times;</button>
          </div>
        </div>

        {/* Dynamic Class: md-view removes the grey bars, pdf-view keeps them */}
        <div className={`preview-body ${file.type === 'PDF' ? 'pdf-view' : 'md-view'}`}>
          {file.type === 'PDF' ? (
            <iframe
              src={fileUrl}
              className="pdf-preview-frame"
              title={file.name}
            />
          ) : loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading preview...</div>
          ) : (
            <div className="md-preview-body">
              <ReactMarkdown>{formatMarkdown(mdContent)}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}