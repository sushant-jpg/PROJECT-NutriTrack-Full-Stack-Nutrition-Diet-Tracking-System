import { useCallback, useEffect, useState } from 'react';
import { Edit3, Search, X } from 'lucide-react';
import { getErrorDetails, getErrorMessage } from '../services/api';
import { getUsers, updateUser } from '../services/adminService';
import { displayDate } from '../utils/date';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

export default function AdminUsers({ onChanged }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers({ page, limit: 20, search, status });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast(getErrorMessage(error, 'Could not load users.'), 'error');
    } finally { setLoading(false); }
  }, [page, search, status, toast]);
  useEffect(() => { load(); }, [load]);

  const submitSearch = (event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  const change = (event) => setEditing((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setErrors([]);
    try {
      await updateUser(editing.id, editing);
      toast('User account updated.');
      setEditing(null);
      await load();
      onChanged();
    } catch (error) {
      setErrors(getErrorDetails(error));
      toast(getErrorMessage(error, 'Could not update the user.'), 'error');
    } finally { setSaving(false); }
  };

  return (
    <section>
      <div className="section-title-row"><div><span className="eyebrow">Account controls</span><h1>Users</h1><p>Manage profiles, goals, allocations, and access.</p></div></div>
      <div className="filter-bar">
        <form className="search-box" onSubmit={submitSearch}><Search size={18} /><label className="sr-only" htmlFor="user-search">Search users</label><input id="user-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, username, or email" /><button type="submit">Search</button></form>
        <label className="filter-select"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></label>
      </div>
      <div className="panel table-panel">
        {loading ? <LoadingSpinner label="Loading users…" /> : users.length === 0 ? <div className="empty-state"><h3>No users found.</h3><p>Try changing the search or status filter.</p></div> : <div className="table-wrap"><table><thead><tr><th>User</th><th>Joined</th><th>Status</th><th>Allocation</th><th>Cal goal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
          {users.map((user) => <tr key={user.id}><td data-label="User"><strong>{user.fullname}</strong><small className="cell-subtitle">@{user.username} · {user.email}</small></td><td data-label="Joined">{displayDate(user.joined)}</td><td data-label="Status"><span className={`status-badge status-${user.status.toLowerCase()}`}>{user.status}</span></td><td data-label="Allocation">{user.allocation}</td><td data-label="Cal goal">{user.calories_goal}</td><td data-label="Protein">{user.protein_goal} g</td><td data-label="Carbs">{user.carbs_goal} g</td><td data-label="Fat">{user.fat_goal} g</td><td className="row-actions"><button type="button" onClick={() => { setEditing({ ...user }); setErrors([]); }} aria-label={`Edit ${user.fullname}`}><Edit3 size={17} /></button></td></tr>)}
        </tbody></table></div>}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      {editing && <div className="modal-backdrop"><form className="modal-card modal-form" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <button type="button" className="modal-close" onClick={() => setEditing(null)} aria-label="Close user editor"><X size={18} /></button><span className="eyebrow">User account</span><h2 id="edit-user-title">Edit @{editing.username}</h2>
        {errors.length > 0 && <div className="form-alert" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <div className="form-grid"><label className="field field-wide"><span>Full name</span><input name="fullname" value={editing.fullname} onChange={change} required /></label><label className="field field-wide"><span>Email</span><input name="email" type="email" value={editing.email} onChange={change} required /></label><label className="field"><span>Status</span><select name="status" value={editing.status} onChange={change}><option>Active</option><option>Inactive</option></select></label><label className="field"><span>Allocation</span><input name="allocation" value={editing.allocation} onChange={change} required /></label><label className="field"><span>Calories goal</span><input name="calories_goal" type="number" min="0" value={editing.calories_goal} onChange={change} required /></label><label className="field"><span>Protein goal (g)</span><input name="protein_goal" type="number" min="0" step="0.01" value={editing.protein_goal} onChange={change} required /></label><label className="field"><span>Carbs goal (g)</span><input name="carbs_goal" type="number" min="0" step="0.01" value={editing.carbs_goal} onChange={change} required /></label><label className="field"><span>Fat goal (g)</span><input name="fat_goal" type="number" min="0" step="0.01" value={editing.fat_goal} onChange={change} required /></label></div>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
      </form></div>}
    </section>
  );
}

