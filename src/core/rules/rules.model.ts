/**
 * Models for FSM Business Rules API
 * Based on OpenAPI spec version 1.147.0
 */

export type EventType =
  | 'CREATE'
  | 'CREATE_OR_UPDATE'
  | 'CREATE_OR_UPDATE_OR_UPLOAD'
  | 'CREATE_OR_UPLOAD_CREATE'
  | 'UPDATE_OR_UPLOAD_UPDATE'
  | 'UPDATE'
  | 'UPDATE_OR_DELETE'
  | 'CREATE_OR_UPDATE_OR_DELETE'
  | 'DELETE'
  | 'UPLOAD'
  | 'UPLOAD_CREATE'
  | 'UPLOAD_UPDATE'
  | 'CROWD_UPLOAD'
  | 'SCHEDULE'
  | 'KAFKA_EVENT'
  | 'VALIDATE';

export type HealthState = 'CRITICAL' | 'WARNING' | 'OK';

export type RuleType = 'ONE' | 'TWO' | 'THREE';

export type ExecutionStatus =
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED'
  | 'SKIPPED'
  | 'RUNNING'
  | 'DELAYED'
  | 'RETRY_REQUESTED';

export type VariableType = 'ARRAY' | 'OBJECT' | 'VALUE' | 'DYNAMIC';

export interface Action {
  executionCount?: string;
  internalName?: string;
  name?: string;
  parameters?: { [key: string]: any };
}

export interface Variable {
  dtoVersions?: string;
  name?: string;
  query?: string;
  type?: string;
  value?: string;
  variableType?: VariableType;
  version?: number;
}

export interface RuleDto {
  actions?: Action[];
  code?: string;
  conditions?: string;
  createDateTime?: string;
  createdBy?: string;
  cronExpression?: string;
  delay?: number;
  description?: string;
  dtoVersions?: string;
  embedded?: boolean;
  enabled?: boolean;
  errorThreshold?: number;
  eventType?: EventType;
  executionOrder?: number;
  externalId?: string;
  healthState?: HealthState;
  id?: string;
  kafkaEventName?: string;
  lastChanged?: number;
  name?: string;
  objectType?: string;
  permissionsType?: string;
  query?: string;
  responsible?: string;
  runtimeVariables?: { [key: string]: any };
  skippedLogs?: boolean;
  type?: RuleType;
  useCompanyTimeZone?: boolean;
  value?: string;
  variables?: Variable[];
}

export interface CustomRuleExecutionRecordDto {
  clientId?: string;
  eventType?: EventType;
  executionDate?: string;
  executionTime?: number;
  kafkaEventId?: string;
  logMessage?: string;
  objectId?: string;
  requestId?: string;
  status?: ExecutionStatus;
  userId?: number;
}

export interface PageableObject {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface PageDto<T> {
  content?: T[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  size?: number;
  sort?: SortObject;
  totalElements?: number;
  totalPages?: number;
}

export type PageRuleDto = PageDto<RuleDto>;
export type PageCustomRuleExecutionRecordDto = PageDto<CustomRuleExecutionRecordDto>;
