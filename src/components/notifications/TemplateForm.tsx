import React, { useState } from 'react';
import { Mail, Smartphone, MessageCircle, Eye, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { NotificationChannel, NotificationTemplate } from '../../types/notifications';
import { Card } from '../ui/Card';

interface TemplateFormProps {
  template?: NotificationTemplate | null;
  onSubmit: (payload: Partial<NotificationTemplate>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CHANNEL_OPTIONS = [
  { value: 'push' as NotificationChannel, icon: Smartphone, label: 'Push', description: 'Notificación en el teléfono', color: 'from-blue-500 to-cyan-500' },
  { value: 'email' as NotificationChannel, icon: Mail, label: 'Email', description: 'Correo electrónico', color: 'from-green-500 to-emerald-500' },
  { value: 'whatsapp' as NotificationChannel, icon: MessageCircle, label: 'WhatsApp', description: 'Mensaje de WhatsApp', color: 'from-purple-500 to-pink-500' }
];

const VARIABLE_PRESETS = [
  { category: '👤 Cliente', vars: ['clientName', 'clientEmail', 'clientPhone'] },
  { category: '📅 Cita', vars: ['appointmentDate', 'appointmentTime', 'serviceName'] },
  { category: '🏪 Comercio', vars: ['commerceName', 'branchName', 'colleagueName'] },
  { category: '📊 Métricas', vars: ['queuePosition', 'etaMinutes'] }
];

const EXAMPLE_TEMPLATES = {
  push: [
    { name: 'Recordatorio 24h', title: '⏰ Recordatorio de cita', body: '¡Hola {clientName}! Te recordamos que tienes una cita mañana a las {appointmentTime}' },
    { name: 'Cita confirmada', title: '✅ Cita confirmada', body: 'Tu cita para {serviceName} ha sido confirmada para el {appointmentDate}' },
    { name: 'Tu turno', title: '🎯 ¡Es tu turno!', body: '¡{clientName}! Ya es tu turno. Tu posición: #{queuePosition}' }
  ],
  email: [
    { name: 'Bienvenida', title: '¡Bienvenido a {commerceName}!', body: 'Hola {clientName},\n\nGracias por registrarte. Estamos listos para atenderte.\n\nSaludos,\n{commerceName}' },
    { name: 'Resumen semanal', title: 'Tu resumen de la semana', body: 'Hola,\n\nAquí tienes el resumen de tu semana:\n- Citas atendidas: {summaryAppointments}\n- Ingresos: ${summaryRevenue}' }
  ],
  whatsapp: [
    { name: 'Recordatorio simple', title: 'Recordatorio', body: '👋 Hola {clientName}! Te recordamos tu cita para {serviceName} el {appointmentDate} a las {appointmentTime}. ¡Te esperamos!' }
  ]
};

export const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: template?.name || '',
    channel: (template?.channel as NotificationChannel) || 'push',
    title: template?.title || '',
    body: template?.body || '',
    navigationRoute: (template as any)?.navigationRoute || '',
    navigationParams: (template as any)?.navigationParams ? JSON.stringify((template as any).navigationParams, null, 2) : ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let navigationParamsObj = undefined;
    if (form.navigationParams.trim()) {
      try {
        navigationParamsObj = JSON.parse(form.navigationParams);
      } catch (e) {
        alert('Error en JSON de navigationParams. Debe ser un JSON válido.');
        return;
      }
    }
    onSubmit({
      name: form.name,
      channel: form.channel,
      title: form.title,
      body: form.body,
      navigationRoute: form.navigationRoute || undefined,
      navigationParams: navigationParamsObj
    } as any);
  };

  const insertVariable = (variable: string) => {
    const insert = `{${variable}}`;
    setForm(prev => ({ ...prev, body: prev.body + insert }));
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{${variable}}`);
    setCopied(variable);
    setTimeout(() => setCopied(null), 1500);
  };

  const applyExample = (example: { name: string; title: string; body: string }) => {
    setForm(prev => ({
      ...prev,
      name: example.name,
      title: example.title,
      body: example.body
    }));
  };

  const previewBody = form.body
    .replace(/\{clientName\}/g, 'Juan Pérez')
    .replace(/\{clientEmail\}/g, 'juan@email.com')
    .replace(/\{appointmentDate\}/g, '15 de enero')
    .replace(/\{appointmentTime\}/g, '10:30 AM')
    .replace(/\{serviceName\}/g, 'Corte de cabello')
    .replace(/\{commerceName\}/g, 'Mi Negocio')
    .replace(/\{branchName\}/g, 'Sucursal Centro')
    .replace(/\{colleagueName\}/g, 'María')
    .replace(/\{queuePosition\}/g, '3')
    .replace(/\{etaMinutes\}/g, '15')
    .replace(/\{summaryAppointments\}/g, '45')
    .replace(/\{summaryRevenue\}/g, '12,500');

  const previewTitle = form.title
    .replace(/\{commerceName\}/g, 'Mi Negocio')
    .replace(/\{clientName\}/g, 'Juan');

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-workspace-accent/40';

  const channelExamples = EXAMPLE_TEMPLATES[form.channel] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Plantilla de mensaje</p>
            <h2 className="text-2xl font-bold text-white">{template ? 'Editar plantilla' : 'Nueva plantilla'}</h2>
            <p className="text-white/60 text-sm mt-1">Define el mensaje que se enviará a tus clientes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} type="button">Cancelar</Button>
            <Button type="submit" loading={loading}>Guardar</Button>
          </div>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-3 block">Canal de envío</label>
          <div className="grid grid-cols-3 gap-4">
            {CHANNEL_OPTIONS.map((ch) => {
              const Icon = ch.icon;
              const isSelected = form.channel === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, channel: ch.value }))}
                  className={`relative p-5 rounded-2xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-workspace-accent bg-workspace-accent/10 shadow-lg shadow-workspace-accent/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-workspace-accent flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center ${isSelected ? 'ring-2 ring-workspace-accent ring-offset-2 ring-offset-transparent' : ''}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={`font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>{ch.label}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-white/40'}`}>{ch.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Nombre de la plantilla</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Ej: Recordatorio de cita 24h"
            required
          />
          <p className="text-xs text-white/40 mt-2">Este nombre te ayuda a identificar la plantilla</p>
        </div>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="lg" className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-workspace-accent" />
              Contenido del mensaje
            </h3>

            <div>
              <label className="text-sm font-medium text-white/70 mb-2 block">
                Título / Asunto
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputClass}
                placeholder={form.channel === 'push' ? '📅 Recordatorio de cita' : 'Recordatorio de su cita'}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/70 mb-2 block">
                Mensaje
              </label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={6}
                className={inputClass}
                placeholder="Hola {clientName}, te recordamos tu cita para {serviceName} el {appointmentDate} a las {appointmentTime}..."
              />
              <p className="text-xs text-white/40 mt-2">
                Usa {'{'}<span className="text-workspace-accent">variable</span>{'}'} para insertar datos dinámicos
              </p>
            </div>

            {/* Toggle Preview */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-workspace-accent hover:text-workspace-accent/80"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar preview' : 'Ver preview'}
            </button>

            {showPreview && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                <p className="text-xs text-white/50 mb-2">Vista previa con datos de ejemplo:</p>
                {previewTitle && (
                  <p className="font-semibold text-white mb-2">{previewTitle}</p>
                )}
                <p className="text-white/80 whitespace-pre-wrap">{previewBody}</p>
              </div>
            )}

            {/* Navigation Fields */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h4 className="text-sm font-semibold text-white">Navegación (Opcional)</h4>
              <p className="text-xs text-white/50">
                Define a dónde navegar cuando el usuario toque la notificación
              </p>
              
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Navigation Route
                </label>
                <input
                  name="navigationRoute"
                  value={form.navigationRoute}
                  onChange={(e) => setForm(prev => ({ ...prev, navigationRoute: e.target.value }))}
                  className={inputClass}
                  placeholder="/appointments/in-progress/[id]"
                />
                <p className="text-xs text-white/40 mt-1">
                  Ruta de la app (ej: /appointments/in-progress/[id])
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Navigation Params (JSON)
                </label>
                <textarea
                  name="navigationParams"
                  value={form.navigationParams}
                  onChange={(e) => setForm(prev => ({ ...prev, navigationParams: e.target.value }))}
                  rows={4}
                  className={inputClass}
                  placeholder='{"appointmentId": "{{appointmentId}}", "action": "appointmentRate"}'
                />
                <p className="text-xs text-white/40 mt-1">
                  Parámetros de navegación en formato JSON. Puedes usar variables como {"{{appointmentId}}"}
                </p>
              </div>
            </div>
          </Card>

          {/* Examples */}
          {channelExamples.length > 0 && (
            <Card padding="lg" className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Plantillas de ejemplo
              </h3>
              <div className="grid gap-3">
                {channelExamples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyExample(ex)}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 text-left hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{ex.name}</p>
                      <span className="text-xs text-white/40 group-hover:text-workspace-accent transition-colors">
                        Usar →
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mt-1 line-clamp-1">{ex.title}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Variables Helper */}
        <div className="space-y-4">
          <Card padding="lg" className="space-y-4 sticky top-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-workspace-accent" />
              Variables disponibles
            </h3>
            <p className="text-sm text-white/50">
              Haz clic para copiar o insertar en el mensaje
            </p>

            <div className="space-y-4">
              {VARIABLE_PRESETS.map((group) => (
                <div key={group.category}>
                  <p className="text-xs text-white/40 mb-2">{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.vars.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        onContextMenu={(e) => { e.preventDefault(); copyVariable(v); }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-workspace-accent/20 hover:text-workspace-accent transition-all flex items-center gap-1"
                        title="Click para insertar, clic derecho para copiar"
                      >
                        {copied === v ? <Check className="w-3 h-3" /> : null}
                        {`{${v}}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/5 text-xs text-white/50">
              <p className="font-medium text-white/70 mb-1">💡 Tip</p>
              <p>
                Las variables se reemplazan automáticamente con los datos reales cuando se envía la notificación.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};
