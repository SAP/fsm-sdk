import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { ActivityTree, ServiceCallTree } from './service-management.model';

export class CompositeTreeAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    // https://api.sap.com/api/cloud_translation_service_ext/overview
    public getApiUrl(path: string): string {
        return `${this._config.baseUrl}/service-management/api/v2/composite-tree/service-calls${path}`;
    }

    public async getServiceCall(
        id: string, // also support code=$ or externalId=$
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCallTree>(this.getApiUrl(`/${id}${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        }) as Promise<ServiceCallTree>;
    }

    public async postServiceCall(
        data: Partial<ServiceCallTree>,
        params: Partial<{
            autoCreateActivity: boolean,
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCallTree>(this.getApiUrl(`${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<ServiceCallTree>;
    }

    public async patchServiceCall(
        data: Partial<ServiceCallTree>
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ServiceCallTree>(this.getApiUrl(`/${data.id}`), {
            method: 'PATCH',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        }) as Promise<ServiceCallTree>;
    }

    public async getServiceCallActivity(
        serviceCallId: string, // also support code=$ or externalId=$
        activityId: string, // also support code=$ or externalId=$
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ActivityTree>(this.getApiUrl(`/${serviceCallId}/activities/${activityId}${(params ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        }) as Promise<ActivityTree>;
    }
}
