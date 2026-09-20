import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { adminLogin } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, role, setSession } = useAuth();
  const navigate = useNavigate();
  if (user) return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  const submit = async (event) => { event.preventDefault(); setSubmitting(true); setError(''); try { const response = await adminLogin(form); setSession(response.data.data); navigate('/admin/dashboard', { replace: true }); } catch (requestError) { setError(getErrorMessage(requestError, 'Could not log in.')); } finally { setSubmitting(false); } };
  return <AuthLayout admin><div className="auth-heading"><span className="eyebrow">Restricted area</span><h2>Administrator login</h2><p>Use your separately provisioned administrator account.</p></div>{error && <div className="form-alert" role="alert">{error}</div>}<form onSubmit={submit} className="auth-form"><label className="field"><span>Administrator username</span><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required /></label><label className="field"><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required /></label><button className="button button-full" type="submit" disabled={submitting}>{submitting ? 'Verifying…' : 'Access dashboard'}</button></form><p className="auth-switch"><Link to="/login">Return to user login</Link></p></AuthLayout>;
}

