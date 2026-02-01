import { useState, useEffect } from 'react';
import { fieldsAPI } from '../services/api';

const FieldManager = ({ fields, onRefresh }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newField, setNewField] = useState({
        fieldName: '',
        fieldType: 'text',
        required: true,
        options: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAddField = async (e) => {
        e.preventDefault();
        try {
            const fieldData = {
                ...newField,
                options: newField.fieldType === 'select' ? newField.options.split(',').map(o => o.trim()) : [],
                order: fields.length + 1
            };

            await fieldsAPI.create(fieldData);
            setMessage({ type: 'success', text: 'Field added successfully!' });
            setNewField({ fieldName: '', fieldType: 'text', required: true, options: '' });
            setShowAddForm(false);
            onRefresh();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add field' });
        }
    };

    const handleEdit = (field) => {
        setEditingId(field._id);
        setEditForm({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            required: field.required,
            options: field.options?.join(', ') || ''
        });
    };

    const handleUpdate = async (id) => {
        try {
            const fieldData = {
                ...editForm,
                options: editForm.fieldType === 'select' ? editForm.options.split(',').map(o => o.trim()) : []
            };

            await fieldsAPI.update(id, fieldData);
            setMessage({ type: 'success', text: '✅ Field saved successfully!' });
            setEditingId(null);
            onRefresh();

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update field' });
        }
    };

    const handleDeleteField = async (id, fieldName) => {
        if (!window.confirm(`Are you sure you want to delete "${fieldName}"?`)) return;

        try {
            await fieldsAPI.delete(id);
            setMessage({ type: 'success', text: 'Field deleted successfully!' });
            onRefresh();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete field' });
        }
    };

    const moveField = async (index, direction) => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newFields.length) return;

        // Swap fields
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];

        // Update order for both fields
        try {
            await fieldsAPI.update(newFields[index]._id, { order: index + 1 });
            await fieldsAPI.update(newFields[targetIndex]._id, { order: targetIndex + 1 });
            setMessage({ type: 'success', text: 'Field order updated!' });
            onRefresh();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update order' });
        }
    };

    return (
        <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
            <div className="flex justify-between items-center mb-3">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    ⚙️ Manage Data Fields
                </h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary"
                >
                    {showAddForm ? '✕ Cancel' : '➕ Add Field'}
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} fade-in`}>
                    {message.text}
                </div>
            )}

            {showAddForm && (
                <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Add New Field
                    </h3>
                    <form onSubmit={handleAddField}>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                                <label className="form-label">Field Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Warranty Period"
                                    value={newField.fieldName}
                                    onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                                <label className="form-label">Field Type</label>
                                <select
                                    className="form-select"
                                    value={newField.fieldType}
                                    onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Dropdown</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>

                            {newField.fieldType === 'select' && (
                                <div className="form-group" style={{ flex: '2', minWidth: '250px' }}>
                                    <label className="form-label">Options (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., 1 Year, 2 Years, 3 Years"
                                        value={newField.options}
                                        onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={newField.required}
                                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                />
                                <span style={{ fontSize: '0.875rem' }}>Required field</span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>
                            💾 Save Field
                        </button>
                    </form>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Order</th>
                            <th>Field Name</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th>Options</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => (
                            <tr key={field._id}>
                                <td>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveField(index, 'up')}
                                            disabled={index === 0}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            title="Move up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveField(index, 'down')}
                                            disabled={index === fields.length - 1}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                            title="Move down"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    {editingId === field._id ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.fieldName}
                                            onChange={(e) => setEditForm({ ...editForm, fieldName: e.target.value })}
                                            style={{ minWidth: '150px' }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: '600' }}>{field.fieldName}</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === field._id ? (
                                        <select
                                            className="form-select"
                                            value={editForm.fieldType}
                                            onChange={(e) => setEditForm({ ...editForm, fieldType: e.target.value })}
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="select">Dropdown</option>
                                            <option value="date">Date</option>
                                        </select>
                                    ) : (
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'var(--bg-tertiary)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {field.fieldType}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingId === field._id ? (
                                        <input
                                            type="checkbox"
                                            checked={editForm.required}
                                            onChange={(e) => setEditForm({ ...editForm, required: e.target.checked })}
                                        />
                                    ) : (
                                        field.required ? '✅ Yes' : '❌ No'
                                    )}
                                </td>
                                <td>
                                    {editingId === field._id && editForm.fieldType === 'select' ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.options}
                                            onChange={(e) => setEditForm({ ...editForm, options: e.target.value })}
                                            placeholder="Comma-separated"
                                            style={{ minWidth: '200px' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {field.options?.length > 0 ? field.options.join(', ') : '-'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-1">
                                        {editingId === field._id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(field._id)}
                                                    className="btn btn-success"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(field)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteField(field._id, field.fieldName)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                >
                                                    Delete
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

            <div className="mt-3" style={{
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
            }}>
                <p>ℹ️ <strong>Field Management:</strong></p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>✏️ <strong>Edit</strong> any field - click Edit, make changes, then click <strong>Save</strong></li>
                    <li>🗑️ <strong>Delete</strong> any field you don't need</li>
                    <li>⬆️⬇️ <strong>Reorder</strong> fields using up/down arrows (saves automatically)</li>
                    <li>➕ <strong>Add</strong> custom fields for your specific needs</li>
                    <li>Changes apply to all new data entries immediately</li>
                </ul>
            </div>
        </div>
    );
};

export default FieldManager;
