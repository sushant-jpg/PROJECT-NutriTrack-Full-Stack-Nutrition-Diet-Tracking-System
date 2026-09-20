import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { deleteMeal } from '../services/mealService';
import { displayTime } from '../utils/date';
import { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from './ConfirmDialog';

const value = (number) => Number(number || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function MealTable({ meals, onEdit, onDeleted }) {
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteMeal(target.id);
      toast('Meal deleted.');
      setTarget(null);
      onDeleted();
    } catch (error) {
      toast(getErrorMessage(error, 'Could not delete the meal.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!meals.length) return <div className="empty-state"><div>🍽️</div><h3>No meals recorded for this date.</h3><p>Log a meal to see nutrition totals and history here.</p></div>;

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Food</th><th>Meal</th><th>Quantity</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Time</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {meals.map((meal) => (
              <tr key={meal.id}>
                <td data-label="Food"><strong>{meal.food_name}</strong></td>
                <td data-label="Meal"><span className={`meal-badge meal-${meal.meal_type.toLowerCase()}`}>{meal.meal_type}</span></td>
                <td data-label="Quantity">{value(meal.quantity)} {meal.unit}</td>
                <td data-label="Calories">{value(meal.calories)} kcal</td>
                <td data-label="Protein">{value(meal.protein)} g</td>
                <td data-label="Carbs">{value(meal.carbs)} g</td>
                <td data-label="Fat">{value(meal.fat)} g</td>
                <td data-label="Time">{displayTime(meal.occurred_at)}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => onEdit(meal)} aria-label={`Edit ${meal.food_name}`}><Edit3 size={17} /></button>
                  <button type="button" className="danger" onClick={() => setTarget(meal)} aria-label={`Delete ${meal.food_name}`}><Trash2 size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={Boolean(target)} title="Delete this meal?" message="Are you sure you want to delete this meal? This action cannot be undone." busy={deleting} onConfirm={confirmDelete} onCancel={() => setTarget(null)} />
    </>
  );
}

