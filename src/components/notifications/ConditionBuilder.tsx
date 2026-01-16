import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';

export type ConditionOperator = 'And' | 'Or';
export type ConditionComparison =
  | 'Equals'
  | 'NotEquals'
  | 'GreaterThan'
  | 'LessThan'
  | 'Contains'
  | 'IsEmpty'
  | 'IsNotEmpty'
  | 'In'
  | 'NotIn'
  | 'StatusChangedFrom'
  | 'StatusChangedTo'
  | 'StatusChangedFromTo';

export interface ConditionRow {
  id: string;
  field: string;
  comparison: ConditionComparison;
  value?: string;
  from?: string;
  to?: string;
}

interface ConditionBuilderProps {
  value?: any;
  onChange: (node: any) => void;
  allowedFields?: string[];
}

const comparisonOptions: { value: ConditionComparison; label: string }[] = [
  { value: 'Equals', label: '= Igual a' },
  { value: 'NotEquals', label: '≠ Distinto' },
  { value: 'GreaterThan', label: '> Mayor que' },
  { value: 'LessThan', label: '< Menor que' },
  { value: 'Contains', label: 'Contiene' },
  { value: 'IsEmpty', label: 'Está vacío' },
  { value: 'IsNotEmpty', label: 'No está vacío' },
  { value: 'In', label: 'En lista' },
  { value: 'NotIn', label: 'Fuera de lista' },
  { value: 'StatusChangedFrom', label: 'Estado cambió desde' },
  { value: 'StatusChangedTo', label: 'Estado cambió a' },
  { value: 'StatusChangedFromTo', label: 'Estado de -> a' }
];

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ value, onChange, allowedFields }) => {
  const [operator, setOperator] = useState<ConditionOperator>('And');
  const [rows, setRows] = useState<ConditionRow[]>([]);
  const isInitialized = React.useRef(false);
  const lastEmittedJson = React.useRef<string>('');

  // Hydrate from external value only once on mount or when value changes significantly
  useEffect(() => {
    if (!value || !value.operator || !Array.isArray(value.children)) {
      return;
    }
    
    const incomingJson = JSON.stringify(value);
    
    // If we just emitted this value, ignore it (prevents loop)
    if (incomingJson === lastEmittedJson.current) {
      return;
    }
    
    // Hydrate state from external value
    setOperator(value.operator);
    setRows(
      value.children.map((child: any, idx: number) => ({
        id: child.id || `row-${idx}`,
        field: child.field || '',
        comparison: (child.comparison || 'Equals') as ConditionComparison,
        value: child.value,
        from: child.from,
        to: child.to
      }))
    );
    
    // Mark as initialized and store the value we just hydrated
    isInitialized.current = true;
    lastEmittedJson.current = incomingJson;
  }, [value]);

  // Build the node from current state
  const buildNode = useMemo(
    () => ({
      operator,
      children: rows.map((row) => ({
        field: row.field,
        comparison: row.comparison,
        value: ['StatusChangedFromTo', 'StatusChangedFrom', 'StatusChangedTo'].includes(row.comparison)
          ? undefined
          : normalizeValue(row.value),
        from: row.from,
        to: row.to
      }))
    }),
    [operator, rows]
  );

  // Emit changes to parent, but only if the value actually changed
  useEffect(() => {
    const nodeJson = JSON.stringify(buildNode);
    
    // Don't emit if it's the same as what we last emitted
    if (nodeJson === lastEmittedJson.current) {
      return;
    }
    
    lastEmittedJson.current = nodeJson;
    onChange(buildNode);
    // Note: onChange intentionally excluded from deps to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildNode]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), field: '', comparison: 'Equals', value: '' }
    ]);
  };

  const updateRow = (id: string, patch: Partial<ConditionRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const fieldClass =
    'w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  return (
    <Card padding="sm" className="space-y-4 bg-white/5 border-white/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-white">Condiciones</p>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value as ConditionOperator)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
          >
            <option value="And">TODAS (AND)</option>
            <option value="Or">CUALQUIERA (OR)</option>
          </select>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 transition"
        >
          <Plus className="h-4 w-4" />
          Agregar condición
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-white/5 bg-white/5 rounded-2xl p-3"
          >
            {allowedFields && allowedFields.length > 0 ? (
              <select
                value={row.field}
                onChange={(e) => updateRow(row.id, { field: e.target.value })}
                className={`${fieldClass} md:col-span-3`}
              >
                <option value="">Campo</option>
                {allowedFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="Campo (ej: status, total)"
                value={row.field}
                onChange={(e) => updateRow(row.id, { field: e.target.value })}
                className={`${fieldClass} md:col-span-3`}
              />
            )}
            <select
              value={row.comparison}
              onChange={(e) => updateRow(row.id, { comparison: e.target.value as ConditionComparison })}
              className={`${fieldClass} md:col-span-3`}
            >
              {comparisonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {row.comparison === 'StatusChangedFromTo' ? (
              <>
                <input
                  placeholder="De (valor previo)"
                  value={row.from || ''}
                  onChange={(e) => updateRow(row.id, { from: e.target.value })}
                  className={`${fieldClass} md:col-span-2`}
                />
                <input
                  placeholder="A (valor nuevo)"
                  value={row.to || ''}
                  onChange={(e) => updateRow(row.id, { to: e.target.value })}
                  className={`${fieldClass} md:col-span-3`}
                />
              </>
            ) : row.comparison === 'StatusChangedFrom' ? (
              <>
                <input
                  placeholder="Valor previo"
                  value={row.value || ''}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  className={`${fieldClass} md:col-span-5`}
                />
                <div className="md:col-span-3" />
              </>
            ) : row.comparison === 'StatusChangedTo' ? (
              <>
                <input
                  placeholder="Valor nuevo"
                  value={row.value || ''}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  className={`${fieldClass} md:col-span-5`}
                />
                <div className="md:col-span-3" />
              </>
            ) : (
              <>
                <input
                  placeholder="Valor (texto, número o lista comma-separated)"
                  value={row.value || ''}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  className={`${fieldClass} md:col-span-5`}
                />
                <div className="md:col-span-3" />
              </>
            )}

            <div className="flex justify-end md:col-span-1">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-center text-white/60">
            Sin condiciones. Se disparará siempre que coincida el evento.
          </div>
        )}
      </div>
    </Card>
  );
};

const normalizeValue = (value?: string) => {
  if (!value) return value;
  const trimmed = value.trim();
  if (trimmed.includes(',')) {
    return trimmed.split(',').map((v) => v.trim());
  }
  return trimmed;
};
