import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, RefreshCcw, Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationRule } from '../types/notifications';

export const ExecuteRule: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [executing, setExecuting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    primaryKey: '',
    targetUserId: '',
    targetEmail: '',
    targetPhone: ''
  });

  const [dataFields, setDataFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [previousFields, setPreviousFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await notificationsModuleService.getRules();
      setRules(data.filter(r => r.isEnabled)); // Solo mostrar reglas habilitadas
    } catch (err) {
      toast.error('No pudimos cargar las reglas');
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecute = async () => {
    if (!selectedRule) return;

    try {
      setExecuting(true);

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

      // Build previous values object from fields
      const previousObj: Record<string, unknown> = {};
      previousFields.forEach(field => {
        if (field.key.trim()) {
          let parsedValue: unknown = field.value;
          if (field.value === 'true') parsedValue = true;
          else if (field.value === 'false') parsedValue = false;
          else if (field.value === 'null' || field.value === '') parsedValue = null;
          else if (!isNaN(Number(field.value)) && field.value.trim() !== '') parsedValue = Number(field.value);
          else parsedValue = field.value;
          previousObj[field.key] = parsedValue;
        }
      });

      await notificationsModuleService.executeRule(selectedRule.id, {
        primaryKey: formData.primaryKey || undefined,
        data: Object.keys(dataObj).length > 0 ? dataObj : undefined,
        previousValues: Object.keys(previousObj).length > 0 ? previousObj : undefined,
        targetUserId: formData.targetUserId || undefined,
        targetEmail: formData.targetEmail || undefined,
        targetPhone: formData.targetPhone || undefined
      });

      toast.success('Regla ejecutada exitosamente');
      setSelectedRule(null);
      setFormData({
        primaryKey: '',
        targetUserId: '',
        targetEmail: '',
        targetPhone: ''
      });
      setDataFields([{ key: '', value: '' }]);
      setPreviousFields([{ key: '', value: '' }]);
    } catch (err: any) {
      toast.error(err?.message || 'Error al ejecutar la regla');
    } finally {
      setExecuting(false);
    }
  };

  const addDataField = () => {
    setDataFields([...dataFields, { key: '', value: '' }]);
  };

  const removeDataField = (index: number) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const updateDataField = (index: number, field: Partial<{ key: string; value: string }>) => {
    const updated = [...dataFields];
    updated[index] = { ...updated[index], ...field };
    setDataFields(updated);
  };

  const addPreviousField = () => {
    setPreviousFields([...previousFields, { key: '', value: '' }]);
  };

  const removePreviousField = (index: number) => {
    setPreviousFields(previousFields.filter((_, i) => i !== index));
  };

  const updatePreviousField = (index: number, field: Partial<{ key: string; value: string }>) => {
    const updated = [...previousFields];
    updated[index] = { ...updated[index], ...field };
    setPreviousFields(updated);
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
            <h1 className="text-3xl font-bold text-white">Ejecutar Regla</h1>
            <p className="text-white/60 mt-1">
              Ejecuta una regla manualmente con datos específicos sin esperar el evento de base de datos.
            </p>
            <div className="mt-3 text-sm text-white/70 space-y-1">
              <div>• Selecciona una regla habilitada</div>
              <div>• Proporciona los datos necesarios (primaryKey, data, previousValues)</div>
              <div>• Especifica el destino (targetUserId, targetEmail, o targetPhone)</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadRules}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar regla por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-workspace-accent/50"
          />
        </div>

        {/* Rules List */}
        {loading ? (
          <div className="text-center py-12 text-white/60">Cargando reglas...</div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No hay reglas habilitadas disponibles</p>
            <Button onClick={() => navigate('/notifications/rules')}>
              Ver todas las reglas
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRules.map((rule) => (
              <button
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className="w-full text-left p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-workspace-accent/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{rule.name}</p>
                    <p className="text-sm text-white/60 mt-1">
                      {rule.tableName && <span>{rule.tableName}</span>}
                      {rule.operation && <span> • {rule.operation}</span>}
                    </p>
                  </div>
                  <PlayCircle className="h-5 w-5 text-workspace-accent" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Execute Modal */}
      {selectedRule && (
        <Modal
          isOpen={!!selectedRule}
          onClose={() => setSelectedRule(null)}
          title={`Ejecutar: ${selectedRule.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
              <p className="font-semibold mb-1">Información de la regla:</p>
              <p>Tabla: {selectedRule.tableName || 'N/A'}</p>
              <p>Operación: {selectedRule.operation || 'N/A'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Primary Key (opcional)</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.primaryKey}
                  onChange={(e) => setFormData({ ...formData, primaryKey: e.target.value })}
                  placeholder="ID del registro (UUID o string)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Target User ID</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Target Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={formData.targetEmail}
                    onChange={(e) => setFormData({ ...formData, targetEmail: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">Target Phone</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.targetPhone}
                    onChange={(e) => setFormData({ ...formData, targetPhone: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Data Fields */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white/70">Datos Actuales (opcional)</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addDataField}
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
                        placeholder="Nombre del campo (ej: status)"
                        value={field.key}
                        onChange={(e) => updateDataField(index, { key: e.target.value })}
                      />
                      <input
                        type="text"
                        className={`${inputClass} flex-1`}
                        placeholder="Valor (ej: confirmed, 123, true)"
                        value={field.value}
                        onChange={(e) => updateDataField(index, { value: e.target.value })}
                      />
                      {dataFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDataField(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Los valores numéricos y booleanos se convertirán automáticamente
                </p>
              </div>

              {/* Previous Values Fields */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white/70">Valores Anteriores (opcional)</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPreviousField}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar campo
                  </Button>
                </div>
                <div className="space-y-2">
                  {previousFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className={`${inputClass} flex-1`}
                        placeholder="Nombre del campo"
                        value={field.key}
                        onChange={(e) => updatePreviousField(index, { key: e.target.value })}
                      />
                      <input
                        type="text"
                        className={`${inputClass} flex-1`}
                        placeholder="Valor"
                        value={field.value}
                        onChange={(e) => updatePreviousField(index, { value: e.target.value })}
                      />
                      {previousFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePreviousField(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">
                  Valores que tenía el registro antes del cambio
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={() => setSelectedRule(null)}>
                Cancelar
              </Button>
              <Button onClick={handleExecute} loading={executing}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Ejecutar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
