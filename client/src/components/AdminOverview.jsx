import { Activity, CalendarPlus, Salad, Users } from 'lucide-react';
import StatCard from './StatCard';
import LoadingSpinner from './LoadingSpinner';

export default function AdminOverview({ stats, loading }) {
  return (
    <section>
      <div className="section-title-row"><div><span className="eyebrow">Administration</span><h1>System overview</h1><p>Current activity across NutriTrack.</p></div></div>
      {loading ? <div className="panel"><LoadingSpinner label="Loading statistics…" /></div> : (
        <div className="stat-grid admin-stat-grid">
          <StatCard label="Registered users" value={Number(stats.total_users || 0).toLocaleString()} icon={Users} tone="green" />
          <StatCard label="Active users" value={Number(stats.active_users || 0).toLocaleString()} icon={Activity} tone="blue" />
          <StatCard label="Meals logged today" value={Number(stats.meals_today || 0).toLocaleString()} icon={Salad} tone="gold" />
          <StatCard label="New users this week" value={Number(stats.new_users_this_week || 0).toLocaleString()} hint={`${Number(stats.total_meals || 0).toLocaleString()} all-time meals`} icon={CalendarPlus} tone="coral" />
        </div>
      )}
      <div className="panel admin-note">
        <div className="admin-note-mark">NT</div>
        <div><h2>Responsible administration</h2><p>Goals in NutriTrack are tracking allocations, not medical recommendations. Use account controls carefully and keep user information private.</p></div>
      </div>
    </section>
  );
}

