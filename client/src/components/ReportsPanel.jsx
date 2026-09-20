import { useEffect, useState } from 'react';
import { CalendarRange, Flame, Salad, Utensils } from 'lucide-react';
import { getReport } from '../services/reportService';
import { getErrorMessage } from '../services/api';
import { displayDate } from '../utils/date';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ReportChart from './ReportChart';
import StatCard from './StatCard';

const number = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function ReportsPanel({ date }) {
  const [period, setPeriod] = useState('daily');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getReport(date, period)
      .then((response) => { if (active) setReport(response.data.data); })
      .catch((error) => {
        if (active) { setReport(null); toast(getErrorMessage(error, 'Could not load the report.'), 'error'); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, period, toast]);

  return (
    <section>
      <div className="section-title-row">
        <div><span className="eyebrow">Nutrition insights</span><h1>Reports</h1><p>Review real totals from your recorded meals.</p></div>
        <div className="segmented-control" aria-label="Report period">
          {['daily', 'weekly', 'monthly'].map((item) => <button type="button" key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}
        </div>
      </div>
      {loading ? <div className="panel"><LoadingSpinner label="Building your report…" /></div> : report && (
        <>
          <div className="report-range"><CalendarRange size={18} /><span>{displayDate(report.start)}{report.start !== report.end && ` – ${displayDate(report.end)}`}</span></div>
          <div className="stat-grid report-stats">
            <StatCard label="Total calories" value={`${number(report.totals.calories)} kcal`} icon={Flame} tone="gold" />
            <StatCard label="Protein" value={`${number(report.totals.protein)} g`} icon={Salad} tone="green" />
            <StatCard label="Carbohydrates" value={`${number(report.totals.carbs)} g`} icon={Salad} tone="blue" />
            <StatCard label="Meals logged" value={number(report.totals.meals)} hint={`${number(report.totals.fat)} g total fat`} icon={Utensils} tone="coral" />
          </div>
          {report.totals.meals === 0 ? (
            <div className="empty-state panel"><div>📊</div><h3>No nutrition records found for this period.</h3><p>Your report will appear once meals are logged.</p></div>
          ) : report.period === 'daily' ? (
            <div className="panel">
              <div className="panel-heading"><div><h2>Meal type breakdown</h2><p>How the day’s nutrients were distributed.</p></div></div>
              <div className="table-wrap"><table><thead><tr><th>Meal type</th><th>Meals</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead><tbody>
                {report.breakdown.map((item) => <tr key={item.meal_type}><td data-label="Meal type"><span className={`meal-badge meal-${item.meal_type.toLowerCase()}`}>{item.meal_type}</span></td><td data-label="Meals">{item.meals}</td><td data-label="Calories">{number(item.calories)} kcal</td><td data-label="Protein">{number(item.protein)} g</td><td data-label="Carbs">{number(item.carbs)} g</td><td data-label="Fat">{number(item.fat)} g</td></tr>)}
              </tbody></table></div>
            </div>
          ) : (
            <>
              <div className="panel"><div className="panel-heading"><div><h2>Calories by day</h2><p>Days without meals remain at zero.</p></div></div><ReportChart series={report.series} /></div>
              <div className="panel"><div className="panel-heading"><div><h2>Daily totals</h2><p>A complete text view of the chart data.</p></div></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Meals</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead><tbody>
                {report.series.map((item) => <tr key={item.date}><td data-label="Date"><strong>{displayDate(item.date)}</strong></td><td data-label="Meals">{item.meals}</td><td data-label="Calories">{number(item.calories)} kcal</td><td data-label="Protein">{number(item.protein)} g</td><td data-label="Carbs">{number(item.carbs)} g</td><td data-label="Fat">{number(item.fat)} g</td></tr>)}
              </tbody></table></div></div>
            </>
          )}
        </>
      )}
    </section>
  );
}
