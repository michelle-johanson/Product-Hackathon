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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3 className="modal-title">{file.name}</h3>

        <div className="preview-body">
          {file.type === 'PDF' ? (
            <iframe
              src={fileUrl}
              className="pdf-preview-frame"
              title={file.name}
            />
          ) : loading ? (
            <p>Loading preview...</p>
          ) : (
            <div className="md-preview-body">
              <ReactMarkdown>{mdContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
