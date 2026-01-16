import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PlayCircle, Plus, X } from 'lucide-react';
import { NotificationRule } from '../../types/notifications';

interface ExecuteRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (payload: {
    primaryKey?: string;
    data?: Record<string, unknown>;
    previousValues?: Record<string, unknown>;
    targetUserId?: string;
    targetEmail?: string;
    targetPhone?: string;
  }) => Promise<void>;
  rule: NotificationRule | null;
  loading?: boolean;
}

interface KeyValuePair {
  key: string;
  value: string;
}

export const ExecuteRuleModal: React.FC<ExecuteRuleModalProps> = ({
  isOpen,
  onClose,
  onExecute,
  rule,
  loading
}) => {
  const [formData, setFormData] = useState({
    primaryKey: '',
    targetUserId: '',
    targetEmail: '',
    targetPhone: ''
  });

  const [dataFields, setDataFields] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [previousFields, setPreviousFields] = useState<KeyValuePair[]>([{ key: '', value: '' }]);

  const handleExecute = async () => {
    if (!rule) return;

    // Build data object from fields
    const dataObj: Record<string, unknown> = {};
    dataFields.forEach(field => {
      if (field.key.trim()) {
        // Try to parse as number or boolean, otherwise keep as string
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

    await onExecute({
      primaryKey: formData.primaryKey || undefined,
      data: Object.keys(dataObj).length > 0 ? dataObj : undefined,
      previousValues: Object.keys(previousObj).length > 0 ? previousObj : undefined,
      targetUserId: formData.targetUserId || undefined,
      targetEmail: formData.targetEmail || undefined,
      targetPhone: formData.targetPhone || undefined
    });

    // Reset form
    setFormData({
      primaryKey: '',
      targetUserId: '',
      targetEmail: '',
      targetPhone: ''
    });
    setDataFields([{ key: '', value: '' }]);
    setPreviousFields([{ key: '', value: '' }]);
  };

  const addDataField = () => {
    setDataFields([...dataFields, { key: '', value: '' }]);
  };

  const removeDataField = (index: number) => {
    setDataFields(dataFields.filter((_, i) => i !== index));
  };

  const updateDataField = (index: number, field: Partial<KeyValuePair>) => {
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

  const updatePreviousField = (index: number, field: Partial<KeyValuePair>) => {
    const updated = [...previousFields];
    updated[index] = { ...updated[index], ...field };
    setPreviousFields(updated);
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  if (!rule) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ejecutar: ${rule.name}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          <p className="font-semibold mb-1">Información de la regla:</p>
          <p>Tabla: {rule.tableName || 'N/A'}</p>
          <p>Operación: {rule.operation || 'N/A'}</p>
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
                    placeholder="Nombre del campo"
                    value={field.key}
                    onChange={(e) => updateDataField(index, { key: e.target.value })}
                  />
                  <input
                    type="text"
                    className={`${inputClass} flex-1`}
                    placeholder="Valor"
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
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExecute} loading={loading}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Ejecutar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
