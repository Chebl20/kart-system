import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/components.css';

export const SideNavBar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'speed' },
    { id: 'pilotos', label: 'Pilotos', icon: 'person_add' },
    { id: 'corridas', label: 'Corridas', icon: 'flag' },
    { id: 'resultados', label: 'Resultados', icon: 'timer' },
    { id: 'ranking', label: 'Ranking', icon: 'leaderboard' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">A</div>
        <div>
          <h1>Apex Kart</h1>
          <p>Telemetry Hub</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-new-race">Novo Evento</button>
        <div className="sidebar-links">
          <a href="#history">Histórico</a>
          <a href="#settings">Configurações</a>
        </div>
      </div>
    </aside>
  );
};

export const TopAppBar = ({ title }) => {
  const { isAdmin, username, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    try {
      await login(loginUser, loginPass);
      setOpen(false);
      setLoginPass('');
    } catch (err) {
      setLoginErr(err.response?.data?.erro || 'Falha ao entrar');
    }
  };

  return (
    <>
      <header className="top-app-bar">
        <div className="breadcrumb">
          <span className="breadcrumb-section">Management</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{title}</span>
        </div>
        <div className="app-bar-actions">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
          {isAdmin ? (
            <div className="auth-toolbar">
              <span className="auth-user-label">{username}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
                Sair
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setOpen(true)}
            >
              Entrar (admin)
            </button>
          )}
          <button type="button" className="icon-btn" aria-hidden>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button type="button" className="icon-btn" aria-hidden>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {open && (
        <div
          className="login-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="login-dialog card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="login-title">Administrador</h3>
            <p className="login-hint">Apenas o administrador pode criar corridas e editar resultados.</p>
            <form onSubmit={handleLogin} className="form">
              <Input
                label="Usuário"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Senha"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                autoComplete="current-password"
              />
              {loginErr && <div className="error-message">{loginErr}</div>}
              <div className="login-actions">
                <button type="submit" className="btn btn-primary">
                  Entrar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const Button = ({ children, variant = 'primary', onClick, ...props }) => (
  <button className={`btn btn-${variant}`} onClick={onClick} {...props}>
    {children}
  </button>
);

export const Input = ({ label, value, onChange, placeholder, type = 'text', ...props }) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  </div>
);

export const Select = ({ label, value, onChange, options, ...props }) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <select value={value} onChange={onChange} {...props}>
      <option value="">Selecione...</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
