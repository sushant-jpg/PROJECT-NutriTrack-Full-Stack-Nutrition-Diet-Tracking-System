import { useCallback, useEffect, useState } from 'react';
import { Activity, LayoutDashboard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminOverview from '../components/AdminOverview';
import AdminUsers from '../components/AdminUsers';
import AdminMealActivity from '../components/AdminMealActivity';
import { getStats } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const items = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'meals', label: 'Meal activity', icon: Activity },
  { id: 'users', label: 'Users', icon: Users }
];

export default function AdminDashboard() {
  const [view, setView] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const loadStats = useCallback(async () => { setLoading(true); try { const response = await getStats(); setStats(response.data.data); } catch (error) { toast(getErrorMessage(error, 'Could not load administrator statistics.'), 'error'); } finally { setLoading(false); } }, [toast]);
  useEffect(() => { loadStats(); }, [loadStats]);
  const logout = async () => { await signOut(); navigate('/admin/login', { replace: true }); };
  return <div className="dashboard-shell admin-shell"><Sidebar items={items} active={view} onSelect={setView} onLogout={logout} open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} label="Administrator navigation" /><main className="dashboard-main"><header className="dashboard-header"><div><span className="eyebrow">NutriTrack operations</span><h1>Admin dashboard</h1><p>Monitor activity and manage accounts.</p></div><div className="user-chip admin-chip"><span>A</span><div><strong>{user.username}</strong><small>Administrator</small></div></div></header>{view === 'overview' && <AdminOverview stats={stats} loading={loading} />}{view === 'users' && <AdminUsers onChanged={loadStats} />}{view === 'meals' && <AdminMealActivity />}<footer className="dashboard-footer">Administrative access · Keep account information confidential.</footer></main></div>;
}

