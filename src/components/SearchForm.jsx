function SearchForm({ search, onSearchChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Ejemplo: chicken"
      />

      <button type="submit">Buscar</button>
    </form>
  );
}

export default SearchForm;