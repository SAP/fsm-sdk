import { URLSearchParams } from '../polyfills';
import { BatchAction } from './batch-action.model';
import { BatchRequest } from './batch-request.model';
import { BatchResponse, BatchResponseJson } from './batch-response';
import { ClientConfig } from './client-config.model';
import { ClientResponse } from './client-response.model';
import { DTOModels, DTOName } from './dto-name.model';
import { HttpService } from './http-service';
import { OauthTokenResponse } from './oauth-token-response.model';
import { AuthService } from './auth.service';
import { RequestOptionsFactory } from './request-options.factory';

type IdOrExternalId = Partial<{ resourceId: string | null | undefined, externalId: string | null | undefined }>;

export class ClientService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<AuthService>
    ) { }

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

    public async login(): Promise<OauthTokenResponse> {
        return await this._auth.ensureToken(this._config);
    }

    public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
        const token = await this.login();
        const queryParams = new URLSearchParams({
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
            dtos: RequestOptionsFactory.getDTOVersionsString(dtoNames)
        });
        return await this._http.request(`${token.cluster_url}/api/query/v1?${queryParams}`,
            {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    RequestOptionsFactory.getRequestHeaders(token, this._config)
                ),
                body: JSON.stringify({ query: coreSQL })
            }) as { data: T[] };
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

    public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
        const token = await this.login();
        const body = new BatchRequest(token, this._config, actions).toString();

        const queryParams = new URLSearchParams(Object.assign({
            clientIdentifier: this._config.clientIdentifier,
            dtos: RequestOptionsFactory.getDTOVersionsString(actions.map(it => it.dtoName)),
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
        }));

        const responseBody = await this._http.request<string>(`${token.cluster_url}/api/data/batch/v1?${queryParams}`, {
            method: 'POST',
            headers: {
                'content-type': 'multipart/mixed;boundary="======boundary======"',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config),
            },
            body
        });

        return responseBody !== null
            ? new BatchResponse<T>(responseBody).toJson()
            : [];
    }

    public getToken(): Readonly<OauthTokenResponse> | undefined {
        return this._auth.getToken();
    }

    public setToken(token: OauthTokenResponse): ClientService {
        this._auth.setToken(token);
        return this;
    }

}