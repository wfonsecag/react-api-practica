import { useState } from 'react';
import SearchForm from '../components/SearchForm';
import MealCard from '../components/MealCard';
import useMeals from '../hooks/useMeals';

function HomePage() {
  const [search, setSearch] = useState('chicken');
  const { meals, loading, error } = useMeals(search);

  function searchMeals(event) {
    event.preventDefault();
  }

  return (
    <main>
      <h1>Recetario de Comidas Wilmar</h1>

      <SearchForm
        search={search}
        onSearchChange={setSearch}
        onSubmit={searchMeals}
      />

      {loading && <p>Cargando recetas...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && meals.length === 0 && (
        <p>No se encontraron recetas.</p>
      )}

      {!loading && !error && (
        <section className="meals-grid">
          {meals.map((meal) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default HomePage;
