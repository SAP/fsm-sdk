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


export class CompositeBulkAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    // https://api.sap.com/api/service_management_ext/resource/Service_API_V2
    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/api/v2/composite-bulk/service-calls${path}`;
    }

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
