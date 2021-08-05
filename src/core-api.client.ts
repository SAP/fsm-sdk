import { DTOName, DTOModels } from './core/dto-name.model';
import { ClientConfig } from './core/client-config.model';
import { OauthTokenResponse } from './core/oauth-token-response.model';
import { ClientResponse } from './core/client-response.model';
import { BatchAction } from './core/batch-action.model';
import { RequestOptionsFacory } from './core/request-options.facory';
import { BatchResponseJson } from './core/batch-response';

import { AuthService } from './core/oauth-token.service';
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
   *
   * @param _config ClientConfig {
   *   debug: boolean | undefined;
   *   tokenCacheFilePath: string | undefined;
   *
   *   oauthEndpoint: string;
   *
   *   clientIdentifier: string;
   *   clientSecret: string;
   *   clientVersion: string;
   *
   *   authGrantType: 'password' | 'client_credentials' | undefined
   * 
   *   authAccountName: string | undefined;
   *   authUserName: string | undefined;
   *   authPassword: string | undefined;
   *   authCompany: string | undefined;
   * 
   *  }
   * @returns CoreAPIClient
   */
  constructor(config: ClientConfig) {
    const _config = Object.assign(this._config_default, config);
    const _http = new HttpService(_config);
    const _auth = new AuthService(_http, _config);
    this._client = new ClientService(_config, _http, _auth);
  }


  /**
   * Creates UUID
   * @returns a uuid that can be used as an FSM object id
   */
  public static createUUID(): string {
    return RequestOptionsFacory.getUUID().toUpperCase();
  }

  /**
   * Here, you can input and execute the CoreSQL query.
   * @param coreSQL valid CoreSQL
   * @param dtoNames DTOName[]
   * @returns Promise<{ data: DTO[] }>
   */
  public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
    return this._client.query<T>(coreSQL, dtoNames);
  }

  /**
   * Retrieving Lists of Objects
   * @param resourceName DTOName 
   * @param resourceId uuid as string
   * @returns Promise<ClientResponse<DTO>>
   */
  public async getById<T extends DTOModels>(resourceName: DTOName, resourceId: string): Promise<ClientResponse<T>> {
    return this._client.getById<T>(resourceName, resourceId);
  }

  public async deleteById<T extends Partial<DTOModels>>(resourceName: DTOName, resource: { id: string, lastChanged: number }): Promise<undefined> {
    return this._client.deleteById<T>(resourceName, resource);
  }

  /**
   * Creating Objects
   * @param resourceName DTOName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._client.post<T>(resourceName, resource);
  }

  /**
   * Updating Existing Objects
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async put<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._client.put<T>(resourceName, resource);
  }

  /**
   * Updating Existing Objects
   * should contain in the body the entire updated resource
   * @param resourceName resourceName
   * @param resource should contain in the body the [FIELDS THAT YOU WANT TO UPDATE]
   * @returns Promise<ClientResponse<DTO>>
   */
  public async patch<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._client.patch<T>(resourceName, resource);
  }


  /**
   * Batch request with transational support
   * requests will be executed in oder of the actions array.
   * Example:
   * ```typescript
   *  const actions = [ 
   *    new CreateAction('ServiceCall', { ... }), 
   *    new UpdateAction('ServiceCall', { id, lastChanged ... }),
   *    new DeleteAction('ServiceCall', { id, lastChanged ... }) 
   *  ];
   *  await client.batch(actions)
   * ```
   * @param actions BatchAction | CreateAction | UpdateAction | DeleteAction
   * @returns Promise<BatchResponseJson<T>[]>
   */
  public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
    return this._client.batch<T>(actions);
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
