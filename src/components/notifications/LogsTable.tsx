import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, XCircle, Mail, Smartphone, MessageCircle, Eye, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { NotificationDispatchLog } from '../../types/notifications';
import { notificationsModuleService } from '../../services/notificationsModuleService';
import toast from 'react-hot-toast';

interface LogsTableProps {
  logs: NotificationDispatchLog[];
  onSelect: (log: NotificationDispatchLog) => void;
  loading?: boolean;
}

const STATUS_CONFIG = {
  Sent: { icon: CheckCircle, label: 'Enviado', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  success: { icon: CheckCircle, label: 'Enviado', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  Pending: { icon: Clock, label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Failed: { icon: XCircle, label: 'Fallido', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  error: { icon: XCircle, label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
};

const CHANNEL_ICONS = {
  push: Smartphone,
  email: Mail,
  whatsapp: MessageCircle
};

export const LogsTable: React.FC<LogsTableProps> = ({ logs, onSelect, loading }) => {
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());

  const handleResend = async (log: NotificationDispatchLog, e: React.MouseEvent) => {
    e.stopPropagation();
    setResendingIds(prev => new Set(prev).add(log.id));
    try {
      await notificationsModuleService.resendNotification(log.id);
      toast.success('Notificación reenviada exitosamente');
      // Optionally refresh the logs
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || 'Error al reenviar notificación');
    } finally {
      setResendingIds(prev => {
        const next = new Set(prev);
        next.delete(log.id);
        return next;
      });
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-workspace-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Mail className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/60 font-medium">Sin registros</p>
        <p className="text-white/40 text-sm mt-1">Los logs de notificaciones aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const statusConfig = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Failed;
        const StatusIcon = statusConfig.icon;
        const ChannelIcon = CHANNEL_ICONS[log.channel?.toLowerCase() as keyof typeof CHANNEL_ICONS] || Mail;
        const target = log.targetEmail || log.targetPhone || log.targetUserId || 'Desconocido';
        const formattedDate = log.occurredAt 
          ? format(new Date(log.occurredAt), "d 'de' MMM, HH:mm", { locale: es })
          : '-';

        return (
          <div
            key={log.id}
            onClick={() => onSelect(log)}
            className={`group p-4 rounded-2xl border ${statusConfig.border} ${statusConfig.bg} cursor-pointer hover:bg-white/10 transition-all`}
          >
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white truncate text-sm">{log.ruleName || 'Regla sin nombre'}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusConfig.bg} ${statusConfig.color} font-medium flex-shrink-0`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <ChannelIcon className="w-3 h-3" />
                    {log.channel}
                  </span>
                  <span className="flex-shrink-0">→</span>
                  <span className="truncate flex-1 max-w-[150px] md:max-w-xs block" title={target}>
                    {target}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-white/70">{formattedDate}</p>
                {log.error && (
                  <p className="text-xs text-red-400 mt-1 max-w-[150px] truncate">{log.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleResend(log, e)}
                  disabled={resendingIds.has(log.id)}
                  className="text-white/60 hover:text-white/90"
                >
                  <RefreshCw className={`w-4 h-4 ${resendingIds.has(log.id) ? 'animate-spin' : ''}`} />
                </Button>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
            </div>

            {/* Error Banner */}
            {log.error && log.status === 'Failed' && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-300 line-clamp-2">{log.error}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
