import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Database, Timer, Mail, Smartphone, MessageCircle, ChevronRight, ChevronLeft, Check, HelpCircle, Zap, Calendar, BarChart2, Filter, Info, AlertCircle, Users, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { NotificationTemplate, NotificationTriggerType, DbOperation, NotificationChannel, NotificationStrategy, NotificationEntity, NotificationTargetAudience } from '../../types/notifications';
import { ConditionBuilder } from './ConditionBuilder';

interface RuleFormProps {
  rule?: any;
  templates: NotificationTemplate[];
  strategies?: NotificationStrategy[];
  entities?: NotificationEntity[];
  onSubmit: (payload: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TRIGGER_OPTIONS = [
  {
    type: NotificationTriggerType.DbEvent,
    icon: Database,
    title: 'Cuando algo cambie en la base de datos',
    description: 'Se dispara automáticamente cuando se crea, actualiza o elimina un registro',
    example: 'Ej: Cuando una cita cambia a "confirmada"',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: NotificationTriggerType.Scheduled,
    icon: Calendar,
    title: 'De forma programada',
    description: 'Se ejecuta según un horario definido (diario, semanal, etc.)',
    example: 'Ej: Recordatorios 24h antes de cada cita',
    color: 'from-purple-500 to-pink-500'
  },
  {
    type: NotificationTriggerType.Analytics,
    icon: BarChart2,
    title: 'Basado en análisis de datos',
    description: 'Detecta patrones como clientes inactivos o baja ocupación',
    example: 'Ej: Cuando un cliente frecuente deja de agendar',
    color: 'from-orange-500 to-amber-500'
  }
];

const CHANNEL_OPTIONS = [
  { value: 'push' as NotificationChannel, icon: Smartphone, label: 'Push', description: 'Notificación en el teléfono' },
  { value: 'email' as NotificationChannel, icon: Mail, label: 'Email', description: 'Correo electrónico' },
  { value: 'whatsapp' as NotificationChannel, icon: MessageCircle, label: 'WhatsApp', description: 'Mensaje de WhatsApp' }
];

const DB_OPERATIONS = [
  { value: DbOperation.Insert, label: 'Se crea', description: 'Cuando se agrega un nuevo registro', icon: '➕' },
  { value: DbOperation.Update, label: 'Se modifica', description: 'Cuando cambia algún campo', icon: '✏️' },
  { value: DbOperation.Delete, label: 'Se elimina', description: 'Cuando se borra un registro', icon: '🗑️' }
];

const COMMON_TABLES = [
  { value: 'Appointments', label: '📅 Citas', description: 'Agendamientos de clientes' },
  { value: 'Clients', label: '👤 Clientes', description: 'Información de clientes' },
  { value: 'QueueClients', label: '📋 Cola de espera', description: 'Turnos en cola' },
  { value: 'Messages', label: '💬 Mensajes', description: 'Chat y comunicaciones' },
  { value: 'Reminders', label: '⏰ Recordatorios', description: 'Recordatorios configurados' }
];

const COMMON_CRONS = [
  { label: 'Cada hora', value: '0 * * * *', description: 'Al inicio de cada hora' },
  { label: 'Diario 9am', value: '0 9 * * *', description: 'Todos los días a las 9:00' },
  { label: 'Diario 8pm', value: '0 20 * * *', description: 'Todos los días a las 8:00 PM' },
  { label: 'Cada 30 min', value: '*/30 * * * *', description: 'Cada media hora' },
  { label: 'Lunes 9am', value: '0 9 * * 1', description: 'Todos los lunes a las 9:00' }
];

const fallbackEntityCatalog: Record<string, string[]> = {
  Appointments: ['Id','ClientId','Status','DateTime','EstimatedArrival1','ServiceRate'],
  Clients: ['Id','Name','Email','PhoneNumber','Status'],
  QueueClients: ['Id','Status','Position'],
  Messages: ['Id','Content','Direction'],
  Reminders: ['Id','Title','Type']
};

export const RuleForm: React.FC<RuleFormProps> = ({ rule, templates, strategies = [], entities = [], onSubmit, onCancel, loading }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [name, setName] = useState(rule?.name || '');
  const [triggerType, setTriggerType] = useState<NotificationTriggerType>(
    rule?.triggerType ?? NotificationTriggerType.DbEvent
  );
  const [targetAudience, setTargetAudience] = useState<NotificationTargetAudience>(
    rule?.targetAudience ?? NotificationTargetAudience.Client
  );
  const [delivery, setDelivery] = useState<NotificationChannel[]>(
    Array.isArray(rule?.deliveryChannels) ? rule.deliveryChannels : []
  );
  const [templateId, setTemplateId] = useState<string>(rule?.templateId || '');
  const [tableName, setTableName] = useState<string>(rule?.tableName || 'Appointments');
  const [operation, setOperation] = useState<DbOperation>(rule?.operation ?? DbOperation.Update);
  const [watchedColumns, setWatchedColumns] = useState<string[]>(rule?.watchedColumns || []);
  const [scheduleCron, setScheduleCron] = useState<string>(rule?.scheduleCron || '0 9 * * *');
  const [scheduledStrategy, setScheduledStrategy] = useState<string>(rule?.scheduledStrategy || '');
  const [strategyParams, setStrategyParams] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState<any>(rule?.conditionDefinition || null);
  const [throttling, setThrottling] = useState<{ dedupeKey?: string; cooldownMinutes?: number }>({
    dedupeKey: rule?.throttlingConfig?.dedupeKey || '',
    cooldownMinutes: rule?.throttlingConfig?.cooldownMinutes
  });

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.name === scheduledStrategy),
    [strategies, scheduledStrategy]
  );

  const entityMap = useMemo(() => {
    if (entities.length === 0) return fallbackEntityCatalog;
    return entities.reduce<Record<string, string[]>>((acc, curr) => {
      acc[curr.table] = curr.allowedFields || [];
      return acc;
    }, {});
  }, [entities]);

  const allowedFields = useMemo(() => {
    return entityMap[tableName] || [];
  }, [tableName, entityMap]);

  useEffect(() => {
    if (strategies.length > 0 && !scheduledStrategy) {
      setScheduledStrategy(strategies[0].name);
    }
  }, [strategies, scheduledStrategy]);

  useEffect(() => {
    if (selectedStrategy?.parameters) {
      const existing = (rule?.conditionDefinition as Record<string, unknown>) || {};
      const next: Record<string, string> = {};
      Object.keys(selectedStrategy.parameters).forEach((key) => {
        if (existing[key] !== undefined) {
          next[key] = String(existing[key]);
        }
      });
      setStrategyParams(next);
    }
  }, [selectedStrategy, rule?.conditionDefinition]);

  const handleSubmit = () => {
    const payload: any = {
      name,
      isEnabled: true,
      triggerType,
      targetAudience,
      deliveryChannels: delivery,
      templateId: templateId || undefined,
      throttlingConfig: throttling.dedupeKey || throttling.cooldownMinutes ? throttling : undefined,
      channelName: 'seat_events',
      conditionDefinition: condition || undefined
    };

    if (triggerType === NotificationTriggerType.DbEvent) {
      payload.tableName = tableName;
      payload.operation = operation;
      payload.watchedColumns = watchedColumns;
    }
    if (triggerType === NotificationTriggerType.Scheduled || triggerType === NotificationTriggerType.Analytics) {
      payload.scheduleCron = scheduleCron;
      payload.scheduledStrategy = scheduledStrategy;
      const parsedParams = Object.entries(strategyParams).reduce((acc, [key, value]) => {
        if (value) (acc as any)[key] = isNaN(Number(value)) ? value : Number(value);
        return acc;
      }, {});
      payload.conditionDefinition = { ...(condition || {}), ...parsedParams };
    }

    onSubmit(payload);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!triggerType;
      case 2: return delivery.length > 0 && !!templateId;
      case 3: return triggerType === NotificationTriggerType.DbEvent 
        ? !!tableName && !!operation 
        : !!scheduleCron && !!scheduledStrategy;
      case 4: return !!name;
      default: return true;
    }
  };

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  // Progress indicator
  const ProgressBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <button
            onClick={() => s < step && setStep(s)}
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
              s === step 
                ? 'bg-gradient-to-r from-workspace-accent to-purple-500 text-white scale-110 shadow-lg shadow-workspace-accent/30' 
                : s < step 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-pointer hover:scale-105' 
                  : 'bg-white/5 text-white/30 border border-white/10'
            }`}
          >
            {s < step ? <Check className="w-5 h-5" /> : s}
          </button>
          {s < 4 && (
            <div className={`flex-1 h-1 rounded-full ${s < step ? 'bg-green-500/50' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const StepLabel = ({ step: s }: { step: number }) => {
    const labels = ['¿Cuándo notificar?', '¿Cómo enviar?', 'Configurar trigger', 'Finalizar'];
    return (
      <p className="text-center text-white/50 text-sm mb-2">{labels[s - 1]}</p>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar />
      <StepLabel step={step} />

      {/* Step 1: Trigger Type */}
      {step === 1 && (
        <Card padding="lg" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">¿Cuándo quieres enviar la notificación?</h2>
            <p className="text-white/60">Elige el evento que disparará el envío</p>
          </div>

          <div className="grid gap-4">
            {TRIGGER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = triggerType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setTriggerType(opt.type)}
                  className={`relative p-6 rounded-3xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${opt.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{opt.title}</h3>
                      <p className="text-white/60 text-sm mb-2">{opt.description}</p>
                      <p className="text-white/40 text-xs italic">{opt.example}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step 2: Target & Delivery Channel & Template */}
      {step === 2 && (
        <Card padding="lg" className="space-y-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">¿A quién y cómo notificar?</h2>
            <p className="text-white/60">Define la audiencia y el mensaje</p>
          </div>

          {/* Target Audience */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-workspace-accent" />
              Audiencia
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <button
                  type="button"
                  onClick={() => setTargetAudience(NotificationTargetAudience.Client)}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                    targetAudience === NotificationTargetAudience.Client
                      ? 'border-workspace-accent bg-workspace-accent/10 text-white shadow-lg shadow-workspace-accent/20'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  {targetAudience === NotificationTargetAudience.Client && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <Users className={`w-6 h-6 mx-auto mb-2 ${targetAudience === NotificationTargetAudience.Client ? 'text-workspace-accent' : 'text-white/60'}`} />
                  <p className={`font-medium ${targetAudience === NotificationTargetAudience.Client ? 'text-white' : 'text-white/60'}`}>Cliente Final</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience(NotificationTargetAudience.Commerce)}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                    targetAudience === NotificationTargetAudience.Commerce
                      ? 'border-workspace-accent bg-workspace-accent/10 text-white shadow-lg shadow-workspace-accent/20'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  {targetAudience === NotificationTargetAudience.Commerce && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <Briefcase className={`w-6 h-6 mx-auto mb-2 ${targetAudience === NotificationTargetAudience.Commerce ? 'text-workspace-accent' : 'text-white/60'}`} />
                  <p className={`font-medium ${targetAudience === NotificationTargetAudience.Commerce ? 'text-white' : 'text-white/60'}`}>Comercio / Staff</p>
                </button>
            </div>
          </div>



          {/* Channels */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-workspace-accent" />
              Canales de envío
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {CHANNEL_OPTIONS.map((ch) => {
                const Icon = ch.icon;
                const isSelected = delivery.includes(ch.value);
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setDelivery(prev => 
                      prev.includes(ch.value) ? prev.filter(v => v !== ch.value) : [...prev, ch.value]
                    )}
                    className={`relative p-5 rounded-2xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-workspace-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-workspace-accent' : 'text-white/60'}`} />
                    <p className={`font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>{ch.label}</p>
                    <p className="text-xs text-white/40 mt-1">{ch.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-workspace-accent" />
              Mensaje a enviar
            </h3>
            
            {templates.length === 0 ? (
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-200 font-medium">No hay plantillas creadas</p>
                <p className="text-amber-200/70 text-sm mt-1">
                  Ve a <span className="font-semibold">Plantillas</span> para crear una primero
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {templates.map((tpl) => {
                  const isSelected = templateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateId(tpl.id)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white">{tpl.name}</p>
                            {isSelected && (
                              <Check className="w-4 h-4 text-workspace-accent" />
                            )}
                          </div>
                          <p className="text-sm text-white/60">{tpl.title}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tpl.channel === 'push' ? 'bg-blue-500/20 text-blue-300' :
                          tpl.channel === 'email' ? 'bg-green-500/20 text-green-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {tpl.channel}
                        </span>
                      </div>
                      {tpl.body && (
                        <p className="text-xs text-white/40 mt-2 line-clamp-2">{tpl.body}</p>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 3: Configure Trigger */}
      {step === 3 && (
        <Card padding="lg" className="space-y-6">
          {triggerType === NotificationTriggerType.DbEvent ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">¿Qué cambio debe disparar la notificación?</h2>
                <p className="text-white/60">Selecciona la tabla y el tipo de cambio</p>
              </div>

              {/* Table Selection */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-3">Tabla a monitorear</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMON_TABLES.map((t) => {
                    const isSelected = tableName === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTableName(t.value)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{t.label}</p>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-white/50'}`}>{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operation */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-3">Cuando el registro...</h3>
                <div className="grid grid-cols-3 gap-3">
                  {DB_OPERATIONS.map((op) => {
                    const isSelected = operation === op.value;
                    return (
                      <button
                        key={op.value}
                        type="button"
                        onClick={() => setOperation(op.value)}
                        className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="text-2xl">{op.icon}</span>
                        <p className={`font-medium mt-2 ${isSelected ? 'text-white' : 'text-white/70'}`}>{op.label}</p>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-white/50'}`}>{op.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Watched Columns for Update */}
              {operation === DbOperation.Update && allowedFields.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                    Solo cuando cambien estos campos
                    <span className="text-xs text-white/40">(opcional)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allowedFields.map((field) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setWatchedColumns(prev => 
                          prev.includes(field) ? prev.filter(c => c !== field) : [...prev, field]
                        )}
                        className={`px-3 py-2 rounded-xl text-sm transition-all ${
                          watchedColumns.includes(field)
                            ? 'bg-workspace-accent text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">¿Cuándo y qué evaluar?</h2>
                <p className="text-white/60">Configura el horario y la estrategia</p>
              </div>

              {/* Cron presets */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-3">Frecuencia</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {COMMON_CRONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setScheduleCron(c.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        scheduleCron === c.value
                          ? 'border-workspace-accent bg-workspace-accent/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="font-medium text-white text-sm">{c.label}</p>
                      <p className="text-xs text-white/40 mt-1">{c.description}</p>
                    </button>
                  ))}
                </div>
                <input
                  className={`${inputClass} mt-3`}
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  placeholder="Expresión cron personalizada"
                />
              </div>

              {/* Strategy */}
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-3">Estrategia de análisis</h3>
                <div className="grid gap-3">
                  {strategies.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setScheduledStrategy(s.name)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        scheduledStrategy === s.name
                          ? 'border-workspace-accent bg-workspace-accent/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="font-semibold text-white">{s.name.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-white/60 mt-1">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Params */}
              {selectedStrategy?.parameters && (
                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-3">Parámetros</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedStrategy.parameters).map(([key, desc]) => (
                      <div key={key}>
                        <label className="text-xs text-white/50 uppercase tracking-wide">{key}</label>
                        <input
                          className={inputClass}
                          value={strategyParams[key] || ''}
                          onChange={(e) => setStrategyParams(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={desc}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Step 4: Finalize */}
      {step === 4 && (
        <Card padding="lg" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">¡Casi listo!</h2>
            <p className="text-white/60">Dale un nombre a tu regla y revisa la configuración</p>
          </div>

          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Nombre de la regla</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Confirmación de cita automática"
            />
            <p className="text-xs text-white/40 mt-2">Este nombre aparecerá en la lista de reglas y en los logs</p>
          </div>

          {/* Summary */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-workspace-accent" />
              Resumen de tu regla
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">Tipo</p>
                <p className="text-white font-medium">{TRIGGER_OPTIONS.find(t => t.type === triggerType)?.title}</p>
              </div>
              <div>
                <p className="text-white/50">Canales</p>
                <p className="text-white font-medium">{delivery.join(', ') || 'Ninguno'}</p>
              </div>
              <div>
                <p className="text-white/50">Plantilla</p>
                <p className="text-white font-medium">{templates.find(t => t.id === templateId)?.name || 'Ninguna'}</p>
              </div>
              {triggerType === NotificationTriggerType.DbEvent && (
                <div>
                  <p className="text-white/50">Tabla / Operación</p>
                  <p className="text-white font-medium">{tableName} / {DB_OPERATIONS.find(o => o.value === operation)?.label}</p>
                </div>
              )}
              {(triggerType === NotificationTriggerType.Scheduled || triggerType === NotificationTriggerType.Analytics) && (
                <div>
                  <p className="text-white/50">Estrategia</p>
                  <p className="text-white font-medium">{scheduledStrategy?.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Advanced (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-white/50 hover:text-white/70 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Opciones avanzadas (opcional)
            </summary>
            <div className="mt-4 p-4 rounded-2xl bg-white/5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50">Dedupe Key</label>
                  <input
                    className={inputClass}
                    value={throttling.dedupeKey || ''}
                    onChange={(e) => setThrottling(prev => ({ ...prev, dedupeKey: e.target.value }))}
                    placeholder="Ej: clientId-status"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Cooldown (minutos)</label>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    value={throttling.cooldownMinutes ?? ''}
                    onChange={(e) => setThrottling(prev => ({ 
                      ...prev, 
                      cooldownMinutes: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    placeholder="60"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block">Condiciones adicionales</label>
                <ConditionBuilder value={condition} onChange={setCondition} allowedFields={allowedFields} />
              </div>
            </div>
          </details>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => step === 1 ? onCancel() : setStep(step - 1)}
          type="button"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            type="button"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!canProceed()}
          >
            <Check className="w-4 h-4 mr-1" />
            Crear regla
          </Button>
        )}
      </div>
    </div>
  );
};
