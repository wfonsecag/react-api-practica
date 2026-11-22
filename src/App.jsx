import { NavLink, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecipePage from './pages/RecipePage';
import SolicitudesPage from './pages/SolicitudesPage';
import './App.css';

function App() {
  return (
    <>
      <nav className="app-nav" aria-label="Navegación principal">
        <NavLink to="/" end>Recetas</NavLink>
        <NavLink to="/solicitudes">Solicitudes</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/solicitudes" element={<SolicitudesPage />} />
      </Routes>
    </>
  );
}

export default App;