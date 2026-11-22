import { useEffect, useState } from 'react';

function useMeals(initialSearch) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMeals() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(initialSearch)}`
        );

        if (!response.ok) {
          throw new Error('No se pudo consultar la API');
        }

        const data = await response.json();
        setMeals(data.meals ?? []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [initialSearch]);

  return { meals, loading, error };
}

export default useMeals;