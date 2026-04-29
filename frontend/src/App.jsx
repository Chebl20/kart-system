import React, { useState, lazy, Suspense, useEffect } from 'react';
import { SideNavBar, TopAppBar } from './components/Layout';
import './styles/App.css';

/**
 * Route views are lazy-loaded so the initial JS payload stays smaller on mobile networks.
 * `mobileNavOpen` drives the off-canvas sidebar; desktop (≥900px) keeps the sidebar fixed and ignores transform.
 */
const PilotosPage = lazy(() =>
  import('./pages/PilotosPage').then((m) => ({ default: m.PilotosPage }))
);
const CorridasPage = lazy(() =>
  import('./pages/CorridasPage').then((m) => ({ default: m.CorridasPage }))
);
const ResultadosPage = lazy(() =>
  import('./pages/ResultadosPage').then((m) => ({ default: m.ResultadosPage }))
);
const RankingPage = lazy(() =>
  import('./pages/RankingPage').then((m) => ({ default: m.RankingPage }))
);
const HistoricoPage = lazy(() =>
  import('./pages/HistoricoPage').then((m) => ({ default: m.HistoricoPage }))
);

function PageFallback() {
  return (
    <div className="page-container">
      <div className="loading" role="status" aria-live="polite">
        Carregando…
      </div>
    </div>
  );
}

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  /* Prevent background scroll while the mobile drawer is open (iOS / Android). */
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.classList.add('nav-drawer-open');
    } else {
      document.body.classList.remove('nav-drawer-open');
    }
    return () => document.body.classList.remove('nav-drawer-open');
  }, [mobileNavOpen]);

  const handleSetActiveMenu = (id) => {
    setActiveMenu(id);
    closeMobileNav();
  };

  const renderPage = () => {
    switch (activeMenu) {
      case 'pilotos':
        return <PilotosPage />;
      case 'corridas':
        return <CorridasPage />;
      case 'resultados':
        return <ResultadosPage />;
      case 'ranking':
        return <RankingPage />;
      case 'historico':
        return <HistoricoPage />;
      default:
        return <Dashboard setActiveMenu={handleSetActiveMenu} />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      pilotos: 'Pilotos',
      corridas: 'Corridas',
      resultados: 'Resultados',
      ranking: 'Ranking',
      historico: 'Histórico'
    };
    return titles[activeMenu] || 'Dashboard';
  };

  return (
    <div className={`app${mobileNavOpen ? ' app--nav-open' : ''}`}>
      <SideNavBar
        activeMenu={activeMenu}
        setActiveMenu={handleSetActiveMenu}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={closeMobileNav}
      />
      <div className="main-content">
        <TopAppBar
          title={getPageTitle()}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
        />
        <div className="page-wrapper">
          <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}

const Dashboard = ({ setActiveMenu }) => (
  <div className="page-container">
    <div className="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Bem-vindo ao Apex Kart Management System</p>
      </div>
    </div>
    <div className="dashboard-grid">
      <div className="dashboard-card" onClick={() => setActiveMenu('ranking')}>
        <h3>Estatísticas Gerais</h3>
        <p>Acompanhe o desempenho do campeonato em tempo real</p>
      </div>
      <div className="dashboard-card" onClick={() => setActiveMenu('corridas')}>
        <h3>Próximas Corridas</h3>
        <p>Consulte o calendário de eventos</p>
      </div>
      <div className="dashboard-card" onClick={() => setActiveMenu('ranking')}>
        <h3>Ranking Atual</h3>
        <p>Veja a posição dos pilotos</p>
      </div>
      <div className="dashboard-card" onClick={() => setActiveMenu('pilotos')}>
        <h3>Gerenciamento</h3>
        <p>Cadastre pilotos, corridas e resultados</p>
      </div>
    </div>
  </div>
);

export default App;
