import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { login } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, role, setSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  if (user) return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const response = await login(form);
      setSession(response.data.data); toast('Welcome back.');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) { setError(getErrorMessage(requestError, 'Could not log in.')); }
    finally { setSubmitting(false); }
  };
  return <AuthLayout><div className="auth-heading"><span className="eyebrow">Welcome back</span><h2>Log in to NutriTrack</h2><p>Continue building your nutrition record.</p></div>{error && <div className="form-alert" role="alert">{error}</div>}<form onSubmit={submit} className="auth-form"><label className="field"><span>Username or email</span><input autoComplete="username" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required placeholder="you@example.com" /></label><label className="field"><span>Password</span><span className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label><button className="button button-full" type="submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</button></form><p className="auth-switch">New to NutriTrack? <Link to="/signup">Create an account</Link></p><div className="admin-login-link"><Link to="/admin/login">Administrator login</Link></div></AuthLayout>;
}

