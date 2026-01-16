import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCcw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RulesTable } from '../components/notifications/RulesTable';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TestRuleModal } from '../components/notifications/TestRuleModal';
import { ExecuteRuleModal } from '../components/notifications/ExecuteRuleModal';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationRule, NotificationTriggerType, NotificationStrategy } from '../types/notifications';

export const NotificationsRules: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    triggerType: 'all',
    enabled: 'all'
  });
  const [ruleToToggle, setRuleToToggle] = useState<NotificationRule | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [testRule, setTestRule] = useState<NotificationRule | null>(null);
  const [executeRule, setExecuteRule] = useState<NotificationRule | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [strategies, setStrategies] = useState<NotificationStrategy[]>([]);
  const [ruleToDelete, setRuleToDelete] = useState<NotificationRule | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadRules();
    loadStrategies();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await notificationsModuleService.getRules();
      setRules(data);
    } catch (err) {
      toast.error('No pudimos cargar las reglas');
    } finally {
      setLoading(false);
    }
  };

  const loadStrategies = async () => {
    try {
      const data = await notificationsModuleService.getStrategies();
      setStrategies(data);
    } catch (err) {
      console.warn('No pudimos cargar estrategias', err);
    }
  };

  const filteredRules = useMemo(() => {
    const normalizeTrigger = (value: any) => {
      if (typeof value === 'number') {
        switch (value) {
          case 0:
            return NotificationTriggerType.DbEvent;
          case 1:
            return NotificationTriggerType.Scheduled;
          case 2:
            return NotificationTriggerType.Analytics;
          case 3:
            return NotificationTriggerType.Condition;
          default:
            return value;
        }
      }
      return value;
    };
    return rules.filter((rule) => {
      const matchesSearch = filters.search
        ? rule.name.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesTrigger =
        filters.triggerType === 'all' ||
        normalizeTrigger(rule.triggerType) === (filters.triggerType as NotificationTriggerType);
      const matchesEnabled =
        filters.enabled === 'all' ||
        (filters.enabled === 'enabled' ? rule.isEnabled : !rule.isEnabled);
      return matchesSearch && matchesTrigger && matchesEnabled;
    });
  }, [rules, filters]);

  const handleToggle = (rule: NotificationRule) => {
    if (rule.isEnabled) {
      setRuleToToggle(rule);
    } else {
      toggleRule(rule);
    }
  };

  const toggleRule = async (rule: NotificationRule) => {
    try {
      setToggleLoading(true);
      if (rule.isEnabled) {
        await notificationsModuleService.disableRule(rule.id);
        toast.success('Regla deshabilitada');
      } else {
        await notificationsModuleService.enableRule(rule.id);
        toast.success('Regla habilitada');
      }
      await loadRules();
    } catch (err) {
      toast.error('No pudimos actualizar la regla');
    } finally {
      setToggleLoading(false);
      setRuleToToggle(null);
    }
  };

  const handleDuplicate = async (rule: NotificationRule) => {
    try {
      const payload = {
        name: `${rule.name} (copia)`,
        isEnabled: false,
        triggerType: rule.triggerType as any,
        deliveryChannels: (rule.deliveryChannels as any) || [],
        templateId: rule.templateId,
        throttlingConfig: rule.throttlingConfig,
        tableName: rule.tableName,
        operation: rule.operation as any,
        watchedColumns: rule.watchedColumns || [],
        channelName: rule.channelName,
        scheduleCron: rule.scheduleCron,
        scheduledStrategy: rule.scheduledStrategy,
        conditionDefinition: rule.conditionDefinition
      };
      await notificationsModuleService.createRule(payload as any);
      toast.success('Regla duplicada (deshabilitada por defecto)');
      await loadRules();
    } catch (err) {
      toast.error('No pudimos duplicar la regla');
    }
  };

  const handleTest = async (payload: any) => {
    if (!testRule) return false;
    try {
      const response = await notificationsModuleService.testRule(testRule.id, payload);
      return !!response?.matched;
    } catch (err) {
      toast.error('Error al probar la regla');
      return false;
    }
  };

  const handleExecute = async (payload: {
    primaryKey?: string;
    data?: Record<string, unknown>;
    previousValues?: Record<string, unknown>;
    targetUserId?: string;
    targetEmail?: string;
    targetPhone?: string;
  }) => {
    if (!executeRule) return;
    try {
      setExecuteLoading(true);
      await notificationsModuleService.executeRule(executeRule.id, payload);
      toast.success('Regla ejecutada exitosamente');
      setExecuteRule(null);
    } catch (err: any) {
      toast.error(err?.message || 'Error al ejecutar la regla');
    } finally {
      setExecuteLoading(false);
    }
  };

  const handleDelete = (rule: NotificationRule) => {
    setRuleToDelete(rule);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      setDeleteLoading(true);
      await notificationsModuleService.deleteRule(ruleToDelete.id);
      toast.success('Regla eliminada');
      setRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
    } catch (err) {
      toast.error('No pudimos eliminar la regla');
    } finally {
      setDeleteLoading(false);
      setRuleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
            <h1 className="text-3xl font-bold text-white">Reglas</h1>
            <p className="text-white/60 mt-1">
              Gestioná disparadores por evento, programados o condicionales. Activá/desactivá sin deploy.
            </p>
            <div className="mt-3 text-sm text-white/70 space-y-1">
              <div>1. Crea una plantilla (texto/canal) antes de asociarla.</div>
              <div>2. Crea la regla y elige tipo de trigger + condiciones.</div>
              <div>3. Habilita: para DB_EVENT se crea el trigger; para Scheduled/Analytics se ejecuta según cron.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={loadRules}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={() => navigate('/notifications/rules/new')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva regla
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-workspace-accent/50"
              />
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={filters.triggerType}
                onChange={(e) => setFilters((f) => ({ ...f, triggerType: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
              >
                <option value="all" className="bg-[#1a1f2e] text-white">Todos los tipos</option>
                <option value={NotificationTriggerType.DbEvent} className="bg-[#1a1f2e] text-white">DB_EVENT</option>
                <option value={NotificationTriggerType.Scheduled} className="bg-[#1a1f2e] text-white">SCHEDULED</option>
                <option value={NotificationTriggerType.Analytics} className="bg-[#1a1f2e] text-white">ANALYTICS</option>
                <option value={NotificationTriggerType.Condition} className="bg-[#1a1f2e] text-white">CONDITION</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Estado</span>
              <select
                value={filters.enabled}
                onChange={(e) => setFilters((f) => ({ ...f, enabled: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-workspace-accent/40"
              >
                <option value="all" className="bg-[#1a1f2e] text-white">Todos</option>
                <option value="enabled" className="bg-[#1a1f2e] text-white">Habilitados</option>
                <option value="disabled" className="bg-[#1a1f2e] text-white">Deshabilitados</option>
              </select>
            </div>
          </div>
        </div>

        <RulesTable
          rules={filteredRules}
          onEdit={(rule) => navigate(`/notifications/rules/${rule.id}`)}
          onToggle={handleToggle}
          onTest={(rule) => setTestRule(rule)}
          onExecute={(rule) => setExecuteRule(rule)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
        {loading && <div className="text-center text-white/60">Cargando...</div>}
      </Card>

      <ConfirmModal
        isOpen={!!ruleToToggle}
        onClose={() => setRuleToToggle(null)}
        onConfirm={() => ruleToToggle && toggleRule(ruleToToggle)}
        title="Deshabilitar regla"
        message={`¿Seguro que querés desactivar "${ruleToToggle?.name}"? Se eliminará el trigger en la base.`}
        loading={toggleLoading}
      />

      <ConfirmModal
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar regla"
        message={`¿Seguro que querés eliminar "${ruleToDelete?.name}"? Esta acción no se puede deshacer.`}
        loading={deleteLoading}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <TestRuleModal
        isOpen={!!testRule}
        onClose={() => setTestRule(null)}
        onTest={handleTest}
        defaultTable={testRule?.tableName || ''}
      />

      <ExecuteRuleModal
        isOpen={!!executeRule}
        onClose={() => setExecuteRule(null)}
        onExecute={handleExecute}
        rule={executeRule}
        loading={executeLoading}
      />
    </div>
  );
};
