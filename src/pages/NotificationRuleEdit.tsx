import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RuleForm } from '../components/notifications/RuleForm';
import { TestRuleModal } from '../components/notifications/TestRuleModal';
import { notificationsModuleService } from '../services/notificationsModuleService';
import { NotificationRule, NotificationTemplate, NotificationTriggerType, NotificationStrategy, NotificationEntity } from '../types/notifications';

export const NotificationRuleEdit: React.FC = () => {
  const { id } = useParams();
  const isCreate = !id || id === 'new';
  const navigate = useNavigate();

  const [rule, setRule] = useState<NotificationRule | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [strategies, setStrategies] = useState<NotificationStrategy[]>([]);
  const [entities, setEntities] = useState<NotificationEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const loaded = React.useRef(false);

  useEffect(() => {
    if (loaded.current && isCreate) {
      return;
    }
    loaded.current = true;
    loadTemplates();
    loadStrategies();
    loadEntities();
    if (!isCreate && id) {
      loadRule(id);
    }
  }, [id, isCreate]);

  const loadRule = async (ruleId: string) => {
    try {
      setLoading(true);
      const data = await notificationsModuleService.getRule(ruleId);
      setRule(data);
    } catch (err) {
      toast.error('No pudimos cargar la regla');
      navigate('/notifications/rules');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await notificationsModuleService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.warn('No pudimos cargar plantillas', err);
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

  const loadEntities = async () => {
    try {
      const data = await notificationsModuleService.getEntities();
      setEntities(data);
    } catch (err) {
      console.warn('No pudimos cargar entidades', err);
    }
  };

  const handleSubmit = async (payload: any) => {
    try {
      setLoading(true);
      if (isCreate) {
        await notificationsModuleService.createRule(payload);
        toast.success('Regla creada');
      } else if (id) {
        await notificationsModuleService.updateRule(id, payload);
        toast.success('Regla actualizada');
      }
      navigate('/notifications/rules');
    } catch (err) {
      toast.error('No pudimos guardar la regla');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (payload: any) => {
    if (!id && !rule?.id) return false;
    try {
      setTesting(true);
      const targetId = id || rule?.id;
      const response = await notificationsModuleService.testRule(targetId!, payload);
      return !!response?.matched;
    } catch {
      toast.error('Error al probar la regla');
      return false;
    } finally {
      setTesting(false);
    }
  };

  if (!isCreate && !rule) {
    return (
      <Card padding="lg">
        <p className="text-white/70">Cargando regla...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Notificaciones</p>
          <h1 className="text-3xl font-bold text-white">{isCreate ? 'Crear regla' : rule?.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            Define el disparador, canal y plantilla. Las reglas programadas/analíticas dependen de la estrategia disponible en backend.
          </p>
        </div>
        {!isCreate && (
          <Button variant="ghost" onClick={() => setShowTest(true)}>
            Probar
          </Button>
        )}
      </div>
      <Card padding="lg" className="space-y-2">
        <p className="text-white font-semibold">Cómo usar</p>
        <ul className="list-disc list-inside text-white/75 space-y-1 text-sm">
          <li><span className="font-semibold">DB_EVENT:</span> se crea un trigger en la tabla/operación elegida; usa columnas vigiladas para filtrar updates.</li>
          <li><span className="font-semibold">Scheduled/Analytics:</span> respeta el cron; depende de la estrategia implementada en el servidor.</li>
          <li><span className="font-semibold">Condiciones:</span> construye reglas simples con AND/OR y operadores básicos.</li>
          <li><span className="font-semibold">Plantilla:</span> elige el mensaje/canal a enviar; si falta, créala primero en “Templates”.</li>
        </ul>
      </Card>
      <RuleForm
        rule={rule || { triggerType: NotificationTriggerType.DbEvent, isEnabled: true }}
        templates={templates}
        strategies={strategies}
        entities={entities}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/notifications/rules')}
        loading={loading}
      />
      <TestRuleModal
        isOpen={showTest}
        onClose={() => setShowTest(false)}
        onTest={handleTest}
        defaultTable={rule?.tableName}
      />
    </div>
  );
};
