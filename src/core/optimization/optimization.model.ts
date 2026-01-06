/**
 * Models for SAP Field Service Management Optimization API
 * Based on dispatchservice_ext OpenAPI specification v1
 */

// ==================== Common Types ====================

export type OptimizationStatus = 'NEW' | 'FETCHING' | 'PROCESSING' | 'SUCCESS' | 'CANCELLED' | 'FAILED';

export type PartitioningStrategyType = 'NONE' | 'SPATIAL' | 'TEMPORAL';

export type AssignmentChangeCategory = 'assigned' | 'reassigned' | 'unchanged' | 'unassigned';

// ==================== Optimization Plugin (Policy) ====================

export interface OptimizationPlugin {
  id: string;
  name: string;
  version: number;
  description?: string;
  active: boolean;
}

export interface OptimizationPluginListResponse {
  results: OptimizationPlugin[];
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

// ==================== Re-Optimization ====================

export interface PartitioningStrategy {
  type: PartitioningStrategyType;
  maxResourcesPerPartition?: number;
}

export interface ResourceFilter {
  personIds?: string[];
  teamIds?: string[];
  includeNonSchedulable?: boolean;
}

export interface AdditionalDataOptions {
  includeJobsAsBookings?: boolean;
  includeReleasedJobsAsBookings?: boolean;
  includeUnassignedJobs?: boolean;
}

export interface SchedulingOptions {
  considerWorkingHours?: boolean;
  defaultDrivingTimeMinutes?: number;
  maxResults?: number;
}

export interface OptimizationRequest {
  activityIds: string[];
  optimizationPlugin: string;
  start: string;
  end: string;
  releaseOnSchedule?: boolean;
  partitioningStrategy?: PartitioningStrategy;
  resources?: ResourceFilter;
  additionalDataOptions?: AdditionalDataOptions;
  schedulingOptions?: SchedulingOptions;
  reAssignWithoutCopy?: boolean;
  key?: string;
  parallelizable?: boolean;
  trigger?: string;
  simulation?: boolean;
}

export interface ReOptimizationError {
  skill: string;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ReOptimizationResponse {
  result: boolean;
  optimizationTaskIds?: string[];
  errors?: ReOptimizationError[];
}

// ==================== Optimization Task ====================

export interface OptimizationTaskJob {
  activityId: string;
  assignmentChangeCategory?: AssignmentChangeCategory;
}

export interface OptimizationTaskResource {
  personId: string;
  teamId?: string;
}

export interface OptimizationTask {
  id: string;
  key?: string;
  status: OptimizationStatus;
  statusMessage?: string;
  simulation: boolean;
  createdDateTime: string;
  policyName: string;
  jobs?: OptimizationTaskJob[];
  resources?: OptimizationTaskResource[];
}

export interface OptimizationTaskCancelRequest {
  reason?: string;
}

// ==================== Executions ====================

export interface ExecutionsFilter {
  enqueuedAtFrom?: string;
  enqueuedAtTo?: string;
  policyName?: string;
  policyVersion?: number;
  simulation?: boolean;
  status?: OptimizationStatus;
  taskId?: string;
  taskKey?: string;
}

export interface Execution {
  id: string;
  taskId: string;
  taskKey?: string;
  enqueuedAt?: string;
  jobCount?: number;
  policyName?: string;
  policyVersion?: number;
  processingCompletedAt?: string;
  processingStartedAt?: string;
  resourceCount?: number;
  status: OptimizationStatus;
  statusMessage?: string;
}

export interface ExecutionsListResponse {
  results: Execution[];
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

// ==================== Processed Jobs ====================

export interface ProcessedJob {
  activityId: string;
  assignmentChangeCategory: AssignmentChangeCategory;
  personId?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface ProcessedJobListResponse {
  results: ProcessedJob[];
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

// ==================== Job Slots ====================

export interface JobSlot {
  start: string;
  end: string;
}

export interface JobDefinition {
  duration?: number;
  skills?: string[];
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  earliestStartDateTime?: string;
  dueDateTime?: string;
}

export interface JobSlotsSearchRequest {
  activityId?: string;
  job?: JobDefinition;
  slots: JobSlot[];
  resources: ResourceFilter;
  options: SchedulingOptions;
  policy: string;
}

export interface SlotResult {
  personId: string;
  start: string;
  end: string;
  score: number;
  travelTimeMinutes?: number;
  distanceMeters?: number;
}

export interface ScoreLogEntry {
  personId: string;
  slot: JobSlot;
  score: number;
  details?: Record<string, any>;
}

export interface JobSlotsSearchResponse {
  results: SlotResult[];
  scoreLog?: ScoreLogEntry[];
  warnings?: string[];
}

// ==================== Best Matching Technicians ====================

export interface BestMatchingTechniciansRequest {
  policy: string;
  start?: string;
  end?: string;
  schedulingOptions?: SchedulingOptions;
  resources?: ResourceFilter;
  additionalDataOptions?: AdditionalDataOptions;
}

export interface TechnicianResult {
  personId: string;
  score: number;
  availableSlots?: JobSlot[];
  distanceMeters?: number;
  travelTimeMinutes?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export interface BestMatchingTechniciansResponse {
  results: TechnicianResult[];
  scoreLog?: ScoreLogEntry[];
}
