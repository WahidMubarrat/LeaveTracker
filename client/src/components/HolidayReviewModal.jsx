import { useState, useEffect } from 'react';
import { MdClose, MdEdit, MdDelete, MdSave, MdCancel, MdCheckCircle, MdWarning } from 'react-icons/md';
import '../styles/HolidayReviewModal.css';

const HolidayReviewModal = ({
    isOpen,
    onClose,
    holidays,
    onSave,
    loading,
    rawText
}) => {
    const [editableHolidays, setEditableHolidays] = useState([]);
    const [editingData, setEditingData] = useState({});
    const [showRawText, setShowRawText] = useState(false);

    // Update editable holidays when the holidays prop changes
    useEffect(() => {
        if (holidays && holidays.length > 0) {
            setEditableHolidays(
                holidays.map((h, index) => ({ ...h, id: index, isEditing: false }))
            );
        }
    }, [holidays]);

    if (!isOpen) return null;

    const handleEdit = (id) => {
        const holiday = editableHolidays.find(h => h.id === id);
        setEditingData({
            id,
            name: holiday.name,
            date: holiday.date,
            numberOfDays: holiday.numberOfDays
        });
        setEditableHolidays(prev =>
            prev.map(h => ({ ...h, isEditing: h.id === id }))
        );
    };

    const handleCancelEdit = () => {
        setEditingData({});
        setEditableHolidays(prev =>
            prev.map(h => ({ ...h, isEditing: false }))
        );
    };

    const handleSaveEdit = (id) => {
        setEditableHolidays(prev =>
            prev.map(h => {
                if (h.id === id) {
                    return {
                        ...h,
                        name: editingData.name,
                        date: editingData.date,
                        numberOfDays: editingData.numberOfDays,
                        isEditing: false
                    };
                }
                return h;
            })
        );
        setEditingData({});
    };

    const handleDelete = (id) => {
        setEditableHolidays(prev => prev.filter(h => h.id !== id));
    };

    const handleInputChange = (field, value) => {
        setEditingData(prev => ({
            ...prev,
            [field]: field === 'numberOfDays' ? parseInt(value) || 1 : value
        }));
    };

    const handleSaveAll = () => {
        const holidaysToSave = editableHolidays.map(({ id, isEditing, ...rest }) => rest);
        onSave(holidaysToSave);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="holiday-review-overlay" onClick={onClose}>
            <div className="holiday-review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <h2>Review Extracted Holidays</h2>
                        <p className="modal-subtitle">
                            {editableHolidays.length} holiday{editableHolidays.length !== 1 ? 's' : ''} found.
                            Review and edit before saving.
                        </p>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className="modal-body">
                    {editableHolidays.length === 0 ? (
                        <div className="empty-state">
                            <p>All holidays have been removed.</p>
                        </div>
                    ) : (
                        <div className="holidays-review-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Holiday Name</th>
                                        <th>Date</th>
                                        <th>Days</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editableHolidays.map((holiday, index) => (
                                        <tr key={holiday.id} className={holiday.isEditing ? 'editing' : ''}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {holiday.isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editingData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        className="edit-input"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    holiday.name
                                                )}
                                            </td>
                                            <td>
                                                {holiday.isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editingData.date}
                                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    formatDate(holiday.date)
                                                )}
                                            </td>
                                            <td>
                                                {holiday.isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editingData.numberOfDays}
                                                        onChange={(e) => handleInputChange('numberOfDays', e.target.value)}
                                                        className="edit-input days-input"
                                                        min="1"
                                                        max="30"
                                                    />
                                                ) : (
                                                    holiday.numberOfDays
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {holiday.isEditing ? (
                                                        <>
                                                            <button
                                                                className="btn-confirm"
                                                                onClick={() => handleSaveEdit(holiday.id)}
                                                                title="Save changes"
                                                            >
                                                                <MdCheckCircle />
                                                            </button>
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={handleCancelEdit}
                                                                title="Cancel edit"
                                                            >
                                                                <MdCancel />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() => handleEdit(holiday.id)}
                                                                title="Edit holiday"
                                                            >
                                                                <MdEdit />
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleDelete(holiday.id)}
                                                                title="Remove holiday"
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {rawText && (
                        <div className="raw-text-section">
                            <button
                                className="toggle-raw-text"
                                onClick={() => setShowRawText(!showRawText)}
                            >
                                {showRawText ? 'Hide' : 'Show'} Extracted Text
                            </button>
                            {showRawText && (
                                <div className="raw-text-preview">
                                    <pre>{rawText}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSaveAll}
                        disabled={loading || editableHolidays.length === 0}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <MdSave />
                                Save {editableHolidays.length} Holiday{editableHolidays.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HolidayReviewModal;
