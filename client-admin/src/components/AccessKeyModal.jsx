import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import { accessKeyService } from '../services/api';
import './Modal.css';

export default function AccessKeyModal({ clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    expiresAt: '',
    status: 'active',
    observations: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const selectedClient = clients.find((c) => c.id === clientId);

    if (selectedClient) {
      setFormData((prev) => ({
        ...prev,
        clientId,
        clientName: selectedClient.contactName || selectedClient.name,
        clientEmail: selectedClient.contactEmail || selectedClient.email,
        clientPhone: selectedClient.contactPhone || selectedClient.phone,
        companyName: selectedClient.companyName || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.clientId) {
        setError('Selecione um cliente');
        setLoading(false);
        return;
      }

      const response = await accessKeyService.createAccessKey(formData);
      setGeneratedKey(response.data);
      alert('Chave criada com sucesso!');
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      console.error('Erro:', err);
      setError(err.response?.data?.error || 'Erro ao criar chave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Chave de Acesso</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {generatedKey && (
          <div className="success-message" style={{ margin: '24px', background: '#d4edda' }}>
            <strong>✓ Chave criada com sucesso!</strong>
            <div style={{ marginTop: '12px', fontFamily: 'monospace', background: 'white', padding: '12px', borderRadius: '4px', wordBreak: 'break-all' }}>
              {generatedKey.code}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Cliente *</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleClientSelect}
                required
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.companyName || client.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nome do Cliente *</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Nome do operador/gerente"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Empresa</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Nome da empresa/estacionamento"
              />
            </div>

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
                placeholder="Notas adicionais..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !!generatedKey}>
              {loading ? 'Criando...' : generatedKey ? 'Criada!' : 'Criar Chave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
