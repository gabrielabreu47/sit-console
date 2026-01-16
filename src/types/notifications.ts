export enum NotificationTriggerType {
  DbEvent = 'DbEvent',
  Scheduled = 'Scheduled',
  Analytics = 'Analytics',
  Condition = 'Condition'
}

export enum DbOperation {
  Insert = 'Insert',
  Update = 'Update',
  Delete = 'Delete'
}

export type NotificationChannel = 'email' | 'whatsapp' | 'push';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  channel: NotificationChannel | string;
  variablesSchema?: any;
  createdAt?: string;
  updatedAt?: string;
}

export enum NotificationTargetAudience {
  Client = 0,
  Commerce = 1
}

export interface NotificationRule {
  id: string;
  name: string;
  isEnabled: boolean;
  tenantId?: string | null;
  commerceId?: string | null;
  triggerType: NotificationTriggerType | number | string;
  targetAudience?: NotificationTargetAudience;
  tableName?: string | null;
  operation?: DbOperation | null;
  watchedColumns?: string[] | null;
  channelName?: string;
  conditionDefinition?: any;
  scheduleCron?: string | null;
  scheduledStrategy?: string | null;
  templateId?: string | null;
  deliveryChannels?: NotificationChannel[] | string[] | null;
  throttlingConfig?: {
    dedupeKey?: string;
    cooldownMinutes?: number;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  lastExecutedAt?: string | null;
  template?: NotificationTemplate;
}

export interface NotificationDispatchLog {
  id: string;
  ruleId: string;
  ruleName?: string;
  occurredAt: string;
  targetUserId?: string | null;
  targetEmail?: string | null;
  targetPhone?: string | null;
  channel: NotificationChannel | string;
  status: 'Pending' | 'Sent' | 'Failed' | string;
  error?: string | null;
  payload?: any;
  retries?: number;
}

export interface NotificationStrategy {
  name: string;
  description: string;
  parameters?: Record<string, string>;
}

export interface NotificationEntity {
  table: string;
  allowedFields: string[];
  clientIdField?: string | null;
  profileIdField?: string | null;
  userIdField?: string | null;
  commerceIdField?: string | null;
  branchIdField?: string | null;
  emailField?: string | null;
  phoneField?: string | null;
}
