import { useEffect, useMemo, useState } from 'react';
import {
  clearAuthToken,
  createSolicitud,
  createUserByAdmin,
  deleteSolicitud,
  getCurrentUser,
  getSessions,
  getSolicitudes,
  getUsers,
  hasAuthToken,
  login,
  logout,
  register,
  updateSolicitud,
  updateUserStatus,
} from '../api/solicitudesApi';

const initialForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  prioridad: 'Media',
};

const initialCreateUserForm = {
  username: '',
  password: '',
  role: 'user',
};

function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '' });
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken());
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [error, setError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (currentUserError) {
      if (currentUserError.status === 401) {
        clearAuthToken();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      throw currentUserError;
    }
  }

  async function loadSolicitudes() {
    setLoading(true);
    setError('');

    try {
      setSolicitudes(await getSolicitudes());
    } catch (loadError) {
      if (loadError.status === 401) {
        await handleLogout(false);
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    if (!isAdmin) {
      setUsers([]);
      setSessions([]);
      return;
    }

    setAdminError('');
    try {
      const [usersData, sessionsData] = await Promise.all([getUsers(), getSessions()]);
      setUsers(usersData);
      setSessions(sessionsData);
    } catch (adminLoadError) {
      if (adminLoadError.status === 401) {
        await handleLogout(false);
      }
      setAdminError(adminLoadError.message);
    }
  }

  useEffect(() => {
    async function initialize() {
      if (!isAuthenticated) {
        setCurrentUser(null);
        setSolicitudes([]);
        setUsers([]);
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const user = await loadCurrentUser();
        await loadSolicitudes();
        if (user?.role === 'admin') {
          await loadAdminData();
        }
      } catch (initializeError) {
        setError(initializeError.message);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAdminData();
    }
  }, [isAuthenticated, currentUser?.role]);

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

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  function handleRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  }

  function handleCreateUserChange(event) {
    const { name, value } = event.target;
    setCreateUserForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      await login(loginForm.username, loginForm.password);
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      await register(registerForm.username, registerForm.password);
      setAuthMode('login');
      setLoginForm({ username: registerForm.username, password: '' });
      setRegisterForm({ username: '', password: '' });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout(callApi = true) {
    try {
      if (callApi) {
        await logout();
      }
    } catch {
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSolicitudes([]);
      setUsers([]);
      setSessions([]);
      setError('');
      setAdminError('');
    }
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
      if (saveError.status === 401) {
        await handleLogout(false);
      }
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
      if (updateError.status === 401) {
        await handleLogout(false);
      }
      setError(updateError.message);
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      await deleteSolicitud(id);
      await loadSolicitudes();
    } catch (deleteError) {
      if (deleteError.status === 401) {
        await handleLogout(false);
      }
      setError(deleteError.message);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setAdminSaving(true);
    setAdminError('');

    try {
      await createUserByAdmin(createUserForm);
      setCreateUserForm(initialCreateUserForm);
      await loadAdminData();
    } catch (createUserError) {
      setAdminError(createUserError.message);
    } finally {
      setAdminSaving(false);
    }
  }

  async function handleToggleUserStatus(user) {
    setAdminError('');
    try {
      await updateUserStatus(user.id, !user.activo);
      await loadAdminData();
    } catch (toggleError) {
      setAdminError(toggleError.message);
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="solicitudes-page auth-page">
        <section className="auth-card">
          <h1>Acceso a soporte</h1>
          <p>Inicia sesión o crea una cuenta para gestionar solicitudes.</p>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Registrarse
            </button>
          </div>

          {authMode === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                <span>Usuario</span>
                <input
                  name="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  placeholder="usuario"
                  required
                />
              </label>

              <label>
                <span>Contraseña</span>
                <input
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={authLoading}>
                {authLoading ? 'Validando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                <span>Nuevo usuario</span>
                <input
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="mínimo 3 caracteres"
                  required
                />
              </label>

              <label>
                <span>Nueva contraseña</span>
                <input
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="mínimo 6 caracteres"
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={authLoading}>
                {authLoading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {error && <div className="error-message">{error}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="solicitudes-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Centro de soporte</span>
          <h1>Solicitudes</h1>
          <p>
            Sesión activa: <strong>{currentUser?.username}</strong> ({currentUser?.role})
          </p>
        </div>
        <div className="header-actions">
          <button className="refresh-button" type="button" onClick={loadSolicitudes} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button className="logout-button" type="button" onClick={() => handleLogout(true)}>
            Cerrar sesión
          </button>
        </div>
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

      {isAdmin && (
        <section className="admin-section">
          <header>
            <h2>Administración de usuarios</h2>
            <p>Gestiona cuentas activas y revisa el registro de sesiones.</p>
          </header>

          <div className="admin-grid">
            <form className="admin-card" onSubmit={handleCreateUser}>
              <h3>Crear usuario</h3>
              <label>
                <span>Usuario</span>
                <input
                  name="username"
                  value={createUserForm.username}
                  onChange={handleCreateUserChange}
                  placeholder="nuevo.usuario"
                  required
                />
              </label>
              <label>
                <span>Contraseña</span>
                <input
                  name="password"
                  type="password"
                  value={createUserForm.password}
                  onChange={handleCreateUserChange}
                  placeholder="mínimo 6 caracteres"
                  required
                />
              </label>
              <label>
                <span>Rol</span>
                <select name="role" value={createUserForm.role} onChange={handleCreateUserChange}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <button className="primary-button" type="submit" disabled={adminSaving}>
                {adminSaving ? 'Guardando...' : 'Crear usuario'}
              </button>
              {adminError && <div className="error-message">{adminError}</div>}
            </form>

            <article className="admin-card">
              <h3>Usuarios</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
                        <td>
                          <button
                            type="button"
                            className="mini-button"
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={currentUser?.id === user.id}
                          >
                            {user.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <article className="admin-card sessions-card">
            <h3>Registro de sesión (últimos 100)</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{new Date(session.creado_en).toLocaleString()}</td>
                      <td>{session.username}</td>
                      <td>{session.accion}</td>
                      <td>{session.ip || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

export default SolicitudesPage;
