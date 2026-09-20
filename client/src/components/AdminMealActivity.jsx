import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getAdminMeals } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { displayDateTime } from '../utils/date';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

const number = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function AdminMealActivity() {
  const [meals, setMeals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminMeals({ page, limit: 20, search, date, meal_type: mealType });
      setMeals(response.data.data); setPagination(response.data.pagination);
    } catch (error) { toast(getErrorMessage(error, 'Could not load meal activity.'), 'error'); }
    finally { setLoading(false); }
  }, [page, search, date, mealType, toast]);
  useEffect(() => { load(); }, [load]);
  const submitSearch = (event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };

  return (
    <section>
      <div className="section-title-row"><div><span className="eyebrow">Audit view</span><h1>Meal activity</h1><p>Review nutrition entries across user accounts.</p></div></div>
      <div className="filter-bar"><form className="search-box" onSubmit={submitSearch}><Search size={18} /><label className="sr-only" htmlFor="meal-search">Search meal activity</label><input id="meal-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search user or food" /><button type="submit">Search</button></form><label className="filter-select"><span className="sr-only">Filter date</span><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} /></label><label className="filter-select"><span className="sr-only">Filter meal type</span><select value={mealType} onChange={(event) => { setMealType(event.target.value); setPage(1); }}><option value="">All meal types</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label></div>
      <div className="panel table-panel">{loading ? <LoadingSpinner label="Loading meal activity…" /> : meals.length === 0 ? <div className="empty-state"><h3>No meal activity found.</h3><p>Try changing the filters.</p></div> : <div className="table-wrap"><table><thead><tr><th>User</th><th>Food</th><th>Meal</th><th>Quantity</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Date / time</th></tr></thead><tbody>
        {meals.map((meal) => <tr key={meal.id}><td data-label="User"><strong>{meal.fullname}</strong><small className="cell-subtitle">@{meal.username}</small></td><td data-label="Food">{meal.food_name}</td><td data-label="Meal"><span className={`meal-badge meal-${meal.meal_type.toLowerCase()}`}>{meal.meal_type}</span></td><td data-label="Quantity">{number(meal.quantity)} {meal.unit}</td><td data-label="Calories">{number(meal.calories)}</td><td data-label="Protein">{number(meal.protein)} g</td><td data-label="Carbs">{number(meal.carbs)} g</td><td data-label="Fat">{number(meal.fat)} g</td><td data-label="Date / time">{displayDateTime(meal.occurred_at)}</td></tr>)}
      </tbody></table></div>}<Pagination pagination={pagination} onPageChange={setPage} /></div>
    </section>
  );
}

