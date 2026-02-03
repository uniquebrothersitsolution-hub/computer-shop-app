import { useState, useEffect } from 'react';
import { dataAPI, fieldsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import ThemeToggle from './ThemeToggle';
import FieldManager from './FieldManager';
import { exportDailyData, exportMonthlyData, exportAllData } from '../utils/excelExport';

const OwnerDashboard = () => {
    const { user, logout } = useAuth();
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submissionLoading, setSubmissionLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchData(), fetchFields(), fetchStats()]);
        setLoading(false);
    };

    const fetchData = async () => {
        try {
            const response = await dataAPI.getAll();
            setData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: '📡 Failed to connect to server. Check if backend is running.' });
        }
    };

    const fetchFields = async () => {
        try {
            const response = await fieldsAPI.getAll();
            setFields(response.data.data);
        } catch (error) {
            console.error('Error fetching fields:', error);
            setMessage({ type: 'error', text: '⚙️ Failed to load configuration.' });
        }
    };

    const fetchStats = async () => {
        try {
            const response = await dataAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        const formValues = {};
        fields.forEach(field => {
            formValues[field.fieldName] = item[field.fieldName] || '';
        });
        setEditForm(formValues);
    };

    const handleUpdate = async (id) => {
        try {
            await dataAPI.update(id, editForm);
            setMessage({ type: 'success', text: '✅ Entry updated successfully!' });
            setEditingId(null);
            fetchData();
            fetchStats();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update entry'
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await dataAPI.delete(id);
            setMessage({ type: 'success', text: '✅ Entry deleted successfully!' });
            fetchData();
            fetchStats();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete entry'
            });
        }
    };

    if (loading) {
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
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>Unique Brothers - Owner Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Welcome, {user?.username}
                        </p>
                    </div>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} fade-in`}>
                    {message.text}
                </div>
            )}

            {/* Statistics Cards */}
            {stats && (
                <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                    <div className="card fade-in stat-card" style={{ flex: '1', minWidth: '240px', borderTop: '4px solid var(--success)' }}>
                        <div className="flex justify-between items-center mb-2">
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>
                                Total Sales
                            </p>
                            <span style={{ fontSize: '1.25rem' }}>💰</span>
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)', letterSpacing: '-0.02em' }}>
                            ₹{stats.totalSales?.toLocaleString('en-IN') || 0}
                        </p>
                    </div>

                    <div className="card fade-in stat-card" style={{ flex: '1', minWidth: '240px', borderTop: '4px solid var(--primary)' }}>
                        <div className="flex justify-between items-center mb-2">
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>
                                Total Entries
                            </p>
                            <span style={{ fontSize: '1.25rem' }}>📦</span>
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                            {stats.totalEntries || 0}
                        </p>
                    </div>

                    <div className="card fade-in stat-card" style={{ flex: '1', minWidth: '240px', borderTop: '4px solid var(--accent)' }}>
                        <div className="flex justify-between items-center mb-2">
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>
                                Average Sale
                            </p>
                            <span style={{ fontSize: '1.25rem' }}>📈</span>
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                            ₹{stats.avgSale?.toFixed(2) || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Export Options */}
            <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    📁 Export Data to Excel
                </h2>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
                        <label className="form-label">Select Export Type</label>
                        <select
                            id="exportType"
                            className="form-select"
                            defaultValue="today"
                        >
                            <option value="today">📅 Today's Data</option>
                            <option value="month">📆 This Month's Data</option>
                            <option value="all">📊 All Data</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            const exportType = document.getElementById('exportType').value;
                            if (data.length === 0) {
                                alert('No data available to export!');
                                return;
                            }

                            switch (exportType) {
                                case 'today':
                                    exportDailyData(data, fields);
                                    break;
                                case 'month':
                                    exportMonthlyData(data, fields);
                                    break;
                                case 'all':
                                    exportAllData(data, fields);
                                    break;
                            }
                        }}
                        className="btn btn-success"
                        disabled={data.length === 0}
                        style={{ minWidth: '150px' }}
                    >
                        ⬇️ Download Excel
                    </button>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    Choose export type and click download to get Excel file (.xlsx)
                </p>
            </div>

            {/* Data Entry Form for Owner */}
            <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    ➕ Add New Sales Entry
                </h2>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmissionLoading(true);
                    const formData = new FormData(e.target);
                    const payload = {
                        date: new Date()
                    };

                    fields.forEach(field => {
                        let value = formData.get(field.fieldName);
                        if (field.fieldType === 'number') value = Number(value);
                        payload[field.fieldName] = value;
                    });

                    try {
                        await dataAPI.create(payload);
                        setMessage({ type: 'success', text: '✅ Entry added successfully!' });
                        e.target.reset();
                        fetchData();
                        fetchStats();
                    } catch (error) {
                        setMessage({
                            type: 'error',
                            text: error.response?.data?.message || 'Failed to add entry'
                        });
                    } finally {
                        setSubmissionLoading(false);
                    }
                }}>
                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        {fields.map((field) => (
                            <div key={field._id} className="form-group" style={{ flex: field.fieldType === 'text' ? '2' : '1', minWidth: '150px' }}>
                                <label className="form-label">{field.fieldName}</label>
                                {field.fieldType === 'select' ? (
                                    <select name={field.fieldName} className="form-select" required={field.required}>
                                        <option value="">Select {field.fieldName}</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.fieldType}
                                        name={field.fieldName}
                                        className="form-input"
                                        placeholder={field.fieldName}
                                        required={field.required}
                                        step={field.fieldType === 'number' ? 'any' : undefined}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn btn-success" disabled={submissionLoading} style={{ marginTop: '1rem' }}>
                        {submissionLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                Saving...
                            </span>
                        ) : (
                            '💾 Save Entry'
                        )}
                    </button>
                </form>
            </div>

            {/* Data Table */}
            <div className="card fade-in">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                    All Sales Data
                </h2>

                {data.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No data entries yet
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {fields.map(field => (
                                        <th key={field._id}>{field.fieldName}</th>
                                    ))}
                                    <th>Entered By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item._id}>
                                        <td>{format(new Date(item.date), 'dd MMM yyyy')}</td>
                                        {fields.map(field => (
                                            <td key={field._id}>
                                                {editingId === item._id ? (
                                                    field.fieldType === 'select' ? (
                                                        <select
                                                            className="form-select"
                                                            value={editForm[field.fieldName]}
                                                            onChange={(e) => setEditForm({ ...editForm, [field.fieldName]: e.target.value })}
                                                        >
                                                            {field.options?.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.fieldType}
                                                            className="form-input"
                                                            value={editForm[field.fieldName]}
                                                            onChange={(e) => setEditForm({ ...editForm, [field.fieldName]: e.target.value })}
                                                            style={{ minWidth: '100px' }}
                                                        />
                                                    )
                                                ) : (
                                                    field.fieldType === 'number' ?
                                                        (field.fieldName.toLowerCase().includes('price') || field.fieldName.toLowerCase().includes('total') ?
                                                            `₹${item[field.fieldName]?.toLocaleString('en-IN') || 0}` :
                                                            item[field.fieldName]) :
                                                        item[field.fieldName] || '-'
                                                )}
                                            </td>
                                        ))}
                                        <td>{item.enteredBy?.username || 'N/A'}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                {editingId === item._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdate(item._id)}
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
                                                            onClick={() => handleEdit(item)}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
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
                )}
            </div>

            {/* Field Manager */}
            <FieldManager fields={fields} onRefresh={fetchInitialData} />

            {/* Footer with Logout */}
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

export default OwnerDashboard;
