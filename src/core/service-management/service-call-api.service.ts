import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { Activity, ServiceCall, UdfValue } from './service-management.model';

/**
 * Service for performing business actions on service calls.
 * Provides methods to cancel and manage service call lifecycle.
 */
export class ServiceCallAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    /**
     * Constructs the API URL for service call business actions.
     * 
     * @param {string} path - Path to append to the base URL.
     * @returns {string} The complete API URL.
     * @see https://api.sap.com/api/service_management_ext/resource/Service_Call_Business_Actions
     */
    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/v2/servicecalls/${path}`;
    }

    /**
     * Cancels a service call by its ID.
     * 
     * @param {string} id - Service call ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional cancellation parameters.
     * @param {string} options.cancellationReason - Reason for cancellation.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the cancelled service call.
     */
    public async cancel(
        id: string, // also support code=$ or externalId=$
        options: Partial<{
            cancellationReason: string,
            udfValues: UdfValue[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/cancel`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;
    }

    /**
     * Marks a service call as technically complete.
     * 
     * @param {string} id - Service call ID (also supports code=$ or externalId=$ format).
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the service call.
     */
    public async technicallyComplete(
        id: string // also support code=$ or externalId=$
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/technically-complete`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify({})
        }) as Promise<{ activity: Activity }>;
    }

}
