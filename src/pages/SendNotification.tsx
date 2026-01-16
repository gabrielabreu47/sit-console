import React, { useState } from 'react';
import { Send, RefreshCcw, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notificationsModuleService } from '../services/notificationsModuleService';

export const SendNotification: React.FC = () => {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    channel: 'push' as 'push' | 'email' | 'both',
    targetUserId: '',
    targetEmail: '',
    targetPhone: '',
    navigationRoute: '',
    commerceId: '',
    tenantId: ''
  });

  const [navigationParamsFields, setNavigationParamsFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [dataFields, setDataFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Title y message son requeridos');
      return;
    }

    if (!formData.targetUserId && !formData.targetEmail && !formData.targetPhone) {
      toast.error('Debes proporcionar al menos un destino (userId, email o phone)');
      return;
    }

    try {
      setSending(true);

      // Build navigationParams object from fields
      const navigationParamsObj: Record<string, unknown> = {};
      navigationParamsFields.forEach(field => {
        if (field.key.trim()) {
          let parsedValue: unknown = field.value;
          if (field.value === 'true') parsedValue = true;
          else if (field.value === 'false') parsedValue = false;
          else if (field.value === 'null' || field.value === '') parsedValue = null;
          else if (!isNaN(Number(field.value)) && field.value.trim() !== '') parsedValue = Number(field.value);
          else parsedValue = field.value;
          navigationParamsObj[field.key] = parsedValue;
        }
      });

      // Build data object from fields
      const dataObj: Record<string, unknown> = {};
      dataFields.forEach(field => {
        if (field.key.trim()) {
          let parsedValue: unknown = field.value;
          if (field.value === 'true') parsedValue = true;
          else if (field.value === 'false') parsedValue = false;
          else if (field.value === 'null' || field.value === '') parsedValue = null;
          else if (!isNaN(Number(field.value)) && field.value.trim() !== '') parsedValue = Number(field.value);
          else parsedValue = field.value;
          dataObj[field.key] = parsedValue;
        }
      });

      await notificationsModuleService.sendOneTimeNotification({
        title: formData.title,
        message: formData.message,
        channel: formData.channel,
        targetUserId: formData.targetUserId || undefined,
        targetEmail: formData.targetEmail || undefined,
        targetPhone: formData.targetPhone || undefined,
        navigationRoute: formData.navigationRoute || undefined,
        navigationParams: Object.keys(navigationParamsObj).length > 0 ? navigationParamsObj : undefined,
        data: Object.keys(dataObj).length > 0 ? dataObj : undefined,
        commerceId: formData.commerceId || undefined,
        tenantId: formData.tenantId || undefined
      });

      toast.success('Notificación enviada exitosamente');
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        channel: 'push',
        targetUserId: '',
        targetEmail: '',
        targetPhone: '',
        navigationRoute: '',
        commerceId: '',
        tenantId: ''
      });
      setNavigationParamsFields([{ key: '', value: '' }]);
      setDataFields([{ key: '', value: '' }]);
    } catch (err: any) {
      toast.error(err?.message || 'Error al enviar notificación');
    } finally {
      setSending(false);
    }
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
            <h1 className="text-3xl font-bold text-white">Enviar Notificación</h1>
            <p className="text-white/60 mt-1">
              Envía una notificación one-time personalizada sin necesidad de crear una regla o template.
            </p>
            <div className="mt-3 text-sm text-white/70 space-y-1">
              <div>• Útil para comunicaciones urgentes o especiales</div>
              <div>• No requiere regla ni template</div>
              <div>• Soporta navegación y datos personalizados</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Título *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la notificación"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Canal *</label>
                <select
                  className={inputClass}
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                >
                  <option value="push">Push</option>
                  <option value="email">Email</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Mensaje *</label>
              <textarea
                className={inputClass}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Contenido del mensaje"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-lg font-semibold text-white">Destino</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">User ID</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.targetUserId}
                  onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={formData.targetEmail}
                  onChange={(e) => setFormData({ ...formData, targetEmail: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Teléfono</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.targetPhone}
                  onChange={(e) => setFormData({ ...formData, targetPhone: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <p className="text-xs text-white/50">Al menos uno debe ser proporcionado</p>
          </div>

          {/* Navigation */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-lg font-semibold text-white">Navegación (Opcional)</h2>
            <div>
              <label className="block text-sm text-white/70 mb-2">Navigation Route</label>
              <input
                type="text"
                className={inputClass}
                value={formData.navigationRoute}
                onChange={(e) => setFormData({ ...formData, navigationRoute: e.target.value })}
                placeholder="/appointments/in-progress/[id]"
              />
              <p className="text-xs text-white/50 mt-1">Ruta a la que navegar cuando se toque la notificación</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white/70">Navigation Params (opcional)</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNavigationParamsFields([...navigationParamsFields, { key: '', value: '' }])}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar campo
                </Button>
              </div>
              <div className="space-y-2">
                {navigationParamsFields.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className={`${inputClass} flex-1`}
                      placeholder="Nombre (ej: appointmentId)"
                      value={field.key}
                      onChange={(e) => {
                        const updated = [...navigationParamsFields];
                        updated[index] = { ...updated[index], key: e.target.value };
                        setNavigationParamsFields(updated);
                      }}
                    />
                    <input
                      type="text"
                      className={`${inputClass} flex-1`}
                      placeholder="Valor"
                      value={field.value}
                      onChange={(e) => {
                        const updated = [...navigationParamsFields];
                        updated[index] = { ...updated[index], value: e.target.value };
                        setNavigationParamsFields(updated);
                      }}
                    />
                    {navigationParamsFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNavigationParamsFields(navigationParamsFields.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Parámetros para la navegación (ej: appointmentId, action)
              </p>
            </div>
          </div>

          {/* Additional Data */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-lg font-semibold text-white">Datos Adicionales (Opcional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white/70">Data (opcional)</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDataFields([...dataFields, { key: '', value: '' }])}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar campo
                  </Button>
                </div>
                <div className="space-y-2">
                  {dataFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className={`${inputClass} flex-1`}
                        placeholder="Nombre del campo"
                        value={field.key}
                        onChange={(e) => {
                          const updated = [...dataFields];
                          updated[index] = { ...updated[index], key: e.target.value };
                          setDataFields(updated);
                        }}
                      />
                      <input
                        type="text"
                        className={`${inputClass} flex-1`}
                        placeholder="Valor"
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...dataFields];
                          updated[index] = { ...updated[index], value: e.target.value };
                          setDataFields(updated);
                        }}
                      />
                      {dataFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDataFields(dataFields.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Datos adicionales personalizados
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Commerce ID</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.commerceId}
                    onChange={(e) => setFormData({ ...formData, commerceId: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Tenant ID</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleSend} loading={sending}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Notificación
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
