import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DbOperation } from '../../types/notifications';

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTest: (payload: {
    table: string;
    operation: DbOperation;
    primaryKey?: string;
    changedColumns?: string[];
    data?: Record<string, unknown>;
    previousValues?: Record<string, unknown>;
  }) => Promise<boolean>;
  defaultTable?: string;
}

export const TestRuleModal: React.FC<TestRuleModalProps> = ({ isOpen, onClose, onTest, defaultTable }) => {
  const [form, setForm] = useState({
    table: defaultTable || '',
    operation: DbOperation.Update,
    primaryKey: '',
    changedColumns: 'status',
    payload: '{ "status": "confirmed" }',
    previous: '{ "status": "pending" }'
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = form.payload.trim() ? JSON.parse(form.payload) : {};
      const previousValues = form.previous.trim() ? JSON.parse(form.previous) : {};
      const matched = await onTest({
        table: form.table,
        operation: form.operation,
        primaryKey: form.primaryKey || undefined,
        changedColumns: form.changedColumns ? form.changedColumns.split(',').map((c) => c.trim()).filter(Boolean) : [],
        data,
        previousValues
      });
      setResult(matched ? 'La condición coincide, se dispararía.' : 'No coincide, no se dispara.');
    } catch (err: any) {
      setError('Error al probar la regla. Verifica el JSON.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Probar regla" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Tabla</label>
            <input
              className={inputClass}
              value={form.table}
              onChange={(e) => setForm((p) => ({ ...p, table: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Operación</label>
            <select
              className={inputClass}
              value={form.operation}
              onChange={(e) => setForm((p) => ({ ...p, operation: e.target.value as DbOperation }))}
            >
              <option value={DbOperation.Insert}>Insert</option>
              <option value={DbOperation.Update}>Update</option>
              <option value={DbOperation.Delete}>Delete</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">PK (opcional)</label>
            <input
              className={inputClass}
              value={form.primaryKey}
              onChange={(e) => setForm((p) => ({ ...p, primaryKey: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70">Columnas cambiadas (coma)</label>
          <input
            className={inputClass}
            value={form.changedColumns}
            onChange={(e) => setForm((p) => ({ ...p, changedColumns: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Payload actual (JSON)</label>
            <textarea
              className={inputClass}
              rows={6}
              value={form.payload}
              onChange={(e) => setForm((p) => ({ ...p, payload: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Valores previos (JSON)</label>
            <textarea
              className={inputClass}
              rows={6}
              value={form.previous}
              onChange={(e) => setForm((p) => ({ ...p, previous: e.target.value }))}
            />
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100 text-sm">{error}</div>}
        {result && (
          <div className="rounded-xl border border-workspace-accent/40 bg-workspace-accent/10 px-4 py-3 text-white text-sm">
            {result}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Probar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
