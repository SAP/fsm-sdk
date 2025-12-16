import { ClientConfig } from './core/client-config.model';
import { OAuthTokenResponse } from './core/oauth/oauth-token-response.model';
import { RequestOptionsFactory } from './core/request-options.factory';
import { OAuthService } from './core/oauth/oauth.service';
import { HttpService } from './core/http/http-service';
import {  AccountAPIService } from './core/account/account-api.service';
import { TranslationApiService } from './core/translations/translations-api.service';
import { ServiceManagementAPIService } from './core/service-management/service-management.service';
import { DataServiceAPIService } from './core/data-service/data-service.service';
import { RulesAPIService } from './core/rules/rules-api.service';


export class CoreAPIClient {

  private _auth: OAuthService;
  private _serviceManagementApi: ServiceManagementAPIService;

  private _accountApi: AccountAPIService;
  private _translationApi: TranslationApiService;
  private _rulesApi: RulesAPIService;

  private _dataServiceAPI: DataServiceAPIService


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
    this._accountApi = new AccountAPIService(this._config, this._auth);
    this._dataServiceAPI = new DataServiceAPIService(this._config, _http, this._auth);
    this._translationApi = new TranslationApiService(this._config, _http, this._auth);
    this._rulesApi = new RulesAPIService(this._config, _http, this._auth);
    this._serviceManagementApi = new ServiceManagementAPIService(this._config, _http, this._auth);
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
   * Provides access to the Service Management API for managing service calls and activities.
   * 
   * @returns {ServiceManagementAPIService} Service management API instance with activity, service call, and composite operations.
   */
  public get serviceManagementAPI(): ServiceManagementAPIService {
    return this._serviceManagementApi;
  }

  /**
   * Provides access to the legacy Data Service API (Data Cloud).
   * 
   * @returns {DataServiceAPIService} Data service API instance for legacy data cloud operations.
   */
  public get dataServiceAPI(): DataServiceAPIService {
    return this._dataServiceAPI;
  }

  /**
   * Provides access to the Account API for retrieving account and company information.
   * 
   * @returns {AccountAPIService} Account API instance for account and company operations.
   */
  public get accountAPI(): AccountAPIService {
    return this._accountApi;
  }

  /**
   * Provides access to the Translation API for managing labels and translations.
   * 
   * @returns {TranslationApiService} Translation API instance for label and value operations.
   */
  public get translationAPI(): TranslationApiService {
    return this._translationApi;
  }

  /**
   * Provides access to the Rules API for managing business rules.
   * 
   * @returns {RulesAPIService} Rules API instance for business rule operations.
   */
  public get rulesAPI(): RulesAPIService {
    return this._rulesApi;
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

}
