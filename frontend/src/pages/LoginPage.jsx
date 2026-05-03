import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, getErrorMessage } from '../api';

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f2540',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  wrapper: {
    display: 'flex',
    width: '820px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  left: {
    flex: 1,
    backgroundColor: '#1a3a5c',
    color: '#fff',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoArea: { marginBottom: '32px' },
  logoIcon: { fontSize: '48px', marginBottom: '12px' },
  logoTitle: { fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' },
  logoSub: { fontSize: '13px', color: '#7aabcc', marginTop: '4px' },
  featureList: { listStyle: 'none', padding: 0, margin: 0 },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '14px', fontSize: '14px', color: '#c0d8ea',
  },
  featureDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: '#4db6f5', flexShrink: 0,
  },
  footer: { fontSize: '11px', color: '#4a7a9b' },
  right: {
    width: '360px',
    backgroundColor: '#fff',
    padding: '48px 36px',
  },
  formTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  formSub: { fontSize: '13px', color: '#666', marginBottom: '32px' },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '600',
    color: '#444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #ccd0d5',
    borderRadius: '4px', fontSize: '14px', color: '#1a1a2e',
    backgroundColor: '#f8f9fa', boxSizing: 'border-box', outline: 'none',
    marginBottom: '20px',
  },
  select: {
    width: '100%', padding: '10px 12px', border: '1px solid #ccd0d5',
    borderRadius: '4px', fontSize: '14px', color: '#1a1a2e',
    backgroundColor: '#f8f9fa', boxSizing: 'border-box', outline: 'none',
    marginBottom: '24px', cursor: 'pointer',
  },
  loginBtn: {
    width: '100%', padding: '12px', backgroundColor: '#1a3a5c',
    color: '#fff', border: 'none', borderRadius: '4px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px',
  },
  error: {
    backgroundColor: '#fde8e8', border: '1px solid #f5c6c6',
    color: '#c0392b', padding: '10px 12px', borderRadius: '4px',
    fontSize: '13px', marginBottom: '16px',
  },
};

const ROLE_ROUTES = {
  Admin: '/admin',
  Warden: '/warden',
  Student: '/student',
  'Payment Clerk': '/finance',
  'Mess Staff': '/mess',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'Admin' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiPost('/login', form);
      const user = res.user || res;
      const userData = {
        _id: user._id || '',
        username: user.username || form.username,
        role: user.role || form.role,
        studentId: user.studentId || '',
        name: user.name || '',
      };
      sessionStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      navigate(ROLE_ROUTES[form.role]);
    } catch (err) {
    setError(getErrorMessage(err));
    setLoading(false);
  }
  };

  return (
    <div style={s.page}>
      <div style={s.wrapper}>
        {/* LEFT PANEL */}
        <div style={s.left}>
          <div>
            <div style={s.logoArea}>
              <div style={s.logoIcon}>🏢</div>
              <div style={s.logoTitle}>Hostel Management System</div>
              <div style={s.logoSub}>Integrated Campus Residential Platform</div>
            </div>
            <ul style={s.featureList}>
              {[
                'Centralized room allocation & management',
                'Real-time fee & payment tracking',
                'Complaint resolution workflow',
                'Mess attendance & menu management',
                'Multi-role access control',
                'Comprehensive reporting & analytics',
              ].map((f) => (
                <li key={f} style={s.featureItem}>
                  <span style={s.featureDot} /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div style={s.footer}>© 2025 Hostel Management System — All Rights Reserved</div>
        </div>

        {/* RIGHT PANEL */}
        <div style={s.right}>
          <div style={s.formTitle}>Sign In</div>
          <div style={s.formSub}>Enter your credentials to access the system</div>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <label style={s.label}>Username</label>
            <input style={s.input} name="username" value={form.username} onChange={handleChange} placeholder="Enter username" />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" />
            <label style={s.label}>Role</label>
            <select style={s.select} name="role" value={form.role} onChange={handleChange}>
              {Object.keys(ROLE_ROUTES).map((r) => <option key={r}>{r}</option>)}
            </select>
            <button style={s.loginBtn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
