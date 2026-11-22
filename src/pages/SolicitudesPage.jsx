import { useEffect, useMemo, useState } from 'react';
import {
  createSolicitud,
  deleteSolicitud,
  getSolicitudes,
  updateSolicitud,
} from '../api/solicitudesApi';

const initialForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  prioridad: 'Media',
};

function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  async function loadSolicitudes() {
    setLoading(true);
    setError('');

    try {
      setSolicitudes(await getSolicitudes());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const filteredSolicitudes = useMemo(() => {
    const text = search.trim().toLowerCase();

    return solicitudes.filter((solicitud) => {
      const matchesStatus = filter === 'Todas' || solicitud.estado === filter;
      const matchesText = !text || [solicitud.titulo, solicitud.descripcion, solicitud.categoria]
        .some((value) => value?.toLowerCase().includes(text));

      return matchesStatus && matchesText;
    });
  }, [solicitudes, filter, search]);

  const totals = useMemo(() => ({
    total: solicitudes.length,
    pending: solicitudes.filter(({ estado }) => estado === 'Pendiente').length,
    progress: solicitudes.filter(({ estado }) => estado === 'En progreso').length,
    resolved: solicitudes.filter(({ estado }) => estado === 'Resuelta').length,
  }), [solicitudes]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createSolicitud(form);
      setForm(initialForm);
      await loadSolicitudes();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStateChange(solicitud, estado) {
    setError('');

    try {
      await updateSolicitud(solicitud.id, { ...solicitud, estado });
      await loadSolicitudes();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      await deleteSolicitud(id);
      await loadSolicitudes();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="solicitudes-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Centro de soporte</span>
          <h1>Solicitudes</h1>
          <p>Gestiona, organiza y resuelve las solicitudes del equipo.</p>
        </div>
        <button className="refresh-button" type="button" onClick={loadSolicitudes} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      <section className="stats-grid" aria-label="Resumen de solicitudes">
        <article className="stat-card"><span>Total</span><strong>{totals.total}</strong></article>
        <article className="stat-card pending"><span>Pendientes</span><strong>{totals.pending}</strong></article>
        <article className="stat-card progress"><span>En progreso</span><strong>{totals.progress}</strong></article>
        <article className="stat-card resolved"><span>Resueltas</span><strong>{totals.resolved}</strong></article>
      </section>

      <section className="solicitudes-layout">
        <form className="solicitud-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Nueva solicitud</h2>
            <p>Completa los datos principales.</p>
          </div>

          <label>
            <span>Título</span>
            <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej. Equipo sin conexión" required />
          </label>

          <label>
            <span>Descripción</span>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe el problema o solicitud" required />
          </label>

          <label>
            <span>Categoría</span>
            <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ej. Infraestructura" required />
          </label>

          <label>
            <span>Prioridad</span>
            <select name="prioridad" value={form.prioridad} onChange={handleChange}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </form>

        <section className="solicitudes-panel">
          <div className="panel-toolbar">
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar solicitudes..."
              aria-label="Buscar solicitudes"
            />
            <div className="filter-tabs" aria-label="Filtrar por estado">
              {['Todas', 'Pendiente', 'En progreso', 'Resuelta'].map((option) => (
                <button
                  type="button"
                  className={filter === option ? 'active' : ''}
                  onClick={() => setFilter(option)}
                  key={option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-state">Cargando solicitudes...</div>}

          {!loading && filteredSolicitudes.length === 0 && (
            <div className="empty-state">
              <strong>No hay solicitudes para mostrar</strong>
              <span>Prueba otra búsqueda o cambia el filtro.</span>
            </div>
          )}

          <div className="solicitudes-lista">
            {filteredSolicitudes.map((solicitud) => (
              <article className="solicitud-card" key={solicitud.id}>
                <div className="card-main">
                  <div className="card-title-row">
                    <h2>{solicitud.titulo}</h2>
                    <span className={`priority-badge priority-${solicitud.prioridad?.toLowerCase()}`}>
                      {solicitud.prioridad}
                    </span>
                  </div>
                  <p className="card-description">{solicitud.descripcion}</p>
                  <div className="card-meta">
                    <span>{solicitud.categoria}</span>
                    {solicitud.creado_en && <time>#{solicitud.id} · {new Date(solicitud.creado_en).toLocaleDateString()}</time>}
                  </div>
                </div>

                <div className="card-actions">
                  <select
                    value={solicitud.estado}
                    onChange={(event) => handleStateChange(solicitud, event.target.value)}
                    aria-label={`Estado de ${solicitud.titulo}`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Resuelta">Resuelta</option>
                  </select>
                  <button className="delete-button" type="button" onClick={() => handleDelete(solicitud.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default SolicitudesPage;
