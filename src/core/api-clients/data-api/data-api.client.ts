import { URLSearchParams } from '../../../polyfills';

import { HttpService } from '../../http/http-service';
import { AuthService } from '../../oauth/oauth.service';
import { OAuthResponse } from '../../oauth/oauth-response.model';


import { RequestOptionsFactory } from '../../request-options.factory';

import { ClientConfig } from '../../client-config.model';
import { ClientResponse } from '../../client-response.model';

import { DTOModels, DTOName } from './model/dto-name.model';


type IdOrExternalId = Partial<{ resourceId: string | null | undefined, externalId: string | null | undefined }>;

export class DataApiClient {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<AuthService>
    ) { }

    //@todo make this private
    public async login(): Promise<OAuthResponse> {
        return await this._auth.ensureToken(this._config);
    }

    //@todo todo move this
    public getToken(): Readonly<OAuthResponse> | undefined {
        return this._auth.getToken();
    }

    //@todo todo move this
    public setToken(token: OAuthResponse): DataApiClient {
        this._auth.setToken(token);
        return this;
    }

    private async _requestDataApi<T extends DTOModels>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        resourceName: DTOName,
        resourceData: T | null | any,
        { resourceId, externalId }: IdOrExternalId = { resourceId: null, externalId: null },
        additionalQs: { [k: string]: string | number | boolean } = {}
    ) {
        const token = await this.login();

        const queryParams = new URLSearchParams(Object.assign(
            {},
            RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
            method !== 'DELETE' ? { dtos: RequestOptionsFactory.getDTOVersionsString([resourceName]) } : undefined,
            additionalQs
        ) as { [key: string]: string });

        const uri = `${RequestOptionsFactory.getDataApiUriFor(token, resourceName, resourceId, externalId)}?${queryParams}`;

        return await this._http.request<T>(
            uri,
            {
                method,
                headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
                body: method != 'GET' ? JSON.stringify(resourceData) : undefined
            }
        );
    }

    public async getResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, queryParams: { useExternalIds: true } | undefined = undefined): Promise<ClientResponse<T>> {
        const response = await this._requestDataApi('GET', resourceName, null, id, queryParams);
        return typeof response === 'string' ? JSON.parse(response) : response;
    }

    public async deleteResource<T extends Partial<DTOModels>>(resourceName: DTOName, id: IdOrExternalId, lastChanged: number): Promise<undefined> {
        return this._requestDataApi('DELETE', resourceName, null, id, { lastChanged }) as any as Promise<undefined>;
    }

    public async postResource<T extends DTOModels>(resourceName: DTOName, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<ClientResponse<T>> {
        return this._requestDataApi('POST', resourceName, resource, undefined, queryParams) as Promise<ClientResponse<T>>;
    }

    public async putResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<ClientResponse<T>> {
        return this._requestDataApi('PUT', resourceName, resource, id, queryParams) as Promise<ClientResponse<T>>;
    }

    public async patchResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<ClientResponse<T>> {
        return this._requestDataApi('PATCH', resourceName, resource, id, queryParams) as Promise<ClientResponse<T>>;
    }

}