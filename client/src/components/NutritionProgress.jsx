const meta = {
  calories: { label: 'Calories', unit: 'kcal', color: 'gold' },
  protein: { label: 'Protein', unit: 'g', color: 'green' },
  carbs: { label: 'Carbohydrates', unit: 'g', color: 'blue' },
  fat: { label: 'Fat', unit: 'g', color: 'coral' }
};

const number = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function NutritionProgress({ nutrient, consumed, goal }) {
  const item = meta[nutrient];
  const percentage = Number(goal) > 0 ? (Number(consumed) / Number(goal)) * 100 : 0;
  return (
    <article className={`nutrition-card nutrition-${item.color}`}>
      <div className="nutrition-card-heading"><span>{item.label}</span><small>{Math.round(percentage)}%</small></div>
      <div className="nutrition-value"><strong>{number(consumed)}</strong><span>/ {number(goal)} {item.unit}</span></div>
      <div className="progress-track" role="progressbar" aria-label={`${item.label} progress`} aria-valuenow={Math.round(percentage)} aria-valuemin="0" aria-valuemax="100">
        <span style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
      </div>
      <p>{percentage > 100 ? `${number(Number(consumed) - Number(goal))} ${item.unit} over goal` : `${number(Math.max(0, Number(goal) - Number(consumed)))} ${item.unit} remaining`}</p>
    </article>
  );
}

