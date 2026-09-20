import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, History, LayoutDashboard, PlusCircle, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DateToolbar from '../components/DateToolbar';
import NutritionProgress from '../components/NutritionProgress';
import MealForm from '../components/MealForm';
import MealTable from '../components/MealTable';
import ReportsPanel from '../components/ReportsPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMeals } from '../services/mealService';
import { getReport } from '../services/reportService';
import { getErrorMessage } from '../services/api';
import { localDateString } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const items = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'log', label: 'Log food', icon: PlusCircle },
  { id: 'history', label: 'Food history', icon: History },
  { id: 'reports', label: 'Reports', icon: BarChart3 }
];

export default function UserDashboard() {
  const [view, setView] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(localDateString());
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 });
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mealResponse, reportResponse] = await Promise.all([
        getMeals({ date: selectedDate, page, limit: 20 }),
        getReport(selectedDate, 'daily')
      ]);
      setMeals(mealResponse.data.data);
      setPagination(mealResponse.data.pagination);
      setTotals(reportResponse.data.data.totals);
    } catch (error) {
      toast(getErrorMessage(error, 'Could not load your dashboard.'), 'error');
    } finally { setLoading(false); }
  }, [selectedDate, page, refreshKey, toast]);

  useEffect(() => { load(); }, [load]);

  const changeDate = (date) => { if (!date) return; setSelectedDate(date); setPage(1); setEditingMeal(null); };
  const refresh = () => setRefreshKey((value) => value + 1);
  const edit = (meal) => { setEditingMeal(meal); setView('log'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const logout = async () => { await signOut(); navigate('/login', { replace: true }); };
  const goalCards = useMemo(() => [
    ['calories', totals.calories, user.calories_goal], ['protein', totals.protein, user.protein_goal],
    ['carbs', totals.carbs, user.carbs_goal], ['fat', totals.fat, user.fat_goal]
  ], [totals, user]);

  return (
    <div className="dashboard-shell">
      <Sidebar items={items} active={view} onSelect={setView} onLogout={logout} open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      <main className="dashboard-main">
        <header className="dashboard-header"><div><span className="eyebrow">Personal dashboard</span><h1>Welcome, {user.fullname.split(' ')[0]}</h1><p>Here’s what your food record shows.</p></div><div className="user-chip"><span>{user.fullname.charAt(0).toUpperCase()}</span><div><strong>{user.fullname}</strong><small>{user.allocation}</small></div></div></header>
        <DateToolbar date={selectedDate} onChange={changeDate} onRefresh={refresh} refreshing={loading} />

        {view === 'overview' && <section>
          <div className="section-title-row"><div><span className="eyebrow">Daily summary</span><h2>Your nutrition at a glance</h2><p>Intake remains visible even when it goes over a goal.</p></div><button type="button" className="button button-small" onClick={() => setView('log')}><PlusCircle size={17} /> Log food</button></div>
          <div className="nutrition-grid">{goalCards.map(([nutrient, consumed, goal]) => <NutritionProgress key={nutrient} nutrient={nutrient} consumed={consumed} goal={goal} />)}</div>
          <div className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">Meal log</span><h2>Recent meals</h2><p>{totals.meals} {totals.meals === 1 ? 'meal' : 'meals'} recorded for this date.</p></div>{meals.length > 0 && <button className="text-button" type="button" onClick={() => setView('history')}>View full history</button>}</div>{loading ? <LoadingSpinner label="Loading meals…" /> : <MealTable meals={meals.slice(0, 5)} onEdit={edit} onDeleted={refresh} />}</div>
        </section>}

        {view === 'log' && <section><div className="section-title-row"><div><span className="eyebrow">Food record</span><h1>{editingMeal ? 'Update your meal' : 'Add a meal'}</h1><p>Enter values for the full serving—quantity does not multiply nutrients.</p></div></div><MealForm editingMeal={editingMeal} selectedDate={selectedDate} onSaved={() => { setEditingMeal(null); refresh(); setView('overview'); }} onCancel={() => setEditingMeal(null)} /></section>}

        {view === 'history' && <section><div className="section-title-row"><div><span className="eyebrow">Saved records</span><h1>Food history</h1><p>Edit or remove only the meals that belong to your account.</p></div><button type="button" className="button button-small" onClick={() => setView('log')}><PlusCircle size={17} /> Add meal</button></div><div className="panel table-panel">{loading ? <LoadingSpinner label="Loading food history…" /> : <MealTable meals={meals} onEdit={edit} onDeleted={refresh} />}<Pagination pagination={pagination} onPageChange={setPage} /></div></section>}

        {view === 'reports' && <ReportsPanel date={selectedDate} />}
        <footer className="dashboard-footer"><Utensils size={15} /> Nutrition goals are tracking defaults, not medical recommendations.</footer>
      </main>
    </div>
  );
}

