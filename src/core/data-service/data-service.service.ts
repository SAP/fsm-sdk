import { ClientConfig } from "../client-config.model";
import { DataCloudDTOModels, DataCloudDTOName } from "./dto-name.model";
import { HttpService } from "../http/http-service";
import { OAuthService } from "../oauth/oauth.service";
import { BatchAction } from "./batch/batch-action.model";
import { BatchAPIService } from "./batch/batch-api.service";
import { BatchResponseJson } from "./batch/batch-response";
import { DataApiResponse } from "./data/data-api.model";
import { DataApiService } from "./data/data-api.service";
import { QueryApiService } from "./query/query-api.service";

/**
 * Data Service API (Data Cloud) - Legacy service for CRUD operations.
 */
export class DataServiceAPIService {


    private _dataApi: DataApiService;
    private _queryAPi: QueryApiService;
    private _batchApi: BatchAPIService;

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) {

        this._dataApi = new DataApiService(this._config, _http, this._auth);
        this._queryAPi = new QueryApiService(this._config, _http, this._auth);
        this._batchApi = new BatchAPIService(this._config, _http, this._auth);

    }

    /**
     * Here, you can input and execute the CoreSQL query.
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param coreSQL valid CoreSQL
     * @param dtoNames DTOName[]
     * @returns Promise<{ data: DTO[] }>
     * @see https://help.sap.com/viewer/fsm_query_api/Cloud/en-US/query-api-intro.html
     */
    public async query<T extends { [projection: string]: DataCloudDTOModels }>(coreSQL: string, dtoNames: DataCloudDTOName[]): Promise<{ data: T[] }> {
        return this._queryAPi.query<T>(coreSQL, dtoNames);
    }

    /**
     * Retrieving Lists of Objects by Id
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName 
     * @param resourceId uuid as string
     * @returns Promise<ClientResponse<DTO>>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async getById<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resourceId: string): Promise<DataApiResponse<T>> {
        return this._dataApi.getById<T>(resourceName, { resourceId });
    }

    /**
     * Retrieving Lists of Objects by ExternalId
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName 
     * @param externalId externalId as string
     * @returns Promise<ClientResponse<DTO>>
     * @note [useExternalIds=true] option will be used. Referenced resources will be objects containing id and externalId if present: `{ id: string, externalId?: string } | null`
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async getByExternalId<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, externalId: string): Promise<DataApiResponse<T>> {
        return this._dataApi.getById<T>(resourceName, { externalId }, { useExternalIds: true });
    }


    /**
     * Deletes Existing Object by Id
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName
     * @param resource { id: string, lastChanged: number }
     * @returns Promise<undefined>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async deleteById<T extends Partial<DataCloudDTOModels> & { id: string, lastChanged: number }>(resourceName: DataCloudDTOName, resource: T): Promise<undefined> {
        const { id, lastChanged } = resource;
        return this._dataApi.deleteById<T>(resourceName, { resourceId: id }, lastChanged);
    }

    /**
     * Deletes Existing Object by ExternalId
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName
     * @param resource { externalId: string, lastChanged: number }
     * @returns Promise<undefined>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async deleteByExternalId<T extends Partial<DataCloudDTOModels> & { externalId: string, lastChanged: number }>(resourceName: DataCloudDTOName, resource: T): Promise<undefined> {
        const { externalId, lastChanged } = resource;
        return this._dataApi.deleteById<T>(resourceName, { externalId }, lastChanged);
    }

    /**
     * Creating Objects by Id
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName
     * @param resource should contain in the body the ENTIRE updated resource
     * @returns Promise<ClientResponse<DTO>>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async post<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.post<T>(resourceName, resource);
    }

    /**
     * Creating Objects by ExternalId
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName DTOName
     * @param resource should contain in the body the ENTIRE updated resource
     * @returns Promise<ClientResponse<DTO>>
     * @note [useExternalIds=true] option will be used. Referenced resources will be objects containing id and externalId if present: `{ id: string, externalId?: string } | null`
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async postByExternalId<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.post<T>(resourceName, resource, { useExternalIds: true });
    }

    /**
     * Updating Existing Objects by Id
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName resourceName
     * @param resource should contain in the body the ENTIRE updated resource
     * @returns Promise<ClientResponse<DTO>>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async put<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.put<T>(resourceName, { resourceId: resource.id as string }, resource);
    }

    /**
     * Updating Existing Objects by ExternalId
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName resourceName
     * @param resource should contain in the resource the ENTIRE updated resource
     * @returns Promise<ClientResponse<DTO>>
     * @note [useExternalIds=true] option will be used. Referenced resources will be objects containing id and externalId if present: `{ id: string, externalId?: string } | null`
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async putByExternalId<T extends DataCloudDTOModels & { externalId: string }>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.put<T>(resourceName, { externalId: resource.externalId as string }, resource, { useExternalIds: true });
    }

    /**
     * Updating Existing Objects by Id
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName resourceName
     * @param resource should contain in the body the [id] & [FIELDS THAT YOU WANT TO UPDATE]
     * @returns Promise<ClientResponse<DTO>>
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async patch<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.patch<T>(resourceName, { resourceId: resource.id as string }, resource);
    }


    /**
     * Updating Existing Objects by ExternalId
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param resourceName resourceName
     * @param resource should contain in the resource the [externalId] & [FIELDS THAT YOU WANT TO UPDATE]
     * @returns Promise<ClientResponse<DTO>>
     * @note [useExternalIds=true] option will be used. Referenced resources will be objects containing id and externalId if present: `{ id: string, externalId?: string } | null`
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
     */
    public async patchByExternalId<T extends DataCloudDTOModels & { externalId: string }>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
        return this._dataApi.patch<T>(resourceName, { externalId: resource.externalId }, resource, { useExternalIds: true });
    }

    /**
     * Batch request with transactional support
     * 
     * @deprecated Use Service Management API for service calls and activities instead.
     * @param actions BatchAction | CreateAction | UpdateAction | DeleteAction
     * @returns Promise<BatchResponseJson<T>[]>
     * @example
     * ```typescript
     *  const actions = [ 
     *    new CreateAction('ServiceCall', { ... }), 
     *    new UpdateAction('ServiceCall', { id, lastChanged ... }),
     *    new DeleteAction('ServiceCall', { id, lastChanged ... }) 
     *  ];
     *  await client.dataServiceAPI.batch(actions)
     * ```
     * @note Requests will be executed in order of the actions array.
     * @see https://help.sap.com/viewer/fsm_data_api/Cloud/en-US/batch-api-intro.html
     */
    public async batch<T extends DataCloudDTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
        return this._batchApi.batch<T>(actions);
    }
}