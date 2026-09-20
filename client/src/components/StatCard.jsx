export default function StatCard({ label, value, hint, icon: Icon, tone = 'green' }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-card-icon">{Icon && <Icon size={21} aria-hidden="true" />}</div>
      <div><p>{label}</p><strong>{value}</strong>{hint && <span>{hint}</span>}</div>
    </article>
  );
}

