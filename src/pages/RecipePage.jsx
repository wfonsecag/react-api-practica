import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function RecipePage() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );

        if (!response.ok) {
          throw new Error('No se pudo consultar la receta');
        }

        const data = await response.json();
        setMeal(data.meals?.[0] ?? null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  if (loading) {
    return <main><p>Cargando receta...</p></main>;
  }

  if (error) {
    return <main><p>Error: {error}</p></main>;
  }

  if (!meal) {
    return (
      <main>
        <p>Receta no encontrada.</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/">Volver al inicio</Link>

      <article className="meal-detail">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />

        <h1>{meal.strMeal}</h1>
        <p>{meal.strInstructions}</p>
      </article>
    </main>
  );
}

export default RecipePage;
