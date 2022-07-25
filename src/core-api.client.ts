import { DTOName, DTOModels } from './core/dto-name.model';
import { ClientConfig } from './core/client-config.model';
import { OauthTokenResponse } from './core/oauth-token-response.model';
import { ClientResponse } from './core/client-response.model';
import { BatchAction } from './core/batch-action.model';
import { RequestOptionsFactory } from './core/request-options.factory';
import { BatchResponseJson } from './core/batch-response';

import { AuthService } from './core/auth.service';
import { HttpService } from './core/http-service';
import { ClientService } from './core/client.service';

export class CoreAPIClient {

  private _client: ClientService;
  private _config_default: ClientConfig = {
    debug: false,

    oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',
    tokenCacheFilePath: undefined,

    clientIdentifier: '<your-clientIdentifier>',
    clientSecret: '<your-clientSecret>',
    clientVersion: '<your-clientVersion>',

    authGrantType: 'password',

    authAccountName: undefined,
    authUserName: undefined,
    authPassword: undefined,
    authCompany: undefined
  }

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
    const _config = Object.assign(this._config_default, config);
    const _http = new HttpService(_config);
    const _auth = new AuthService(_http);
    this._client = new ClientService(_config, _http, _auth);
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
    return this._client.query<T>(coreSQL, dtoNames);
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
    return this._client.getResource<T>(resourceName, { resourceId });
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
    return this._client.getResource<T>(resourceName, { externalId }, { useExternalIds: true });
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
    return this._client.deleteResource<T>(resourceName, { resourceId: id }, lastChanged);
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
    return this._client.deleteResource<T>(resourceName, { externalId }, lastChanged);
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
    return this._client.postResource<T>(resourceName, resource);
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
    return this._client.postResource<T>(resourceName, resource, { useExternalIds: true });
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
    return this._client.putResource<T>(resourceName, { resourceId: resource.id as string }, resource);
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
    return this._client.putResource<T>(resourceName, { externalId: resource.externalId as string }, resource, { useExternalIds: true });
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
    return this._client.patchResource<T>(resourceName, { resourceId: resource.id as string }, resource);
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
    return this._client.patchResource<T>(resourceName, { externalId: resource.externalId }, resource, { useExternalIds: true });
  }

  /**
   * Batch request with transational support
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
    return this._client.batch<T>(actions);
  }

  /**
   * Will use provided ClientConfig and perform a Login.
   * 
   * Note: that it is **not required** to explicitly call client.login()
   * before each client action. The CoreAPIClient will login and  **keep a internally token copy**
   * and will use this **up to its expiration** and **will auto refresh** when needed.
   * Calling client.login() will NOT result in mutiple http calls to the oauth api.
   * 
   * related api docs: 
   * https://help.sap.com/viewer/fsm_access_api/Cloud/en-US/oauth-intro.html
   * 
   * @returns Promise<OauthTokenResponse>
   */
  public async login(): Promise<OauthTokenResponse> {
    return this._client.login();
  }


  /**
   * get OauthTokenResponse
   * @returns Readonly<OauthTokenResponse> | undefined
   */
  public getToken(): Readonly<OauthTokenResponse> | undefined {
    return this._client.getToken();
  }

  /**
   * set OauthTokenResponse
   * @param token OauthTokenResponse
   * @returns CoreAPIClient
   */
  public setToken(token: OauthTokenResponse): CoreAPIClient {
    this._client.setToken(token);
    return this;
  }

}
