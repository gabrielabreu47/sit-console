import { DbOperation, NotificationDispatchLog, NotificationEntity, NotificationRule, NotificationStrategy, NotificationTemplate, NotificationTriggerType } from '../types/notifications';
import api from './api';

const basePath = '/notifications';

const getCommerceContext = () => {
  const commerce = sessionStorage.getItem('currentCommerce');
  if (!commerce) return {};
  try {
    const parsed = JSON.parse(commerce);
    return { commerceId: parsed.id || parsed.commerceId || null, tenantId: parsed.tenantId || null };
  } catch {
    return {};
  }
};

export interface RulePayload {
  name: string;
  isEnabled: boolean;
  triggerType: NotificationTriggerType;
  deliveryChannels?: string[];
  templateId?: string;
  throttlingConfig?: { dedupeKey?: string; cooldownMinutes?: number };
  tableName?: string;
  operation?: DbOperation;
  watchedColumns?: string[];
  channelName?: string;
  scheduleCron?: string;
  scheduledStrategy?: string;
  conditionDefinition?: any;
}

export interface RuleTestPayload {
  table: string;
  operation: DbOperation;
  primaryKey?: string;
  changedColumns?: string[];
  data?: Record<string, unknown>;
  previousValues?: Record<string, unknown>;
}

const triggerToInt = (value: NotificationTriggerType | number): number => {
  if (typeof value === 'number') return value;
  switch (value) {
    case NotificationTriggerType.DbEvent:
      return 0;
    case NotificationTriggerType.Scheduled:
      return 1;
    case NotificationTriggerType.Analytics:
      return 2;
    case NotificationTriggerType.Condition:
      return 3;
    default:
      return 0;
  }
};

const operationToInt = (value?: DbOperation): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  switch (value) {
    case DbOperation.Insert:
      return 0;
    case DbOperation.Update:
      return 1;
    case DbOperation.Delete:
      return 2;
    default:
      return undefined;
  }
};

const serializeRulePayload = (payload: RulePayload) => {
  return {
    ...payload,
    triggerType: triggerToInt(payload.triggerType),
    operation: operationToInt(payload.operation),
    deliveryChannels: payload.deliveryChannels ?? [],
  };
};

export const notificationsModuleService = {
  async getRules(): Promise<NotificationRule[]> {
    const response = await api.get(`${basePath}/rules`, { params: getCommerceContext() });
    return response.data;
  },
  async getRule(id: string): Promise<NotificationRule> {
    const response = await api.get(`${basePath}/rules/${id}`);
    return response.data;
  },
  async createRule(payload: RulePayload): Promise<NotificationRule> {
    const serialized = serializeRulePayload(payload);
    const response = await api.post(`${basePath}/rules`, { ...serialized, ...getCommerceContext() });
    return response.data;
  },
  async updateRule(id: string, payload: RulePayload): Promise<NotificationRule> {
    const serialized = serializeRulePayload(payload);
    const response = await api.put(`${basePath}/rules/${id}`, { ...serialized, ...getCommerceContext() });
    return response.data;
  },
  async enableRule(id: string): Promise<void> {
    await api.patch(`${basePath}/rules/${id}/enable`);
  },
  async disableRule(id: string): Promise<void> {
    await api.patch(`${basePath}/rules/${id}/disable`);
  },
  async deleteRule(id: string): Promise<void> {
    await api.delete(`${basePath}/rules/${id}`);
  },
  async testRule(id: string, payload: RuleTestPayload) {
    const response = await api.post(`${basePath}/rules/${id}/test`, {
      ...payload,
      operation: operationToInt(payload.operation)
    });
    return response.data;
  },
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get(`${basePath}/templates`, { params: getCommerceContext() });
    return response.data;
  },
  async getTemplate(id: string): Promise<NotificationTemplate> {
    const response = await api.get(`${basePath}/templates/${id}`);
    return response.data;
  },
  async createTemplate(payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.post(`${basePath}/templates`, payload);
    return response.data;
  },
  async updateTemplate(id: string, payload: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.put(`${basePath}/templates/${id}`, payload);
    return response.data;
  },
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`${basePath}/templates/${id}`);
  },
  async getLogs(params?: { status?: string; ruleId?: string; from?: string; to?: string }): Promise<NotificationDispatchLog[]> {
    const response = await api.get(`${basePath}/logs`, { params: { ...params, ...getCommerceContext() } });
    return response.data;
  },
  async getStrategies(): Promise<NotificationStrategy[]> {
    const response = await api.get(`${basePath}/strategies`);
    return response.data;
  },
  async getEntities(): Promise<NotificationEntity[]> {
    const response = await api.get(`${basePath}/entities`);
    return response.data;
  },
  async executeRule(ruleId: string, payload: {
    primaryKey?: string;
    data?: Record<string, unknown>;
    previousValues?: Record<string, unknown>;
    targetUserId?: string;
    targetEmail?: string;
    targetPhone?: string;
  }) {
    const response = await api.post(`${basePath}/rules/${ruleId}/execute`, payload);
    return response.data;
  },
  async resendNotification(logId: string) {
    const response = await api.post(`${basePath}/logs/${logId}/resend`);
    return response.data;
  },
  async sendOneTimeNotification(payload: {
    title: string;
    message: string;
    channel: 'push' | 'email' | 'both';
    targetUserId?: string;
    targetEmail?: string;
    targetPhone?: string;
    navigationRoute?: string;
    navigationParams?: Record<string, any>;
    data?: Record<string, any>;
    commerceId?: string;
    tenantId?: string;
  }) {
    const response = await api.post(`${basePath}/send`, payload);
    return response.data;
  }
};
