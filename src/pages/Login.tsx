import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [commerceId, setCommerceId] = useState('');
  const [tenantId, setTenantId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    localStorage.setItem('authToken', token.trim());
    if (commerceId || tenantId) {
      sessionStorage.setItem(
        'currentCommerce',
        JSON.stringify({ id: commerceId || undefined, commerceId: commerceId || undefined, tenantId: tenantId || undefined })
      );
    }
    const from = (location.state as any)?.from || '/notifications/rules';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">SIT Console</p>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-white/60 mt-1 text-sm">Pega tu bearer token y opcionalmente el commerce/tenant.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Bearer token *</label>
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40 min-h-[80px]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">CommerceId (opcional)</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
              value={commerceId}
              onChange={(e) => setCommerceId(e.target.value)}
              placeholder="GUID de comercio"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">TenantId (opcional)</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Tenant"
            />
          </div>

          <Button type="submit" className="w-full">
            Guardar y continuar
          </Button>
        </form>
      </Card>
    </div>
  );
};
