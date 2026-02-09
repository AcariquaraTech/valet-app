import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', accessKeyCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard', 'reports'
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const accessKey = localStorage.getItem('accessKey');
    if (token && accessKey) {
      setIsAuthenticated(true);
      setClientInfo(JSON.parse(accessKey));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://valet-app-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: loginData.username,
          password: loginData.password,
          accessKeyCode: loginData.accessKeyCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Salvar dados da chave de acesso
        if (data.data.accessKey) {
          localStorage.setItem('accessKey', JSON.stringify(data.data.accessKey));
          setClientInfo(data.data.accessKey);
        }
        
        setIsAuthenticated(true);
      } else {
        setError(data.message || data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('accessKey');
    setIsAuthenticated(false);
    setClientInfo(null);
    setLoginData({ username: '', password: '', accessKeyCode: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>🔐 Portal do Cliente</h1>
          <p>Acesse seu estacionamento</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Código da Chave de Acesso</label>
              <input
                type="text"
                value={loginData.accessKeyCode}
                onChange={(e) => setLoginData({ ...loginData, accessKeyCode: e.target.value.toUpperCase() })}
                placeholder="Ex: VALET-XXXXXXXXXXXX"
                required
                style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Use a mesma chave que você usa no aplicativo
              </small>
            </div>

            <div className="form-group">
              <label>Usuário</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Digite seu usuário"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📊 {clientInfo?.companyName || clientInfo?.clientName || 'Seu Estacionamento'}</h1>
            {clientInfo?.clientName && (
              <p className="client-subtitle">
                Cliente: {clientInfo.clientName}
                {clientInfo.status && (
                  <span className={`status-badge ${clientInfo.status}`}>
                    {clientInfo.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}
                  </span>
                )}
              </p>
            )}
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      <div className="app-container">
        <nav className="app-nav">
          <button
            className={`nav-button ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span>📈 Relatórios</span>
          </button>
        </nav>

        <main className="app-main">
          {activePage === 'dashboard' && <Reports />}
        </main>
      </div>
    </div>
  );
}
