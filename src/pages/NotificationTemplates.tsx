import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCcw, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationTemplate } from '../types/notifications';

export const NotificationTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await notificationsModuleService.getTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error('No pudimos cargar plantillas');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (template: NotificationTemplate) => {
    if (!confirm(`¿Eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      setDeleting(template.id);
      await notificationsModuleService.deleteTemplate(template.id);
      toast.success('Plantilla eliminada');
      await loadTemplates();
    } catch (err) {
      toast.error('No pudimos eliminar la plantilla');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
            <h1 className="text-3xl font-bold text-white">Plantillas</h1>
            <p className="text-white/60 mt-1">
              Define los textos base para email, WhatsApp y push. Podés reutilizar variables dinámicas.
            </p>
            <div className="mt-2 text-sm text-white/70 space-y-1">
              <div>{'Usá {{variable}} para campos dinámicos (ej: {{name}}, {{date}}).'}</div>
              <div>El canal debe coincidir con el destino de la regla.</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={loadTemplates}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
            <Button onClick={() => navigate('/notifications/templates/new')}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva plantilla
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Actualizado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                    Sin plantillas
                  </td>
                </tr>
              )}
              {templates.map((tpl) => (
                <tr key={tpl.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{tpl.name}</div>
                    <div className="text-xs text-white/60">{tpl.title}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{tpl.channel}</td>
                  <td className="px-4 py-3 text-white/70">{tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/notifications/templates/${tpl.id}`)}
                        className="hover:bg-workspace-accent/20"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(tpl)}
                        disabled={deleting === tpl.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
