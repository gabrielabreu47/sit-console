import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  MessageSquare,
  PlayCircle,
  Send
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationRule, NotificationTemplate, NotificationDispatchLog } from '../types/notifications';

interface DashboardStats {
  totalRules: number;
  enabledRules: number;
  totalTemplates: number;
  recentLogs: NotificationDispatchLog[];
  successRate: number;
  failedCount: number;
  pendingCount: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRules: 0,
    enabledRules: 0,
    totalTemplates: 0,
    recentLogs: [],
    successRate: 0,
    failedCount: 0,
    pendingCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [rules, templates, logs] = await Promise.all([
        notificationsModuleService.getRules(),
        notificationsModuleService.getTemplates(),
        notificationsModuleService.getLogs()
      ]);

      const enabledRules = rules.filter(r => r.isEnabled).length;
      const recentLogs = logs.slice(0, 10);
      const totalLogs = logs.length;
      const sentLogs = logs.filter(l => l.status === 'Sent' || l.status === 'success').length;
      const failedLogs = logs.filter(l => l.status === 'Failed' || l.status === 'error').length;
      const pendingLogs = logs.filter(l => l.status === 'Pending').length;
      const successRate = totalLogs > 0 ? Math.round((sentLogs / totalLogs) * 100) : 0;

      setStats({
        totalRules: rules.length,
        enabledRules,
        totalTemplates: templates.length,
        recentLogs,
        successRate,
        failedCount: failedLogs,
        pendingCount: pendingLogs
      });
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card 
      padding="md" 
      className={`cursor-pointer transition-all hover:scale-105 ${onClick ? 'hover:border-workspace-accent/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('-400', '-400/20')}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">
            Vista general del sistema de notificaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/notifications/execute')}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Ejecutar
          </Button>
          <Button onClick={() => navigate('/notifications/send')}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reglas"
          value={stats.totalRules}
          icon={<Bell className="h-6 w-6 text-blue-400" />}
          color="text-blue-400"
          onClick={() => navigate('/notifications/rules')}
        />
        <StatCard
          title="Reglas Activas"
          value={stats.enabledRules}
          icon={<CheckCircle className="h-6 w-6 text-green-400" />}
          color="text-green-400"
          onClick={() => navigate('/notifications/rules')}
        />
        <StatCard
          title="Plantillas"
          value={stats.totalTemplates}
          icon={<MessageSquare className="h-6 w-6 text-purple-400" />}
          color="text-purple-400"
          onClick={() => navigate('/notifications/templates')}
        />
        <StatCard
          title="Tasa de Éxito"
          value={`${stats.successRate}%`}
          icon={<TrendingUp className="h-6 w-6 text-amber-400" />}
          color="text-amber-400"
          onClick={() => navigate('/notifications/logs')}
        />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="border-green-500/30 bg-green-500/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-white/60">Exitosas</p>
              <p className="text-2xl font-bold text-green-400">{stats.recentLogs.filter(l => l.status === 'Sent' || l.status === 'success').length}</p>
            </div>
          </div>
        </Card>
        <Card padding="md" className="border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-sm text-white/60">Fallidas</p>
              <p className="text-2xl font-bold text-red-400">{stats.failedCount}</p>
            </div>
          </div>
        </Card>
        <Card padding="md" className="border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-sm text-white/60">Pendientes</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Logs Recientes</h2>
            <p className="text-sm text-white/60 mt-1">Últimas 10 notificaciones enviadas</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/notifications/logs')}>
            Ver todos
          </Button>
        </div>

        {stats.recentLogs.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            No hay logs recientes
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  {log.status === 'Sent' || log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  ) : log.status === 'Failed' || log.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {log.ruleName || log.ruleId}
                    </p>
                    <p className="text-xs text-white/60">
                      {log.targetEmail || log.targetPhone || log.targetUserId || 'Sin destino'} • {log.channel}
                    </p>
                  </div>
                  <div className="text-xs text-white/40 flex-shrink-0">
                    {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-xl font-bold text-white">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="ghost"
            className="justify-start h-auto p-4 border border-white/10 hover:border-workspace-accent/50"
            onClick={() => navigate('/notifications/rules/new')}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-workspace-accent" />
              <div className="text-left">
                <p className="font-semibold text-white">Nueva Regla</p>
                <p className="text-xs text-white/60">Crear regla de notificación</p>
              </div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-auto p-4 border border-white/10 hover:border-workspace-accent/50"
            onClick={() => navigate('/notifications/templates')}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-workspace-accent" />
              <div className="text-left">
                <p className="font-semibold text-white">Nueva Plantilla</p>
                <p className="text-xs text-white/60">Crear plantilla de mensaje</p>
              </div>
            </div>
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-auto p-4 border border-white/10 hover:border-workspace-accent/50"
            onClick={() => navigate('/notifications/execute')}
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="h-5 w-5 text-workspace-accent" />
              <div className="text-left">
                <p className="font-semibold text-white">Ejecutar Regla</p>
                <p className="text-xs text-white/60">Ejecutar regla manualmente</p>
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};
