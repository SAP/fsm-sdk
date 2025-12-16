import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { Activity, ServiceCall } from './service-management.model';

/**
 * Service for performing composite tree operations on service calls.
 * Provides methods to retrieve and manipulate service calls with their nested activity structures.
 */
export class CompositeTreeAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    /**
     * Constructs the API URL for composite tree service call operations.
     * 
     * @param {string} path - Path to append to the base URL.
     * @returns {string} The complete API URL.
     * @see https://api.sap.com/api/service_management_ext/resource/Service_API_V2
     */
    public getApiUrl(path: string): string {
        return `${this._config.baseUrl}/service-management/api/v2/composite-tree/service-calls${path}`;
    }

    /**
     * Retrieves a service call with its complete tree structure including nested activities.
     * 
     * @param {string} id - Service call ID (also supports code=$ or externalId=$ format).
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add in the response.
     * @returns {Promise<ServiceCall>} A promise resolving to the service call with nested structure.
     */
    public async getServiceCall(
        id: string, // also support code=$ or externalId=$
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCall>(this.getApiUrl(`/${id}${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        }) as Promise<ServiceCall>;
    }

    /**
     * Creates a new service call with its tree structure.
     * 
     * @param {Partial<ServiceCall>} data - Service call data to create.
     * @param {object} params - Optional query parameters.
     * @param {boolean} params.autoCreateActivity - Whether to automatically create an activity for the service call.
     * @returns {Promise<ServiceCall>} A promise resolving to the created service call.
     */
    public async postServiceCall(
        data: Partial<ServiceCall>,
        params: Partial<{
            autoCreateActivity: boolean,
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCall>(this.getApiUrl(`${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<ServiceCall>;
    }

    /**
     * Updates an existing service call with its tree structure.
     * 
     * @param {Partial<ServiceCall>} data - Service call data with updates. Must include the id property.
     * @returns {Promise<ServiceCall>} A promise resolving to the updated service call.
     */
    public async patchServiceCall(
        data: Partial<ServiceCall>
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCall>(this.getApiUrl(`/${data.id}`), {
            method: 'PATCH',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<ServiceCall>;
    }

    /**
     * Retrieves a specific activity within a service call's tree structure.
     * 
     * @param {string} serviceCallId - Service call ID (also supports code=$ or externalId=$ format).
     * @param {string} activityId - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add in the response.
     * @returns {Promise<Activity>} A promise resolving to the activity.
     */
    public async getServiceCallActivity(
        serviceCallId: string, // also support code=$ or externalId=$
        activityId: string, // also support code=$ or externalId=$
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<Activity>(this.getApiUrl(`/${serviceCallId}/activities/${activityId}${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        }) as Promise<Activity>;
    }
}
