import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(credentials);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{
            background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Circles */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'var(--primary)',
                opacity: '0.05',
                filter: 'blur(80px)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'var(--secondary)',
                opacity: '0.05',
                filter: 'blur(100px)',
                zIndex: 0
            }}></div>

            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                <ThemeToggle />
            </div>

            <div className="card fade-in" style={{
                maxWidth: '420px',
                width: '100%',
                zIndex: 1,
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                margin: '1rem'
            }}>
                <div className="text-center mb-4">
                    <img
                        src="/logo.png"
                        alt="Unique Brothers Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'contain',
                            marginBottom: '1rem',
                            borderRadius: '50%'
                        }}
                    />
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        Unique Brothers
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-error fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    fontSize: '1.25rem',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}
                                title={showPassword ? "Hide Password" : "Show Password"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default Login;
