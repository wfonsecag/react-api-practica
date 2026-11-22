function MealDetail({ meal, onClose }) {
  if (!meal) {
    return null;
  }

  return (
    <section className="meal-detail">
      <button type="button" onClick={onClose}>
        Cerrar
      </button>

      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
      />

      <h2>{meal.strMeal}</h2>
      <p>{meal.strInstructions}</p>
    </section>
  );
}

export default MealDetail;