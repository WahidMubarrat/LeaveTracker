import { useState, useEffect, useRef } from 'react';
import { vacationAPI } from '../services/api';
import HolidayReviewModal from './HolidayReviewModal';
import { MdCloudUpload, MdPictureAsPdf } from 'react-icons/md';
import '../styles/PublicHoliday.css';

const PublicHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    numberOfDays: 1
  });

  // File upload states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [extractedHolidays, setExtractedHolidays] = useState([]);
  const [rawText, setRawText] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await vacationAPI.getAll();
      setHolidays(response.data.holidays || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfDays' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name.trim()) {
      setError('Holiday name is required');
      return;
    }

    if (!formData.date) {
      setError('Holiday date is required');
      return;
    }

    if (formData.numberOfDays < 1) {
      setError('Number of days must be at least 1');
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // Update existing holiday
        await vacationAPI.update(editingId, formData);
        setSuccess('Holiday updated successfully');
      } else {
        // Create new holiday
        await vacationAPI.create(formData);
        setSuccess('Holiday added successfully');
      }

      // Reset form
      setFormData({
        name: '',
        date: '',
        numberOfDays: 1
      });
      setEditingId(null);

      // Refresh holidays list
      await fetchHolidays();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving holiday:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save holiday';
      setError(errorMessage);
      console.error('Full error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (holiday) => {
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      numberOfDays: holiday.numberOfDays
    });
    setEditingId(holiday._id);
    setError('');
    setSuccess('');

    // Scroll to form
    document.querySelector('.holiday-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      date: '',
      numberOfDays: 1
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await vacationAPI.delete(holidayId);
      setSuccess('Holiday deleted successfully');
      await fetchHolidays();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError(err.response?.data?.message || 'Failed to delete holiday');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploadLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('holidayFile', selectedFile);

      const response = await vacationAPI.uploadFile(formData);
      console.log('Upload response:', response.data);
      const { holidays: extracted, rawText: text, message } = response.data;

      console.log('Extracted holidays count:', extracted?.length || 0);
      console.log('Extracted holidays:', extracted);

      if (extracted && extracted.length > 0) {
        setExtractedHolidays(extracted);
        setRawText(text || '');
        setShowReviewModal(true);
        setSuccess(`${extracted.length} holiday(s) extracted. Please review before saving.`);
      } else {
        setError(message || 'No holidays could be extracted from the file.');
        if (text) {
          setRawText(text);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to process file');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveExtracted = async (holidaysToSave) => {
    if (!holidaysToSave || holidaysToSave.length === 0) {
      setError('No holidays to save');
      return;
    }

    setUploadLoading(true);
    setError('');

    try {
      const response = await vacationAPI.saveBulk(holidaysToSave);
      const { results, message } = response.data;

      setShowReviewModal(false);
      setSelectedFile(null);
      setExtractedHolidays([]);
      setRawText('');

      // Build success message
      let successMsg = message;
      if (results.skipped.length > 0) {
        successMsg += ` (${results.skipped.length} skipped - duplicates)`;
      }
      setSuccess(successMsg);

      // Refresh holidays list
      await fetchHolidays();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save holidays');
    } finally {
      setUploadLoading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <MdCloudUpload />;
    return <MdPictureAsPdf />;
  };

  return (
    <div className="public-holiday">
      <div className="holiday-header">
        <h2>Public Holiday Management</h2>
        <p className="holiday-subtitle">
          Add and manage public holidays. These holidays will be automatically excluded from leave calculations.
        </p>
      </div>

      {error && (
        <div className="holiday-alert error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="holiday-alert success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {/* File Upload Section */}
      <div className="upload-section">
        <h3>
          <MdCloudUpload className="section-icon" />
          Upload Holiday List
        </h3>
        <p className="upload-description">
          Upload a PDF file containing a list of public holidays.
          We'll extract the dates and names automatically for you to review.
        </p>

        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          <div className="upload-content">
            <div className={`upload-icon ${selectedFile ? 'has-file' : ''}`}>
              {getFileIcon()}
            </div>

            {selectedFile ? (
              <div className="file-info">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  className="clear-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedFile();
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="upload-text">
                <span className="primary-text">
                  Drag & drop a PDF file here, or click to browse
                </span>
                <span className="secondary-text">
                  Supports: PDF files only (max 10MB)
                </span>
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <button
            className="btn-extract"
            onClick={handleUpload}
            disabled={uploadLoading}
          >
            {uploadLoading ? (
              <>
                <span className="spinner"></span>
                Extracting Holidays...
              </>
            ) : (
              <>
                <MdCloudUpload />
                Extract Holidays
              </>
            )}
          </button>
        )}
      </div>

      {/* Manual Entry Form */}
      <div className="holiday-form">
        <h3>{editingId ? 'Edit Holiday' : 'Add New Holiday'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Holiday Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Independence Day"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="numberOfDays">Number of Days *</label>
              <input
                type="number"
                id="numberOfDays"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingId ? 'Update Holiday' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>

      <div className="holiday-list">
        <h3>Existing Holidays</h3>
        {loading && holidays.length === 0 ? (
          <div className="loading-state">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="empty-state">No holidays added yet</div>
        ) : (
          <div className="holidays-table">
            <table>
              <thead>
                <tr>
                  <th>Holiday Name</th>
                  <th>Date</th>
                  <th>Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(holiday => (
                  <tr key={holiday._id}>
                    <td>{holiday.name}</td>
                    <td>{formatDate(holiday.date)}</td>
                    <td>{holiday.numberOfDays} {holiday.numberOfDays === 1 ? 'day' : 'days'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(holiday)}
                          disabled={loading || editingId === holiday._id}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(holiday._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <HolidayReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setExtractedHolidays([]);
          setRawText('');
        }}
        holidays={extractedHolidays}
        onSave={handleSaveExtracted}
        loading={uploadLoading}
        rawText={rawText}
      />
    </div>
  );
};

export default PublicHoliday;
