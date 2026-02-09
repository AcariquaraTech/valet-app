import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { accessKeyService, userService } from '../services/api';
import './Modal.css';

export default function ClientDetailsModal({ client, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: client?.clientName || '',
    clientEmail: client?.clientEmail || '',
    clientPhone: client?.clientPhone || '',
    companyName: client?.companyName || '',
    expiresAt: client?.expiresAt ? new Date(client.expiresAt).toISOString().split('T')[0] : '',
    status: client?.status || 'active',
    observations: client?.observations || '',
  });

  const isAccessKey = !!client?.code;
  const [users, setUsers] = useState(client?.users || []);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [renewMonths, setRenewMonths] = useState(12);
  const [newUser, setNewUser] = useState({
    name: '',
    nickname: '',
    password: '',
    role: 'operator',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!isAccessKey || !client?.id) return;

    const loadUsers = async () => {
      try {
        const [keyUsersRes, availableUsersRes] = await Promise.all([
          accessKeyService.getKeyUsers(client.id),
          accessKeyService.getAvailableUsers(client.id),
        ]);

        setUsers(keyUsersRes.data || []);
        setAllUsers(availableUsersRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    loadUsers();
  }, [client?.id, isAccessKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!isAccessKey) return;

    setLoading(true);
    try {
      await accessKeyService.updateAccessKey(client.id, formData);
      alert('Chave atualizada com sucesso');
      onRefresh();
    } catch (error) {
      alert('Erro ao atualizar: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!confirm(`Renovar chave por ${renewMonths} meses?`)) return;

    setLoading(true);
    try {
      await accessKeyService.renewKey(client.id, renewMonths);
      alert(`Chave renovada por ${renewMonths} meses`);
      onRefresh();
    } catch (error) {
      alert('Erro ao renovar: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = formData.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    try {
      if (newStatus === 'active') {
        await accessKeyService.activateKey(client.id);
      } else {
        await accessKeyService.deactivateKey(client.id);
      }
      setFormData((prev) => ({ ...prev, status: newStatus }));
      alert(`Chave ${newStatus === 'active' ? 'ativada' : 'desativada'}`);
      onRefresh();
    } catch (error) {
      alert('Erro: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleBindUser = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await accessKeyService.bindUserToKey(client.id, selectedUserId);
      const [keyUsersRes, availableUsersRes] = await Promise.all([
        accessKeyService.getKeyUsers(client.id),
        accessKeyService.getAvailableUsers(client.id),
      ]);
      setUsers(keyUsersRes.data || []);
      setAllUsers(availableUsersRes.data || []);
      setSelectedUserId('');
      alert('Usuário vinculado com sucesso');
    } catch (error) {
      alert('Erro ao vincular: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUnbindUser = async (userId) => {
    if (!confirm('Desvincular este usuário da chave?')) return;
    setLoading(true);
    try {
      await accessKeyService.unbindUserFromKey(client.id, userId);
      const [keyUsersRes, availableUsersRes] = await Promise.all([
        accessKeyService.getKeyUsers(client.id),
        accessKeyService.getAvailableUsers(client.id),
      ]);
      setUsers(keyUsersRes.data || []);
      setAllUsers(availableUsersRes.data || []);
      alert('Usuário desvinculado com sucesso');
    } catch (error) {
      alert('Erro ao desvincular: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.nickname || !newUser.password) {
      alert('Nome, usuário e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await userService.createUser({
        ...newUser,
        accessKeyId: client.id,
      });

      const [keyUsersRes, availableUsersRes] = await Promise.all([
        accessKeyService.getKeyUsers(client.id),
        accessKeyService.getAvailableUsers(client.id),
      ]);

      setUsers(keyUsersRes.data || []);
      setAllUsers(availableUsersRes.data || []);
      setNewUser({
        name: '',
        nickname: '',
        password: '',
        role: 'operator',
        phone: '',
        email: '',
      });
      alert('Usuário criado e vinculado com sucesso');
    } catch (error) {
      alert('Erro ao criar usuário: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isAccessKey ? 'Detalhes da Chave' : 'Detalhes do Cliente'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-form">
          {isAccessKey && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <strong>Código:</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', marginTop: '8px', wordBreak: 'break-all' }}>
                {client.code}
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                disabled={!isAccessKey}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                disabled={!isAccessKey}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                disabled={!isAccessKey}
              />
            </div>

            <div className="form-group">
              <label>Empresa</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={!isAccessKey}
              />
            </div>

            {isAccessKey && (
              <>
                <div className="form-group">
                  <label>Válida até</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observações</label>
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                  />
                </div>

                {/* Usuários Vinculados */}
                <div style={{ gridColumn: '1 / -1', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a1a1a' }}>
                    <Users size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Usuários Vinculados ({users.length})
                  </h3>
                  {users.length > 0 ? (
                    <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
                      {users.map((user) => (
                        <div key={user.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{user.nickname}</strong> ({user.role}) - {user.phone || 'Sem telefone'}
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleUnbindUser(user.id)}
                            disabled={loading}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999' }}>Nenhum usuário vinculado</p>
                  )}

                  {/* Vincular usuário existente */}
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                      Vincular usuário existente
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">Selecione um usuário</option>
                        {allUsers
                          .filter((u) => !users.some((ku) => ku.id === u.id))
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nickname} ({u.role})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleBindUser}
                        disabled={loading || !selectedUserId}
                      >
                        Vincular
                      </button>
                    </div>
                  </div>

                  {/* Criar novo usuário */}
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                      Criar e vincular novo usuário
                    </label>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nome</label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Usuário</label>
                        <input
                          type="text"
                          value={newUser.nickname}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, nickname: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Senha</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Função</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                        >
                          <option value="operator">Operador</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Telefone</label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleCreateUser}
                      disabled={loading}
                    >
                      Criar usuário
                    </button>
                  </div>
                </div>

                {/* Renovar Chave */}
                <div style={{ gridColumn: '1 / -1', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a1a1a' }}>Renovar Chave</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                        Meses
                      </label>
                      <select
                        value={renewMonths}
                        onChange={(e) => setRenewMonths(Number(e.target.value))}
                      >
                        <option value={1}>1 mês</option>
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses</option>
                        <option value={12}>12 meses</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleRenew}
                      disabled={loading}
                    >
                      Renovar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {isAccessKey && (
              <>
                <button
                  type="button"
                  className={`btn ${formData.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleToggleStatus}
                  disabled={loading}
                >
                  {formData.status === 'active' ? 'Desativar' : 'Ativar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
            {!isAccessKey && (
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Fechar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
