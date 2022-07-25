import { DTOName, DTOModels } from './core/api-clients/data-api/model/dto-name.model';
import { ClientConfig } from './core/config/client-config.model';
import { OAuthResponse } from './core/api-clients/oauth-api/oauth-response.model';
import { ClientResponse } from './core/client-response.model';
import { BatchAction } from './core/api-clients/data-api/model/batch-action.model';
import { RequestOptionsFactory } from './core/request-options.factory';
import { BatchResponseJson } from './core/api-clients/data-api/model/batch-response.model';

import { OAuthApiClient } from './core/api-clients/oauth-api/oauth-api.client';
import { HttpService } from './core/http/http-service';
import { DataApiClient } from './core/api-clients/data-api/data-api.client';
import { QueryApiClient } from './core/api-clients/query-api/query-api.client';
import { BatchApiClient } from './core/api-clients/data-api/batch-api.client';
import { ClientConfigService } from './core/config/client-config.service';

export class CoreAPIClient {

  private _dataApi: DataApiClient;
  private _queryApi: QueryApiClient;
  private _batchApi: BatchApiClient;
  private _oauthApi: OAuthApiClient;
  private _config: Readonly<ClientConfig>;

  /**
   * The CoreAPIClient
   * 
   * ```typescript
   *{
   *	// [mandatory] your client configuration
   *	clientIdentifier: '<your-clientIdentifier>',
   *	clientSecret: '<your-clientSecret>',
   *	clientVersion: '<your-clientVersion>',
   *	
   *	// [optional] oauth grant type, default=password
   *	authGrantType: 'password' | 'client_credentials' | undefined
   *	
   *	// [optional] | [mandatory] if oauth grant type password
   *	authAccountName: '<your-authAccountName>',
   *	
   *	// [optional] | [mandatory] if oauth grant type password
   *	authUserName: '<your-authUserName>',
   *	
   *	// [optional] | [mandatory] if oauth grant type password
   *	authPassword: '<your-authPassword>',
   *	
   *	// [optional] or default=FIRST
   *	authCompany: '<your-authCompany>',
   *	
   *	// [optional] provide verbose logs
   *	debug: false,
   *	
   *	// [optional] enable using custom oauth endpoints
   *	oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',
   *	
   *	// [optional] client will cache token (helpful for writing integration tests)
   *	tokenCacheFilePath: './.myToken.json'
   *	
   *}
   * ```
   * @param _config ClientConfig
   * @returns CoreAPIClient
   */
  constructor(config: ClientConfig) {
    const defaultConfig: ClientConfig = ClientConfigService.getDefault();
    this._config = Object.assign(defaultConfig, config);

    const _http = new HttpService(this._config);

    this._oauthApi = new OAuthApiClient(_http);

    this._dataApi = new DataApiClient(this._config, _http, this._oauthApi);
    this._queryApi = new QueryApiClient(this._config, _http, this._oauthApi);
    this._batchApi = new BatchApiClient(this._config, _http, this._oauthApi);
  }


  /**
   * Creates UUID
   * @returns a uuid that can be used as an FSM object id
   */
  public static createUUID(): string {
    return RequestOptionsFactory.getUUID().toUpperCase();
  }

  /**
   * Here, you can input and execute the CoreSQL query.
   * 
   * related api docs:  
   * https://help.sap.com/viewer/fsm_query_api/Cloud/en-US/query-api-intro.html
   * 
   * @param coreSQL valid CoreSQL
   * @param dtoNames DTOName[]
   * @returns Promise<{ data: DTO[] }>
   */
  public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
    return this._queryApi.query<T>(coreSQL, dtoNames);
  }

  /**
   * Retrieving Lists of Objects by Id
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName 
   * @param resourceId uuid as string
   * @returns Promise<ClientResponse<DTO>>
   */
  public async getById<T extends DTOModels>(resourceName: DTOName, resourceId: string): Promise<ClientResponse<T>> {
    return this._dataApi.getResource<T>(resourceName, { resourceId });
  }

  /**
   * Retrieving Lists of Objects by ExternalId
   * 
   * Note: [useExternalIds=true] option will be used
   * referenced resources will not be a uid-string or null but of object or null
   * containing id and externalId if present
   * ```typescript
   *  [referenced-resource] : { id: string, externalId? : string } | null
   * ```
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName 
   * @param externalId externalId as string
   * @returns Promise<ClientResponse<DTO>>
   */
  public async getByExternalId<T extends DTOModels>(resourceName: DTOName, externalId: string): Promise<ClientResponse<T>> {
    return this._dataApi.getResource<T>(resourceName, { externalId }, { useExternalIds: true });
  }

  /**
   * Deletes Existing Object by Id
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName
   * @param resource { id: string, lastChanged: number }
   * @returns 
   */
  public async deleteById<T extends Partial<DTOModels> & { id: string, lastChanged: number }>(resourceName: DTOName, resource: T): Promise<undefined> {
    const { id, lastChanged } = resource;
    return this._dataApi.deleteResource<T>(resourceName, { resourceId: id }, lastChanged);
  }

  /**
   * Deletes Existing Object by ExternalId
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName
   * @param resource { id: string, lastChanged: number }
   * @returns 
   */
  public async deleteByExternalId<T extends Partial<DTOModels> & { externalId: string, lastChanged: number }>(resourceName: DTOName, resource: T): Promise<undefined> {
    const { externalId, lastChanged } = resource;
    return this._dataApi.deleteResource<T>(resourceName, { externalId }, lastChanged);
  }

  /**
   * Creating Objects by Id
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.postResource<T>(resourceName, resource);
  }

  /**
   * Creating Objects by ExternalId
   * 
   * Note: [useExternalIds=true] option will be used
   * referenced resources will not be a uid-string or null but of object or null
   * containing id and externalId if present
   * ```typescript
   *  [referenced-resource] : { id: string, externalId? : string } | null
   * ```
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName DTOName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async postByExternalId<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.postResource<T>(resourceName, resource, { useExternalIds: true });
  }

  /**
   * Updating Existing Objects by Id
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async put<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.putResource<T>(resourceName, { resourceId: resource.id as string }, resource);
  }

  /**
   * Updating Existing Objects by ExternalId
   * 
   * Note: [useExternalIds=true] option will be used
   * referenced resources will not be a uid-string or null but of object or null
   * containing id and externalId if present
   * ```typescript
   *  [referenced-resource] : { id: string, externalId? : string } | null
   * ```
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName resourceName
   * @param resource should contain in the resource the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async putByExternalId<T extends DTOModels & { externalId: string }>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.putResource<T>(resourceName, { externalId: resource.externalId as string }, resource, { useExternalIds: true });
  }

  /**
   * Updating Existing Objects by Id
   * should contain [id] in the body the entire updated resource
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName resourceName
   * @param resource should contain in the body the [id] & [FIELDS THAT YOU WANT TO UPDATE]
   * @returns Promise<ClientResponse<DTO>>
   */
  public async patch<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.patchResource<T>(resourceName, { resourceId: resource.id as string }, resource);
  }

  /**
   * Updating Existing Objects by ExternalId
   * should contain [ExternalId] in the resource the entire updated resource
   * 
   * Note: [useExternalIds=true] option will be used
   * referenced resources will not be a uid-string or null but of object or null
   * containing id and externalId if present
   * ```typescript
   *  [referenced-resource] : { id: string, externalId? : string } | null
   * ```
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US
   * 
   * @param resourceName resourceName
   * @param resource should contain in the resource the [externalId] & [FIELDS THAT YOU WANT TO UPDATE]
   * @returns Promise<ClientResponse<DTO>>
   */
  public async patchByExternalId<T extends DTOModels & { externalId: string }>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._dataApi.patchResource<T>(resourceName, { externalId: resource.externalId }, resource, { useExternalIds: true });
  }

  /**
   * Batch request with transnational support
   * requests will be executed in oder of the actions array.
   * 
   * Example:
   * ```typescript
   *  const actions = [ 
   *    new CreateAction('ServiceCall', { ... }), 
   *    new UpdateAction('ServiceCall', { id, lastChanged ... }),
   *    new DeleteAction('ServiceCall', { id, lastChanged ... }) 
   *  ];
   *  await client.batch(actions)
   * ```
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_data_api/Cloud/en-US/batch-api-intro.html
   * 
   * @param actions BatchAction | CreateAction | UpdateAction | DeleteAction
   * @returns Promise<BatchResponseJson<T>[]>
   */
  public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
    return this._batchApi.batch<T>(actions);
  }

  /**
   * Will use provided ClientConfig and perform a Login.
   * 
   * Note: that it is **not required** to explicitly call client.login()
   * before each client action. The CoreAPIClient will login and  **keep a internally token copy**
   * and will use this **up to its expiration** and **will auto refresh** when needed.
   * Calling client.login() will NOT result in multiple http calls to the oauth api.
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_access_api/Cloud/en-US/oauth-intro.html
   * 
   * @returns Promise<OauthTokenResponse>
   */
  public async login(): Promise<OAuthResponse> {
    return await this._oauthApi.ensureToken(this._config);
  }


  /**
   * get OauthTokenResponse
   * @returns Readonly<OauthTokenResponse> | undefined
   */
  public getToken(): Readonly<OAuthResponse> | undefined {
    return this._dataApi.getToken();
  }

  /**
   * set OauthTokenResponse
   * @param token OauthTokenResponse
   * @returns CoreAPIClient
   */
  public setToken(token: OAuthResponse): CoreAPIClient {
    this._dataApi.setToken(token);
    return this;
  }

}
