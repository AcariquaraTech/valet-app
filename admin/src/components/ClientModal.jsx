import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clientService } from '../services/api';
import './Modal.css';

export default function ClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    document: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (client?.id) {
        await clientService.updateClient(client.id, formData);
        alert('Cliente atualizado com sucesso');
      } else {
        await clientService.createClient(formData);
        alert('Cliente criado com sucesso');
      }
      onSave();
    } catch (err) {
      console.error('Erro:', err);
      setError(err.response?.data?.error || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nome do cliente"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@exemplo.com"
                disabled={!!client}
              />
            </div>

            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label>Empresa</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Nome da empresa"
              />
            </div>

            <div className="form-group">
              <label>CNPJ/Documento</label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, número"
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Cidade"
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="SP"
                maxLength={2}
              />
            </div>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>

            <div className="form-group">
              <label>Contato - Nome</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Nome do contato"
              />
            </div>

            <div className="form-group">
              <label>Contato - Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contato@email.com"
              />
            </div>

            <div className="form-group">
              <label>Contato - Telefone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
