import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { signup } from '../services/authService';
import { getErrorDetails, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const [form, setForm] = useState({ fullname: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const { user, role, setSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  if (user) return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setErrors([]);
    if (form.password !== form.confirmPassword) { setErrors(['Passwords do not match.']); return; }
    setSubmitting(true);
    try { const response = await signup(form); setSession(response.data.data); toast('Your account is ready.'); navigate('/dashboard', { replace: true }); }
    catch (error) { const details = getErrorDetails(error); setErrors(details.length ? details : [getErrorMessage(error, 'Could not create the account.')]); }
    finally { setSubmitting(false); }
  };
  return <AuthLayout><div className="auth-heading"><span className="eyebrow">Get started</span><h2>Create your account</h2><p>Your first nutrition record is a minute away.</p></div>{errors.length > 0 && <div className="form-alert" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}<form onSubmit={submit} className="auth-form compact"><label className="field"><span>Full name</span><input name="fullname" value={form.fullname} onChange={change} autoComplete="name" required minLength="2" /></label><div className="form-grid"><label className="field"><span>Username</span><input name="username" value={form.username} onChange={change} autoComplete="username" pattern="[A-Za-z0-9_]{3,30}" required /></label><label className="field"><span>Email</span><input name="email" type="email" value={form.email} onChange={change} autoComplete="email" required /></label></div><label className="field"><span>Password</span><span className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} autoComplete="new-password" minLength="8" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>{showPassword ? <EyeOff /> : <Eye />}</button></span><small>At least 8 characters</small></label><label className="field"><span>Confirm password</span><input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={change} autoComplete="new-password" minLength="8" required /></label><button className="button button-full" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button></form><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p></AuthLayout>;
}

