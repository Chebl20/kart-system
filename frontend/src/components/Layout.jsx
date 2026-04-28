import React, { useState } from 'react';
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

export const TopAppBar = ({ title, subtitle }) => {
  return (
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
        <button className="icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
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
