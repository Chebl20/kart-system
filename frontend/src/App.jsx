import React, { useState } from 'react';
import { SideNavBar, TopAppBar } from './components/Layout';
import { PilotosPage } from './pages/PilotosPage';
import { CorridasPage } from './pages/CorridasPage';
import { ResultadosPage } from './pages/ResultadosPage';
import { RankingPage } from './pages/RankingPage';
import { HistoricoPage } from './pages/HistoricoPage';
import './styles/App.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

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
        return <Dashboard setActiveMenu={setActiveMenu} />;
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
    <div className="app">
      <SideNavBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <TopAppBar title={getPageTitle()} />
        <div className="page-wrapper">
          {renderPage()}
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
