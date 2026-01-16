import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TemplateForm } from '../components/notifications/TemplateForm';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationTemplate } from '../types/notifications';

export const NotificationTemplateEdit: React.FC = () => {
  const { id } = useParams();
  const isCreate = !id || id === 'new';
  const navigate = useNavigate();

  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCreate && id) {
      loadTemplate(id);
    }
  }, [id, isCreate]);

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await notificationsModuleService.getTemplate(templateId);
      setTemplate(data);
    } catch (err) {
      toast.error('No pudimos cargar la plantilla');
      navigate('/notifications/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload: Partial<NotificationTemplate>) => {
    try {
      setLoading(true);
      if (isCreate) {
        await notificationsModuleService.createTemplate(payload);
        toast.success('Plantilla creada');
      } else if (id) {
        await notificationsModuleService.updateTemplate(id, payload);
        toast.success('Plantilla actualizada');
      }
      navigate('/notifications/templates');
    } catch (err) {
      toast.error('No pudimos guardar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  if (!isCreate && !template && loading) {
    return (
      <Card padding="lg">
        <p className="text-white/70">Cargando plantilla...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
          <h1 className="text-3xl font-bold text-white">
            {isCreate ? 'Nueva Plantilla' : template?.name || 'Editar Plantilla'}
          </h1>
          <p className="text-white/60 mt-1">
            {isCreate 
              ? 'Crea una nueva plantilla de notificación'
              : 'Edita la plantilla de notificación'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/notifications/templates')}>
          Cancelar
        </Button>
      </div>

      <TemplateForm
        template={template}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/notifications/templates')}
        loading={loading}
      />
    </div>
  );
};
