import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { Activity, ServiceCall, UnifiedIdentifier } from './service-management.model';

export type BulkResponse<T> = {
    hasErrors: boolean,
    results: {
        resource: T
        status: number,
        error?: { description: string }
    }[];
}

/**
 * Service for performing composite bulk operations on service calls.
 * Allows creating, updating, and managing multiple service calls in a single request.
 */
export class CompositeBulkAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    /**
     * Constructs the API URL for composite bulk service call operations.
     * 
     * @param {string} path - Optional path to append to the base URL.
     * @returns {string} The complete API URL.
     * @see https://api.sap.com/api/service_management_ext/resource/Service_API_V2
     */
    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/api/v2/composite-bulk/service-calls${path}`;
    }

    /**
     * Creates multiple service calls in a single bulk operation.
     * 
     * @param {Partial<ServiceCall>[]} data - Array of service call objects to create.
     * @param {object} params - Optional query parameters.
     * @param {boolean} params.autoCreateActivity - Whether to automatically create activities for the service calls.
     * @returns {Promise<BulkResponse<ServiceCall>>} A promise resolving to the bulk operation results.
     */
    public async postServiceCalls(
        data: Partial<ServiceCall>[],
        params: Partial<{
            autoCreateActivity: boolean,
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<BulkResponse<ServiceCall>>(this.getApiUrl(`${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<BulkResponse<ServiceCall>>;
    }

    /**
     * Updates multiple service calls in a single bulk operation.
     * 
     * @param {Partial<ServiceCall>[]} data - Array of service call objects with updates. Each must include an id.
     * @returns {Promise<BulkResponse<ServiceCall>>} A promise resolving to the bulk operation results.
     */
    public async patchServiceCalls(
        data: Partial<ServiceCall>[],
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<BulkResponse<ServiceCall>>(this.getApiUrl(), {
            method: 'PATCH',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<BulkResponse<ServiceCall>>
    }

    /**
     * Marks multiple service calls as technically complete in a single bulk operation.
     * 
     * @param {object} data - Request data.
     * @param {Partial<UnifiedIdentifier>[]} data.serviceCallIds - Array of service call identifiers to mark as technically complete.
     * @returns {Promise<BulkResponse<ServiceCall>>} A promise resolving to the bulk operation results.
     */
    public async postServiceCallsTechnicallyComplete(
        data: { serviceCallIds: Partial<UnifiedIdentifier>[] }
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<BulkResponse<ServiceCall>>(this.getApiUrl(`/technically-complete`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<BulkResponse<ServiceCall>>;
    }

}
