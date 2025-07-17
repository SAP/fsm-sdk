import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { DataApiResponse } from './data-api.model';
import { DTOModels, DTOName } from '../dto-name.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';

type IdOrExternalId = Partial<{ resourceId: string | null | undefined, externalId: string | null | undefined }>;

export class DataApiService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    private async _requestDataApi<T extends DTOModels>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        resourceName: DTOName,
        resourceData: T | null | any,
        { resourceId, externalId }: IdOrExternalId = { resourceId: null, externalId: null },
        additionalQs: { [k: string]: string | number | boolean } = {}
    ) {
        const token = await this._auth.ensureToken(this._config);

        const queryParams = new URLSearchParams(Object.assign(
            {},
            RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
            method !== 'DELETE' ? { dtos: RequestOptionsFactory.getDTOVersionsString([resourceName]) } : undefined,
            additionalQs
        ) as { [key: string]: string });

        const uri = `${RequestOptionsFactory.getDataApiUriFor(this._config.baseUrl, resourceName, resourceId, externalId)}?${queryParams}`;

        return await this._http.request<T>(
            uri,
            {
                method,
                headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
                body: method != 'GET' ? JSON.stringify(resourceData) : undefined
            }
        );
    }

    public async getResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        const response = await this._requestDataApi('GET', resourceName, null, id, queryParams);
        return typeof response === 'string' ? JSON.parse(response) : response;
    }

    public async deleteResource<T extends Partial<DTOModels>>(resourceName: DTOName, id: IdOrExternalId, lastChanged: number): Promise<undefined> {
        return this._requestDataApi('DELETE', resourceName, null, id, { lastChanged }) as any as Promise<undefined>;
    }

    public async postResource<T extends DTOModels>(resourceName: DTOName, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('POST', resourceName, resource, undefined, queryParams) as Promise<DataApiResponse<T>>;
    }

    public async putResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('PUT', resourceName, resource, id, queryParams) as Promise<DataApiResponse<T>>;
    }

    public async patchResource<T extends DTOModels>(resourceName: DTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('PATCH', resourceName, resource, id, queryParams) as Promise<DataApiResponse<T>>;
    }
}