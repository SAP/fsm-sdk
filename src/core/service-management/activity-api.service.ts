import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { ActivityBulkAPI } from './activity-bulk-api.service';
import { Activity, UdfValue, UnifiedIdentifier } from './service-management.model';


export class ActivityAPI {


    public bulk: ActivityBulkAPI;

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { 
        this.bulk = new ActivityBulkAPI(this._config, this._http, this._auth);
    }

    // https://api.sap.com/api/service_management_ext/resource/Activity_Business_Actions
    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/v2/activities/${path}`; // note: "api/" segment is missing on the routing.
    }

    public async cancel(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            cancelServiceCallConfirmed: boolean,
            cancellationReason: string,
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/cancel${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    public async close(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/close${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    public async duplicate(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            responsibles: string[],
            startDateTime: string,
            unit: string,
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/duplicate${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    public async plan(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            technician: UnifiedIdentifier,

            startDateTime: string,
            startDateTimeFixed: boolean,

            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,

            endDateTime: string,
            endDateTimeFixed: boolean,

            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

}
