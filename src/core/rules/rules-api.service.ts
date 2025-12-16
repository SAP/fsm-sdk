import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import {
    RuleDto,
    PageRuleDto,
    PageCustomRuleExecutionRecordDto,
    EventType,
    HealthState,
    ExecutionStatus
} from './rules.model';

/**
 * Rules API Service for FSM Business Rules
 * 
 * Implements business rule engine to validate and execute custom rules.
 * Stores business rule definitions and rule executions.
 * 
 * @see https://api.sap.com/api/cloud_rules_service_ext/overview
 */
export class RulesAPIService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    /**
     * Constructs the API URL for rules operations.
     * 
     * @param {string} path - Path to append to the base URL.
     * @returns {string} The complete API URL.
     */
    private getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/cloud-rules-service/api/v1/rules${path ? '/' + path : ''}`;
    }

    /**
     * Get all rules with optional filtering and pagination.
     * 
     * @param {object} params - Optional query parameters for filtering, pagination, and sorting.
     * @param {string} params.kafkaEventName - Filter by Kafka event name.
     * @param {string} params.code - Filter by rule code.
     * @param {string} params.name - Filter by rule name.
     * @param {boolean} params.embedded - Filter by embedded status.
     * @param {boolean} params.enabled - Filter by enabled status.
     * @param {EventType} params.eventType - Filter by event type.
     * @param {string} params.objectType - Filter by object type.
     * @param {HealthState} params.healthState - Filter by health state.
     * @param {number} params.page - Page number for pagination.
     * @param {number} params.size - Page size for pagination.
     * @param {string} params.sortBy - Field to sort by (default: 'name').
     * @param {string} params.order - Sort order: 'asc' or 'desc' (default: 'asc').
     * @param {string} params.search - Search text.
     * @returns {Promise<PageRuleDto | null>} A promise resolving to paginated rules.
     */
    public async getRules(params?: Partial<{
        kafkaEventName: string;
        code: string;
        name: string;
        embedded: boolean;
        enabled: boolean;
        eventType: EventType;
        objectType: string;
        healthState: HealthState;
        page: number;
        size: number;
        sortBy: string;
        order: 'asc' | 'desc';
        search: string;
    }>): Promise<PageRuleDto | null> {
        const token = await this._auth.ensureToken(this._config);
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';

        return this._http.request<PageRuleDto>(this.getApiUrl() + queryString, {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }

    /**
     * Create a new rule.
     * 
     * @param {object} data - Rule data to create.
     * @returns {Promise<RuleDto | null>} A promise resolving to the created rule.
     */
    public async createRule(data: Partial<RuleDto>): Promise<RuleDto | null> {
        const token = await this._auth.ensureToken(this._config);

        return this._http.request<RuleDto>(this.getApiUrl(), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        });
    }

    /**
     * Get a specific rule by ID.
     * 
     * @param {string} id - Rule identifier (UUID).
     * @returns {Promise<RuleDto | null>} A promise resolving to the rule.
     */
    public async getRule(id: string): Promise<RuleDto | null> {
        const token = await this._auth.ensureToken(this._config);

        return this._http.request<RuleDto>(this.getApiUrl(id), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }

    /**
     * Update an existing rule (partial update).
     * 
     * @param {string} id - Rule identifier (UUID).
     * @param {object} data - Partial rule data to update.
     * @returns {Promise<RuleDto | null>} A promise resolving to the updated rule.
     */
    public async updateRule(id: string, data: Partial<RuleDto>): Promise<RuleDto | null> {
        const token = await this._auth.ensureToken(this._config);

        return this._http.request<RuleDto>(this.getApiUrl(id), {
            method: 'PATCH',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        });
    }

    /**
     * Create or update a rule (full replace or create).
     * 
     * @param {string} id - Rule identifier (UUID).
     * @param {object} data - Complete rule data.
     * @returns {Promise<RuleDto | null>} A promise resolving to the created or updated rule.
     */
    public async createOrUpdateRule(id: string, data: Partial<RuleDto>): Promise<RuleDto | null> {
        const token = await this._auth.ensureToken(this._config);

        return this._http.request<RuleDto>(this.getApiUrl(id), {
            method: 'PUT',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        });
    }

    /**
     * Get execution records for a specific rule.
     * 
     * @param {string} id - Rule identifier (UUID).
     * @param {object} params - Optional query parameters for filtering, pagination, and sorting.
     * @param {string} params.executionDateFrom - Filter by execution date from (ISO date format).
     * @param {string} params.executionDateTo - Filter by execution date to (ISO date format).
     * @param {ExecutionStatus} params.status - Filter by execution status.
     * @param {string} params.objectId - Filter by object ID.
     * @param {string} params.userId - Filter by user ID.
     * @param {string} params.clientId - Filter by client ID.
     * @param {string} params.requestId - Filter by request ID.
     * @param {EventType} params.eventType - Filter by event type.
     * @param {string} params.errorMessage - Filter by error message.
     * @param {number} params.page - Page number for pagination.
     * @param {number} params.size - Page size for pagination.
     * @param {string} params.sortBy - Field to sort by.
     * @param {string} params.sortOrder - Sort order: 'asc' or 'desc'.
     * @param {string} params.search - Search text.
     * @returns {Promise<PageCustomRuleExecutionRecordDto | null>} A promise resolving to paginated execution records.
     */
    public async getRuleExecutionRecords(
        id: string,
        params?: Partial<{
            executionDateFrom: string;
            executionDateTo: string;
            status: ExecutionStatus;
            objectId: string;
            userId: string;
            clientId: string;
            requestId: string;
            eventType: EventType;
            errorMessage: string;
            page: number;
            size: number;
            sortBy: string;
            sortOrder: 'asc' | 'desc';
            search: string;
        }>
    ): Promise<PageCustomRuleExecutionRecordDto | null> {
        const token = await this._auth.ensureToken(this._config);
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';

        return this._http.request<PageCustomRuleExecutionRecordDto>(
            this.getApiUrl(`${id}/executionRecords`) + queryString,
            {
                method: 'GET',
                headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
            }
        );
    }
}
