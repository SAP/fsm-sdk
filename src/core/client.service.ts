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
import { RequestOptionsFacory } from './request-options.facory';

export class ClientService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<AuthService>
    ) { }

    private async _requestDataApi<T extends DTOModels>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        dtoName: DTOName,
        dtoData: T | null | any,
        dtoId: string | null = null,
        additionalQs: { [k: string]: string | number | boolean } = {}
    ) {
        const token = await this._auth.ensureToken(this._config);

        const params = new URLSearchParams(Object.assign({},
            RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
            method !== 'DELETE' ? { dtos: RequestOptionsFacory.getDTOVersionsString([dtoName]) } : undefined,
            additionalQs) as { [key: string]: string });

        return await this._http.request<T>(
            `${RequestOptionsFacory.getDataApiUriFor(token, dtoName, dtoId)}?${params}`,
            {
                method,
                headers: RequestOptionsFacory.getRequestHeaders(token, this._config),
                body: method != 'GET' ? JSON.stringify(dtoData) : undefined
            });
    }

    public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
        const token = await this._auth.ensureToken(this._config);
        const params = new URLSearchParams({
            ...RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
            dtos: RequestOptionsFacory.getDTOVersionsString(dtoNames)
        });
        return await this._http.request(`${token.cluster_url}/api/query/v1?${params}`,
            {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    RequestOptionsFacory.getRequestHeaders(token, this._config)
                ),
                body: JSON.stringify({ query: coreSQL })
            }) as { data: T[] };
    }

    public async getById<T extends DTOModels>(resourceName: DTOName, resourceId: string): Promise<ClientResponse<T>> {
        const response = await this._requestDataApi('GET', resourceName, null, resourceId);
        return typeof response === 'string' ? JSON.parse(response) : response; // not sending json headers
    }

    public async deleteById<T extends Partial<DTOModels>>(resourceName: DTOName, resource: { id: string, lastChanged: number }): Promise<undefined> {
        const { id, lastChanged } = resource;
        return this._requestDataApi('DELETE', resourceName, null, id, { lastChanged }) as any as Promise<undefined>;
    }

    public async post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
        return this._requestDataApi('POST', resourceName, resource) as Promise<ClientResponse<T>>;
    }

    public async put<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
        const { id } = resource;
        return this._requestDataApi('PUT', resourceName, resource, id) as Promise<ClientResponse<T>>;
    }

    public async patch<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
        const { id } = resource;
        return this._requestDataApi('PATCH', resourceName, resource, id) as Promise<ClientResponse<T>>;
    }

    public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
        const token = await this._auth.ensureToken(this._config);
        const body = new BatchRequest(token, this._config, actions).toString();

        const params = new URLSearchParams(Object.assign({
            clientIdentifier: this._config.clientIdentifier,
            dtos: RequestOptionsFacory.getDTOVersionsString(actions.map(it => it.dtoName)),
            ...RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
        }));

        const responseBody = await this._http.request<string>(`${token.cluster_url}/api/data/batch/v1?${params}`, {
            method: 'POST',
            headers: {
                'content-type': 'multipart/mixed;boundary="======boundary======"',
                ...RequestOptionsFacory.getRequestHeaders(token, this._config),
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