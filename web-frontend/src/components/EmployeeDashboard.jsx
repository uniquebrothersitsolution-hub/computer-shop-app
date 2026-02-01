import { useState, useEffect } from 'react';
import { dataAPI, fieldsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const [fields, setFields] = useState([]);
    const [rows, setRows] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await fieldsAPI.getAll();
            const fetchedFields = response.data.data;
            setFields(fetchedFields);

            // Initialize first row with dynamic fields
            const firstRow = { id: 1 };
            fetchedFields.forEach(field => {
                firstRow[field.fieldName] = '';
            });
            setRows([firstRow]);
        } catch (error) {
            console.error('Error fetching fields:', error);
            setMessage({ type: 'error', text: 'Failed to load field configuration' });
        }
        setInitialLoading(false);
    };

    const addRow = () => {
        const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        const newRow = { id: nextId };
        fields.forEach(field => {
            newRow[field.fieldName] = '';
        });
        setRows([...rows, newRow]);
    };

    const removeRow = (id) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    const updateRow = (id, fieldName, value) => {
        setRows(rows.map(row =>
            row.id === id ? { ...row, [fieldName]: value } : row
        ));
    };

    const handleSubmitAll = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Filter out empty rows (where all dynamic fields are empty)
            const validRows = rows.filter(row => {
                return fields.some(field => field.required && row[field.fieldName]);
            });

            if (validRows.length === 0) {
                setMessage({ type: 'error', text: 'Please fill at least one row with required fields' });
                setLoading(false);
                return;
            }

            // Submit all valid rows
            const promises = validRows.map(row => {
                const payload = {
                    date: new Date()
                };
                fields.forEach(field => {
                    let value = row[field.fieldName];
                    if (field.fieldType === 'number' && value !== '') value = Number(value);
                    payload[field.fieldName] = value;
                });
                return dataAPI.create(payload);
            });

            await Promise.all(promises);

            setMessage({
                type: 'success',
                text: `✅ Successfully submitted ${validRows.length} ${validRows.length === 1 ? 'entry' : 'entries'}!`
            });

            // Reset form
            const firstRow = { id: Date.now() };
            fields.forEach(field => {
                firstRow[field.fieldName] = '';
            });
            setRows([firstRow]);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit data'
            });
        }

        setLoading(false);

        // Clear success message after 5 seconds
        if (message.type === 'success') {
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            borderRadius: '50%'
                        }}
                    />
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>Unique Brothers - Employee Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Welcome, {user?.username}
                        </p>
                    </div>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </div>

            <div className="card fade-in">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    📊 Enter Today's Sales Data (Excel Format)
                </h2>

                {message.text && (
                    <div className={`alert alert-${message.type} fade-in`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmitAll}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ marginBottom: '1rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    {fields.map(field => (
                                        <th key={field._id} style={{ minWidth: field.fieldType === 'text' ? '200px' : '120px' }}>
                                            {field.fieldName} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                                        </th>
                                    ))}
                                    <th style={{ width: '80px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.id}>
                                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                                        {fields.map(field => (
                                            <td key={field._id}>
                                                {field.fieldType === 'select' ? (
                                                    <select
                                                        className="form-select"
                                                        value={row[field.fieldName]}
                                                        onChange={(e) => updateRow(row.id, field.fieldName, e.target.value)}
                                                        required={field.required}
                                                        style={{ width: '100%', padding: '0.5rem' }}
                                                    >
                                                        <option value="">Select {field.fieldName}</option>
                                                        {field.options?.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.fieldType}
                                                        className="form-input"
                                                        placeholder={field.fieldName}
                                                        value={row[field.fieldName]}
                                                        onChange={(e) => updateRow(row.id, field.fieldName, e.target.value)}
                                                        required={field.required}
                                                        style={{ width: '100%', padding: '0.5rem' }}
                                                        step={field.fieldType === 'number' ? 'any' : undefined}
                                                    />
                                                )}
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center' }}>
                                            {rows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(row.id)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={addRow}
                            className="btn btn-secondary"
                        >
                            ➕ Add Row
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                    Submitting...
                                </span>
                            ) : (
                                `💾 Submit All Data (${rows.length} ${rows.length === 1 ? 'row' : 'rows'})`
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-3" style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    <p>📝 <strong>Instructions:</strong></p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>Fill in the table above based on the required fields</li>
                        <li>Click "Add Row" to enter multiple sales at once</li>
                        <li>All data will be submitted together</li>
                        <li>Changes to fields by the owner will automatically show up here</li>
                    </ul>
                </div>
            </div>

            <div className="text-center mt-4 mb-4">
                <button
                    onClick={logout}
                    className="btn btn-secondary"
                    style={{ minWidth: '200px' }}
                >
                    🚪 Logout
                </button>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    &copy; {new Date().getFullYear()} Unique Brothers. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
