import { DataCloudDTOName, DataCloudDTOModels } from './core/dto-name.model';
import { ClientConfig } from './core/client-config.model';
import { OAuthTokenResponse } from './core/oauth/oauth-token-response.model';
import { DataApiResponse } from './core/data/data-api.model';
import { BatchAction } from './core/batch/batch-action.model';
import { RequestOptionsFactory } from './core/request-options.factory';
import { BatchResponseJson } from './core/batch/batch-response';

import { OAuthService } from './core/oauth/oauth.service';
import { HttpService } from './core/http/http-service';
import { DataApiService } from './core/data/data-api.service';
import { Account, AccountAPIService, Company } from './core/account/account-api.service';
import { QueryApiService } from './core/query/query-api.service';
import { BatchAPIService } from './core/batch/batch-api.service';
import { TranslationApiService } from './core/translations/translations-api.service';

export class CoreAPIClient {

  private _auth: OAuthService;
  private _dataApi: DataApiService;
  private _accountApi: AccountAPIService;
  private _queryAPi: QueryApiService;
  private _batchApi: BatchAPIService;
  private _translationApi: TranslationApiService;

  private _config_default: ClientConfig = {
    debug: false,

    oauthEndpoint: undefined,
    baseUrl: 'https://eu.fsm.cloud.sap',
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
  private _config: ClientConfig;

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
   *	// [optional] enable using custom oauth endpoints see https://api.sap.com/api/cloud_authentication_service_ext/overview
   *	oauthEndpoint: 'https://eu.fsm.cloud.sap/api/oauth2/v2',
   *	
   *	// [optional] client will cache token (helpful for writing integration tests)
   *	tokenCacheFilePath: './.myToken.json'
   *	
   *}
   * ```
   * @param _config ClientConfig
   * @returns CoreAPIClient
   */
  constructor(config: Partial<ClientConfig>) {
    this._config = Object.assign(this._config_default, config) as ClientConfig

    const _http = new HttpService(this._config);

    this._auth = new OAuthService(_http);
    this._queryAPi = new QueryApiService(this._config, _http, this._auth);
    this._batchApi = new BatchAPIService(this._config, _http, this._auth);
    this._accountApi = new AccountAPIService(this._config, this._auth);
    this._dataApi = new DataApiService(this._config, _http, this._auth);
    this._translationApi = new TranslationApiService(this._config, _http, this._auth);
  }

  /**
   * @param o { legacyFormat: boolean }
   * @description Creates a UUID string.
   * If `legacyFormat` is true, it returns the UUID without dashes and in uppercase. used by FSM legacy data-cloud APIs APIs.
   * If `legacyFormat` is false, it returns the UUID in its standard format.
   * @returns string
   */
  public static createUUID(o: { legacyFormat: boolean } | undefined = { legacyFormat: true }): string {
    return RequestOptionsFactory.getUUID(o?.legacyFormat);
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
  public async query<T extends { [projection: string]: DataCloudDTOModels }>(coreSQL: string, dtoNames: DataCloudDTOName[]): Promise<{ data: T[] }> {
    return this._queryAPi.query<T>(coreSQL, dtoNames);
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
  public async getById<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resourceId: string): Promise<DataApiResponse<T>> {
    return this._dataApi.getById<T>(resourceName, { resourceId });
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
  public async getByExternalId<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, externalId: string): Promise<DataApiResponse<T>> {
    return this._dataApi.getById<T>(resourceName, { externalId }, { useExternalIds: true });
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
  public async deleteById<T extends Partial<DataCloudDTOModels> & { id: string, lastChanged: number }>(resourceName: DataCloudDTOName, resource: T): Promise<undefined> {
    const { id, lastChanged } = resource;
    return this._dataApi.deleteById<T>(resourceName, { resourceId: id }, lastChanged);
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
  public async deleteByExternalId<T extends Partial<DataCloudDTOModels> & { externalId: string, lastChanged: number }>(resourceName: DataCloudDTOName, resource: T): Promise<undefined> {
    const { externalId, lastChanged } = resource;
    return this._dataApi.deleteById<T>(resourceName, { externalId }, lastChanged);
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
  public async post<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.post<T>(resourceName, resource);
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
  public async postByExternalId<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.post<T>(resourceName, resource, { useExternalIds: true });
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
  public async put<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.put<T>(resourceName, { resourceId: resource.id as string }, resource);
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
  public async putByExternalId<T extends DataCloudDTOModels & { externalId: string }>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.put<T>(resourceName, { externalId: resource.externalId as string }, resource, { useExternalIds: true });
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
  public async patch<T extends DataCloudDTOModels>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.patch<T>(resourceName, { resourceId: resource.id as string }, resource);
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
  public async patchByExternalId<T extends DataCloudDTOModels & { externalId: string }>(resourceName: DataCloudDTOName, resource: T): Promise<DataApiResponse<T>> {
    return this._dataApi.patch<T>(resourceName, { externalId: resource.externalId }, resource, { useExternalIds: true });
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
  public async batch<T extends DataCloudDTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
    return this._batchApi.batch<T>(actions);
  }

  /**
   * Executes a login using the current client configuration and retrieves an OAuth token.
   * 
   * Note: Explicit login is not required before other actions; the client will auto-login and refresh tokens as needed.
   * 
   * @returns {Promise<OAuthTokenResponse>} Resolves with the OAuth token response.
   */
  public async login(): Promise<OAuthTokenResponse> {
    return this._auth.ensureToken(this._config);
  }


  /**
   * Retrieves the current OAuth token, if available.
   * 
   * @returns {Readonly<OAuthTokenResponse> | undefined} The current OAuth token or undefined if not logged in.
   */
  public getToken(): Readonly<OAuthTokenResponse> | undefined {
    return this._auth.getToken();
  }

  /**
   * Sets the OAuth token to be used by the client.
   * 
   * @param {OAuthTokenResponse} token - The OAuth token to set.
   * @returns {CoreAPIClient} The current client instance for chaining.
   */
  public setToken(token: OAuthTokenResponse): CoreAPIClient {
    this._auth.setToken(token);
    return this;
  }

  /**
   * Sets the company to use for authentication, if the token contains multiple companies.
   * 
   * @param {string} companyName - The name of the company to set for authentication.
   * @throws {Error} If no token is found, or if the company is not available in the token.
   * @returns {CoreAPIClient} The current client instance for chaining.
   */
  public setAuthCompany(companyName: string): CoreAPIClient {
    const token = this._auth.getToken();
    if (!token) {
      throw new Error('No token found. Please login first.');
    }

    if (token.contentType === 'user' && (token.content.companies || []).map(it => it.name.toLocaleLowerCase()).includes(companyName.toLocaleLowerCase()) === false) {
      throw new Error(`Company '${companyName}' not found in token. Available companies: ${token.content.companies?.map(it => it.name).join(', ')}`);
    }

    this._config.authCompany = companyName;

    return this;
  }

  /**
   * Retrieves all accounts accessible to the authenticated user/client.
   * 
   * @returns {Promise<Account[]>} A promise resolving to an array of accounts.
   */
  public async getAccounts(): Promise<Account[]> {
    return this._accountApi.getAccounts()
  }

  /**
   * Retrieves all companies associated with a specific account.
   * 
   * @param {number} accountId - The ID of the account.
   * @returns {Promise<Company[]>} A promise resolving to an array of companies for the given account.
   */
  public async getCompaniesByAccountId(accountId: number): Promise<Company[]> {
    return this._accountApi.getCompaniesByAccount(accountId);
  }
}
