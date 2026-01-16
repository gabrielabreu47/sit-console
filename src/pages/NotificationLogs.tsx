import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LogsTable } from '../components/notifications/LogsTable';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationDispatchLog, NotificationRule } from '../types/notifications';

export const NotificationLogs: React.FC = () => {
  const [logs, setLogs] = useState<NotificationDispatchLog[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NotificationDispatchLog | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    ruleId: 'all',
    from: '',
    to: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, rulesResponse] = await Promise.all([
        notificationsModuleService.getLogs(),
        notificationsModuleService.getRules()
      ]);
      const rulesMap = rulesResponse.reduce<Record<string, NotificationRule>>((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {});
      const logsWithNames = logsResponse.map((l) => ({
        ...l,
        ruleName: rulesMap[l.ruleId]?.name || l.ruleName
      }));
      setLogs(logsWithNames);
      setRules(rulesResponse);
    } catch (err) {
      toast.error('No pudimos cargar los logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const statusMatch = filters.status === 'all' || log.status === filters.status;
      const ruleMatch = filters.ruleId === 'all' || log.ruleId === filters.ruleId;
      const fromMatch = filters.from ? new Date(log.occurredAt) >= new Date(filters.from) : true;
      const toMatch = filters.to ? new Date(log.occurredAt) <= new Date(filters.to) : true;
      return statusMatch && ruleMatch && fromMatch && toMatch;
    });
  }, [logs, filters]);

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
            <h1 className="text-3xl font-bold text-white">Logs</h1>
            <p className="text-white/60 mt-1">Auditoría de despachos, errores y reintentos.</p>
            <div className="text-sm text-white/70 mt-2 space-y-1">
              <div>Filtra por estado, regla y rango de fechas.</div>
              <div>Abre el detalle para ver payload y error completo.</div>
            </div>
          </div>
          <Button variant="ghost" onClick={loadData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-white/70">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
            >
              <option value="all" className="bg-[#1a1f2e] text-white">Todos</option>
              <option value="Sent" className="bg-[#1a1f2e] text-white">Enviado</option>
              <option value="Pending" className="bg-[#1a1f2e] text-white">Pendiente</option>
              <option value="Failed" className="bg-[#1a1f2e] text-white">Fallido</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Regla</label>
            <select
              value={filters.ruleId}
              onChange={(e) => setFilters((f) => ({ ...f, ruleId: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
            >
              <option value="all" className="bg-[#1a1f2e] text-white">Todas</option>
              {rules.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#1a1f2e] text-white">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
            />
          </div>
        </div>

        <LogsTable logs={filteredLogs} onSelect={setSelected} loading={loading} />
      </Card>

      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detalle del log" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/60">Regla</p>
                <p className="text-white font-semibold">{selected.ruleName || selected.ruleId}</p>
              </div>
              <div>
                <p className="text-white/60">Fecha</p>
                <p className="text-white">{selected.occurredAt ? new Date(selected.occurredAt).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-white/60">Destino</p>
                <p className="text-white">{selected.targetEmail || selected.targetPhone || selected.targetUserId || '-'}</p>
              </div>
              <div>
                <p className="text-white/60">Canal</p>
                <p className="text-white">{selected.channel}</p>
              </div>
              <div>
                <p className="text-white/60">Estado</p>
                <p className="text-white">{selected.status}</p>
              </div>
            </div>
            {selected.error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {selected.error}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-white/60 text-sm">Payload</p>
              <pre className="rounded-2xl border border-white/10 bg-[#070b12] p-4 text-xs text-white/90 overflow-x-auto">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
