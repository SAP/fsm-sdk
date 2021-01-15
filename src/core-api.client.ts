import request = require('request-promise-native');
import { v4 as uuid } from 'uuid';

import fs = require('fs');
import path = require('path');

import { DTOName, DTOModels } from './core/dto-name.model';
import { ClientConfig } from './core/client-config.model';
import { OauthTokenResponse } from './core/oauth-token-response.model';
import { ClientResponse } from './core/client-response.model';
import { BatchAction } from './core/batch-action.model';
import { RequestOptionsFacory } from './core/request-options.facory';
import { BatchRequest } from './core/batch-request.model';
import { BatchResponse, BatchResponseJson } from './core/batch-response';

export class CoreAPIClient {

  private _token: OauthTokenResponse | undefined;

  private _config: ClientConfig = {
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
   */
  constructor(config: ClientConfig) {
    this._config = Object.assign(this._config, config);
  }

  private async _fetchAndSaveToken() {
    const basicAuth = Buffer.from(`${this._config.clientIdentifier}:${this._config.clientSecret}`).toString('base64');

    const response = await this._request<string>({
      method: 'POST',
      uri: `${this._config.oauthEndpoint}/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        ...RequestOptionsFacory.getRequestXHeaders(this._config)
      },
      form: {
        grant_type: this._config.authGrantType,
        ...(this._config.authGrantType === 'password'
          ? {
            username: `${this._config.authAccountName}/${this._config.authUserName}`,
            password: this._config.authPassword
          }
          : {}
        )
      }
    });

    if (this._config.debug && this._config.tokenCacheFilePath) {
      fs.writeFileSync(this._config.tokenCacheFilePath, response);
    }

    return JSON.parse(response);
  }

  private async _readToken(): Promise<OauthTokenResponse> {
    try {
      return await new Promise<OauthTokenResponse>((resolve, fail) => {
        if (this._config.debug && this._config.tokenCacheFilePath) {
          return resolve(require(path.resolve(this._config.tokenCacheFilePath)));
        }
        fail({ code: 'MODULE_NOT_FOUND' });
      });
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        return await this._fetchAndSaveToken();
      }
      throw error;
    }
  }

  private _ensureToken(): Promise<OauthTokenResponse> {
    return this._token
      ? Promise.resolve(this._token)
      : this._readToken()
        .then(token => this.setToken(token).getToken() as OauthTokenResponse);
  }

  private _request<T>(opt: request.Options) {
    if (this._config.debug) {
      console.log(`[httpRequest] outgoing options[${JSON.stringify(opt, null, 2)}]`);
    }
    return request(opt)
      .then(response => {
        if (this._config.debug) {
          console.log(`[httpRequest] incoming going options[${JSON.stringify(opt, null, 2)}] response[${JSON.stringify(response, null, 2)}]`);
        }
        return response as T;
      });
  }

  private async _requestDataApi<T extends DTOModels>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    dtoName: DTOName,
    dtoData: T | null | any,
    dtoId: string | null = null,
    additionalQs: { [k: string]: string | number | boolean } = {}
  ) {
    const token = await this._ensureToken();
    return await this._request({
      method,
      uri: RequestOptionsFacory.getDataApiUriFor(token, dtoName, dtoId),
      headers: RequestOptionsFacory.getRequestHeaders(token, this._config),
      qs: Object.assign({},
        RequestOptionsFacory._getRequestAccountQueryParams(token, this._config),
        method !== 'DELETE' ? { dtos: RequestOptionsFacory.getDTOVersionsString([dtoName]) } : undefined,
        additionalQs),
      json: dtoData
    });
  }

  /**
  * returns a uuid that can be used as object id
  */
  public static createUUID(): string {
    return uuid().replace(/\-/g, '').toUpperCase();
  }

  /**
   * Here, you can input and execute the CoreSQL query.
   * @param coreSQL
   * @param dtoNames
   */
  public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
    const token = await this._ensureToken();
    return await this._request(
      {
        method: 'POST',
        uri: `${token.cluster_url}/api/query/v1`,
        headers: RequestOptionsFacory.getRequestHeaders(token, this._config),
        qs: {
          ...RequestOptionsFacory._getRequestAccountQueryParams(token, this._config),
          dtos: RequestOptionsFacory.getDTOVersionsString(dtoNames)
        },
        json: { query: coreSQL }
      }) as { data: T[] };
  }

  /**
   * Retrieving Lists of Objects
   * @param resourceName resourceName
   * @param resourceId uuid
   */
  public async getById<T extends DTOModels>(resourceName: DTOName, resourceId: string): Promise<ClientResponse<T>> {
    const response = await this._requestDataApi('GET', resourceName, null, resourceId);
    return typeof response === 'string' ? JSON.parse(response) : response; // not sending json headers
  }

  public async deleteById<T extends Partial<DTOModels>>(resourceName: DTOName, resource: { id: string, lastChanged: number }): Promise<undefined> {
    const { id, lastChanged } = resource;
    return this._requestDataApi('DELETE', resourceName, null, id, { lastChanged }) as any as Promise<undefined>;
  }

  /**
   * Creating Objects
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   */
  public async post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._requestDataApi('POST', resourceName, resource) as Promise<ClientResponse<T>>;
  }

  /**
   * Updating Existing Objects
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   */
  public async put<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    const { id } = resource;
    return this._requestDataApi('PUT', resourceName, resource, id) as Promise<ClientResponse<T>>;
  }

  /**
   * Updating Existing Objects
   * should contain in the body the entire updated resource
   * @param resourceName resourceName
   * @param resource should contain in the body the [FIELDS THAT YOU WANT TO UPDATE]
   */
  public async patch<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    const { id } = resource;
    return this._requestDataApi('PATCH', resourceName, resource, id) as Promise<ClientResponse<T>>;
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
   */
  public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
    const token = await this._ensureToken();
    const requestBody = new BatchRequest(token, this._config, actions).toString();

    const responseBody = await this._request<string>({
      method: 'POST',
      uri: `${token.cluster_url}/api/data/batch/v1`,
      headers: {
        'content-type': 'multipart/mixed;boundary="======boundary======"',
        ...RequestOptionsFacory.getRequestHeaders(token, this._config),
      },
      qs: Object.assign({
        clientIdentifier: this._config.clientIdentifier,
        dtos: RequestOptionsFacory.getDTOVersionsString(actions.map(it => it.dtoName)),
        ...RequestOptionsFacory._getRequestAccountQueryParams(token, this._config),
      }),
      body: requestBody
    });

    return new BatchResponse<T>(responseBody).toJson();
  }


  /**
   * get OauthTokenResponse
   */
  public getToken(): Readonly<OauthTokenResponse> | undefined {
    return this._token;
  }

  /**
   * set OauthTokenResponse
   * @param token OauthTokenResponse
   */
  public setToken(token: OauthTokenResponse): CoreAPIClient {

    if (!token || !token.account) {
      throw new Error('invalid token');
    }

    this._token = token;
    return this;
  }

}
