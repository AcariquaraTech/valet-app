import React, { useState, useEffect } from 'react';
import { Users, Key, BarChart3, Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { clientService, accessKeyService } from '../services/api';
import ClientModal from '../components/ClientModal';
import AccessKeyModal from '../components/AccessKeyModal';
import ClientDetailsModal from '../components/ClientDetailsModal';
import './Dashboard.css';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [accessKeys, setAccessKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' ou 'keys'

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, keysRes] = await Promise.all([
        clientService.listClients(),
        accessKeyService.listAccessKeys(),
      ]);

      setClients(clientsRes.data || []);
      setAccessKeys(keysRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return;

    try {
      await clientService.deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      alert('Cliente deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      alert('Erro ao deletar cliente');
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta chave?')) return;

    try {
      await accessKeyService.deleteAccessKey(id);
      setAccessKeys(accessKeys.filter((k) => k.id !== id));
      alert('Chave deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar chave:', error);
      alert('Erro ao deletar chave');
    }
  };

  const handleClientSaved = () => {
    loadData();
    setShowClientModal(false);
    setEditingClient(null);
  };

  const handleKeySaved = () => {
    loadData();
    setShowKeyModal(false);
  };

  if (loading) {
    return <div className="dashboard loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🅰️ Painel Administrativo</h1>
        <p>Gerenciamento de Clientes e Chaves de Acesso</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Users size={24} />
          <div>
            <h3>Clientes</h3>
            <p>{clients.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <Key size={24} />
          <div>
            <h3>Chaves Ativas</h3>
            <p>{accessKeys.filter((k) => k.status === 'active').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 size={24} />
          <div>
            <h3>Total de Chaves</h3>
            <p>{accessKeys.length}</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          👥 Clientes
        </button>
        <button
          className={`tab ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          🔑 Chaves de Acesso
        </button>
      </div>

      {/* TAB: CLIENTES */}
      {activeTab === 'clients' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Clientes (Donos de Estacionamentos)</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingClient(null);
                setShowClientModal(true);
              }}
            >
              <Plus size={18} /> Novo Cliente
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Empresa</th>
                  <th>Chaves</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-bold">{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.companyName || '-'}</td>
                    <td>{client.accessKeys?.length || 0}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => {
                          setEditingClient(client);
                          setShowClientModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CHAVES DE ACESSO */}
      {activeTab === 'keys' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Chaves de Acesso</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowKeyModal(true)}
            >
              <Plus size={18} /> Nova Chave
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Válida até</th>
                  <th>Usuários</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {accessKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="font-mono">{key.code}</td>
                    <td className="font-bold">{key.clientName}</td>
                    <td>{key.clientEmail}</td>
                    <td>
                      <span
                        className={`badge badge-${key.status === 'active' ? 'success' : 'danger'}`}
                      >
                        {key.status === 'active' ? '✓ Ativa' : '✗ Inativa'}
                      </span>
                    </td>
                    <td>{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{key.users?.length || 0}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => {
                          setSelectedClient(key);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showClientModal && (
        <ClientModal
          client={editingClient}
          onClose={() => {
            setShowClientModal(false);
            setEditingClient(null);
          }}
          onSave={handleClientSaved}
        />
      )}

      {showKeyModal && (
        <AccessKeyModal
          clients={clients}
          onClose={() => setShowKeyModal(false)}
          onSave={handleKeySaved}
        />
      )}

      {showDetailsModal && selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClient(null);
          }}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
