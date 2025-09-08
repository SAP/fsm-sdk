import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { DataApiResponse } from './data-api.model';
import { DataCloudDTOModels, DataCloudDTOName } from '../dto-name.model';
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

    private async _requestDataApi<T extends DataCloudDTOModels>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        resourceName: DataCloudDTOName,
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

        const uri = `${RequestOptionsFactory.getDataApiUriFor(this._config, resourceName, resourceId, externalId)}?${queryParams}`;

        return await this._http.request<T>(
            uri,
            {
                method,
                headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
                body: method != 'GET' ? JSON.stringify(resourceData) : undefined
            }
        );
    }

    public async getById<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, id: IdOrExternalId, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        const response = await this._requestDataApi('GET', resourceName, null, id, queryParams);
        return typeof response === 'string' ? JSON.parse(response) : response;
    }

    public async deleteById<T extends Partial<DataCloudDTOModels>>(resourceName: DataCloudDTOName, id: IdOrExternalId, lastChanged: number): Promise<undefined> {
        return this._requestDataApi('DELETE', resourceName, null, id, { lastChanged }) as any as Promise<undefined>;
    }

    public async post<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('POST', resourceName, resource, undefined, queryParams) as Promise<DataApiResponse<T>>;
    }

    public async put<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('PUT', resourceName, resource, id, queryParams) as Promise<DataApiResponse<T>>;
    }

    public async patch<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, id: IdOrExternalId, resource: T, queryParams: { useExternalIds: true } | undefined = undefined): Promise<DataApiResponse<T>> {
        return this._requestDataApi('PATCH', resourceName, resource, id, queryParams) as Promise<DataApiResponse<T>>;
    }
}