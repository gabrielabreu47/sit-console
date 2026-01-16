import React from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { NotificationRule } from '../../types/notifications';

interface RulesTableProps {
  rules: NotificationRule[];
  onEdit: (rule: NotificationRule) => void;
  onToggle: (rule: NotificationRule) => void;
  onTest: (rule: NotificationRule) => void;
  onExecute?: (rule: NotificationRule) => void;
  onDuplicate?: (rule: NotificationRule) => void;
  onDelete?: (rule: NotificationRule) => void;
}

const triggerLabels: Record<string, string> = {
  DbEvent: 'DB_EVENT',
  Scheduled: 'SCHEDULED',
  Analytics: 'ANALYTICS',
  Condition: 'CONDITION',
  ActionInvocation: 'ACTION',
  '0': 'DB_EVENT',
  '1': 'SCHEDULED',
  '2': 'ANALYTICS',
  '3': 'CONDITION',
  '4': 'ACTION'
};

// Helper to format deliveryChannels which can be array, object, or string
const formatDeliveryChannels = (channels: unknown, fallback?: string): string => {
  if (!channels) return fallback || '-';

  if (Array.isArray(channels)) {
    return channels.join(', ');
  }

  if (typeof channels === 'object') {
    // Handle object like { push: true, email: true }
    const enabledChannels = Object.entries(channels as Record<string, boolean>)
      .filter(([, enabled]) => enabled)
      .map(([channel]) => channel);
    return enabledChannels.length > 0 ? enabledChannels.join(', ') : fallback || '-';
  }

  if (typeof channels === 'string') {
    return channels;
  }

  return fallback || '-';
};

export const RulesTable: React.FC<RulesTableProps> = ({ rules, onEdit, onToggle, onTest, onExecute, onDuplicate, onDelete }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <table className="w-full text-left text-sm text-white">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Canales</th>
            <th className="px-4 py-3">Actualizado</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-white/60">
                Sin reglas configuradas
              </td>
            </tr>
          )}
          {rules.map((rule) => (
            <tr key={rule.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-4 py-3">
                <div className="font-semibold">{rule.name}</div>
                <div className="text-xs text-white/60">
                  {rule.tableName && <span>{rule.tableName}</span>} {rule.operation && <span>• {rule.operation}</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-xs">
                <Badge variant="secondary">{triggerLabels[String(rule.triggerType)] || String(rule.triggerType)}</Badge>
              </td>
              <td className="px-4 py-3 text-white/80 capitalize">
                {formatDeliveryChannels(rule.deliveryChannels, rule.template?.channel)}
              </td>
              <td className="px-4 py-3 text-white/70">
                {rule.updatedAt ? format(new Date(rule.updatedAt), 'yyyy-MM-dd HH:mm') : '-'}
              </td>
              <td className="px-4 py-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!rule.isEnabled}
                    onChange={() => onToggle(rule)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  <span className="text-white/80">{rule.isEnabled ? 'On' : 'Off'}</span>
                </label>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onTest(rule)}>
                    Test
                  </Button>
                  {onExecute && (
                    <Button size="sm" variant="ghost" onClick={() => onExecute(rule)}>
                      Ejecutar
                    </Button>
                  )}
                  {onDuplicate && (
                    <Button size="sm" variant="ghost" onClick={() => onDuplicate(rule)}>
                      Duplicar
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => onDelete(rule)}>
                      Eliminar
                    </Button>
                  )}
                  <Button size="sm" onClick={() => onEdit(rule)}>
                    Editar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
