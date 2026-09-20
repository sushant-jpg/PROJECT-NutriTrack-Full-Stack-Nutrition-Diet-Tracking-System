import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { createMeal, updateMeal } from '../services/mealService';
import { getErrorDetails, getErrorMessage } from '../services/api';
import { localDateTimeInput, toDateTimeInput } from '../utils/date';
import { useToast } from '../context/ToastContext';

const FOOD_NUTRITION = [
  { names: ['apple'], label: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { names: ['banana'], label: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { names: ['chicken breast', 'chicken'], label: 'Chicken breast', calories: 284, protein: 53, carbs: 0, fat: 6.2 },
  { names: ['egg', 'eggs'], label: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { names: ['oatmeal', 'oats'], label: 'Oatmeal', calories: 154, protein: 5.4, carbs: 27.4, fat: 2.6 },
  { names: ['rice', 'white rice'], label: 'Cooked rice', calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4 },
  { names: ['salmon'], label: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 12 },
  { names: ['bread', 'toast'], label: 'Bread', calories: 79, protein: 2.7, carbs: 14.7, fat: 1 },
  { names: ['milk'], label: 'Milk', calories: 122, protein: 8.1, carbs: 12, fat: 4.8 },
  { names: ['yogurt', 'yoghurt'], label: 'Yogurt', calories: 100, protein: 10, carbs: 6, fat: 0.4 }
];

function findFoodNutrition(foodName) {
  const normalized = foodName.trim().toLowerCase();
  return FOOD_NUTRITION.find((food) => food.names.includes(normalized));
}

function blankMeal(selectedDate) {
  const now = new Date();
  const time = localDateTimeInput(now).slice(11);
  return {
    food_name: '', quantity: '1', unit: 'serving', meal_type: 'Breakfast',
    occurred_at: `${selectedDate}T${time}`,
    calories: '', protein: '', carbs: '', fat: ''
  };
}

export default function MealForm({ editingMeal, selectedDate, onSaved, onCancel }) {
  const [form, setForm] = useState(() => blankMeal(selectedDate));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (editingMeal) {
      setForm({
        food_name: editingMeal.food_name,
        quantity: editingMeal.quantity,
        unit: editingMeal.unit,
        meal_type: editingMeal.meal_type,
        occurred_at: toDateTimeInput(editingMeal.occurred_at),
        calories: editingMeal.calories,
        protein: editingMeal.protein,
        carbs: editingMeal.carbs,
        fat: editingMeal.fat
      });
    } else {
      setForm(blankMeal(selectedDate));
    }
    setErrors([]);
  }, [editingMeal, selectedDate]);

  const matchedFood = findFoodNutrition(form.food_name);

  useEffect(() => {
    if (!matchedFood || !Number.isFinite(Number(form.quantity)) || Number(form.quantity) <= 0) return;
    const quantity = Number(form.quantity);
    setForm((current) => ({
      ...current,
      calories: (matchedFood.calories * quantity).toFixed(2),
      protein: (matchedFood.protein * quantity).toFixed(2),
      carbs: (matchedFood.carbs * quantity).toFixed(2),
      fat: (matchedFood.fat * quantity).toFixed(2)
    }));
  }, [form.food_name, form.quantity, matchedFood]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity), calories: Number(form.calories),
        protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat)
      };
      if (editingMeal) await updateMeal(editingMeal.id, payload);
      else await createMeal(payload);
      toast(editingMeal ? 'Meal updated successfully.' : 'Meal added successfully.');
      setForm(blankMeal(selectedDate));
      onSaved();
    } catch (error) {
      setErrors(getErrorDetails(error));
      toast(getErrorMessage(error, 'Could not save the meal.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel meal-form" onSubmit={submit}>
      <div className="panel-heading">
        <div><span className="eyebrow">Meal details</span><h2>{editingMeal ? 'Edit meal' : 'Log your food'}</h2><p>Choose a recognised food to fill nutrition automatically, or enter custom values.</p></div>
        {editingMeal && <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel editing"><X size={20} /></button>}
      </div>
      {errors.length > 0 && <div className="form-alert" role="alert"><strong>Please check:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      <div className="form-grid">
        <label className="field field-wide"><span>Food name</span><input name="food_name" value={form.food_name} onChange={change} required maxLength="160" placeholder="e.g. Chicken rice" /></label>
        <label className="field"><span>Quantity</span><input name="quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={change} required /></label>
        <label className="field"><span>Unit</span><input name="unit" value={form.unit} onChange={change} required maxLength="40" placeholder="plate, cup, g…" /></label>
        <label className="field"><span>Meal type</span><select name="meal_type" value={form.meal_type} onChange={change}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label>
        <label className="field"><span>Date and time eaten</span><input name="occurred_at" type="datetime-local" value={form.occurred_at} onChange={change} required /></label>
      </div>
      {matchedFood && <p className="auto-fill-note" aria-live="polite">Nutrition filled automatically for {matchedFood.label} per quantity entered. You can adjust these values.</p>}
      <div className="nutrient-inputs">
        <label className="field"><span>Calories <small>kcal</small></span><input name="calories" type="number" min="0" step="0.01" value={form.calories} onChange={change} required placeholder="0" /></label>
        <label className="field"><span>Protein <small>g</small></span><input name="protein" type="number" min="0" step="0.01" value={form.protein} onChange={change} required placeholder="0" /></label>
        <label className="field"><span>Carbohydrates <small>g</small></span><input name="carbs" type="number" min="0" step="0.01" value={form.carbs} onChange={change} required placeholder="0" /></label>
        <label className="field"><span>Fat <small>g</small></span><input name="fat" type="number" min="0" step="0.01" value={form.fat} onChange={change} required placeholder="0" /></label>
      </div>
      <div className="form-actions">
        {editingMeal && <button type="button" className="button button-ghost" onClick={onCancel} disabled={submitting}>Cancel edit</button>}
        <button type="submit" className="button" disabled={submitting}><Save size={17} /> {submitting ? 'Saving…' : editingMeal ? 'Save changes' : 'Add meal'}</button>
      </div>
    </form>
  );
}

