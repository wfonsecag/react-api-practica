import { Link } from 'react-router-dom';

function MealCard({ meal }) {
  return (
    <article>
      <Link to={`/recipe/${meal.idMeal}`}>
        <h2>{meal.strMeal}</h2>

        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />
      </Link>
    </article>
  );
}

export default MealCard;