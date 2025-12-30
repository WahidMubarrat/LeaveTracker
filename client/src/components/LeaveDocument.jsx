import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/LeaveDocument.css';

const LeaveDocument = ({ onDocumentChange, initialDocument }) => {
  const [documentFile, setDocumentFile] = useState(null);
  const [preview, setPreview] = useState(initialDocument || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (e.g., prescription, medical certificate)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Store the file object to be sent to backend
      setDocumentFile(file);
      onDocumentChange(file);
    }
  };

  const handleRemove = () => {
    setDocumentFile(null);
    setPreview(null);
    onDocumentChange(null);
    // Reset file input
    const fileInput = document.querySelector('#leaveDocument');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="leave-document-container">
      <label htmlFor="leaveDocument" className="leave-document-label">
        Leave Document (Optional)
        <span className="leave-document-hint">
          Upload supporting documents like prescription, medical certificate, etc.
        </span>
      </label>
      
      <div className="leave-document-upload-area">
        {!preview ? (
          <div className="leave-document-upload-placeholder">
            <input
              type="file"
              id="leaveDocument"
              name="leaveDocument"
              accept="image/*"
              onChange={handleFileChange}
              className="leave-document-input"
            />
            <label htmlFor="leaveDocument" className="leave-document-upload-label">
              <span className="upload-icon">📄</span>
              <span className="upload-text">Click to upload document</span>
              <span className="upload-hint">Supports: JPG, PNG, GIF (Max 5MB)</span>
            </label>
          </div>
        ) : (
          <div className="leave-document-preview">
            <img src={preview} alt="Leave document preview" className="leave-document-image" />
            <button
              type="button"
              onClick={handleRemove}
              className="leave-document-remove-btn"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

LeaveDocument.propTypes = {
  onDocumentChange: PropTypes.func.isRequired,
  initialDocument: PropTypes.string,
};

export default LeaveDocument;

