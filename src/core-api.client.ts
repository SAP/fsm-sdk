import { fetch, toBase64, URLSearchParams } from './polyfills';
import { DTOName, DTOModels } from './core/dto-name.model';
import { ClientConfig } from './core/client-config.model';
import { OauthTokenResponse } from './core/oauth-token-response.model';
import { ClientResponse } from './core/client-response.model';
import { BatchAction } from './core/batch-action.model';
import { RequestOptionsFacory } from './core/request-options.facory';
import { BatchRequest } from './core/batch-request.model';
import { BatchResponse, BatchResponseJson } from './core/batch-response';
import { ErrorResponse, HttpRequestOptions, HttpResponse } from './core/error-response.model';

export class CoreAPIClient {

  private _token: OauthTokenResponse | undefined;
  private _tokenExpiration: Date | undefined;

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
   * @returns CoreAPIClient
   */
  constructor(config: ClientConfig) {
    this._config = Object.assign(this._config, config);
  }

  private async _fetchAndSaveToken() {
    const body = new URLSearchParams({
      grant_type: this._config.authGrantType,
      ...(this._config.authGrantType === 'password'
        ? {
          username: `${this._config.authAccountName}/${this._config.authUserName}`,
          password: this._config.authPassword
        }
        : {}
      )
    });

    const response = await this._request<string>(`${this._config.oauthEndpoint}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${toBase64(`${this._config.clientIdentifier}:${this._config.clientSecret}`)}`,
        ...RequestOptionsFacory.getRequestXHeaders(this._config)
      },
      body: body.toString()
    });

    if (this._config.debug && this._config.tokenCacheFilePath) {
      try {
        const fs = require('fs'); // inline import for isomorphic
        fs.writeFileSync(this._config.tokenCacheFilePath, JSON.stringify(response));
      } catch (error) {
        console.error(`ERROR: could not create ${this._config.tokenCacheFilePath}`, error);
      }
    }

    return typeof response === 'string' ? JSON.parse(response) : response;
  }

  private async _readToken(): Promise<OauthTokenResponse> {
    try {
      return await new Promise<OauthTokenResponse>((resolve, fail) => {
        if (this._config.debug && this._config.tokenCacheFilePath) {
          const path = require('path');
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
    return this._token && this._tokenExpiration && (new Date() < this._tokenExpiration)
      ? Promise.resolve(this._token)
      : this._readToken()
        .then(token => this.setToken(token).getToken() as OauthTokenResponse);
  }

  private _request<T>(uri: string, options: HttpRequestOptions): Promise<T | string | null> {
    if (this._config.debug) {
      console.log(`[httpRequest] outgoing ${uri} options[${JSON.stringify(options, null, 2)}]`);
    }
    return fetch(uri, options)
      .then(async (response: HttpResponse) => {

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        const content: T | string | null = await (!!response.json && !!response.text
          ? isJson
            ? response.json<T>()
            : response.text()
          : Promise.resolve(null)
        );

        if (!response.ok && [304, 302].indexOf(response.status || -1) === -1) {
          throw <ErrorResponse<any, HttpRequestOptions>>{
            statusCode: response.status,
            message: response.statusText,
            error: content,
            response: response,
            options: options
          };
        }

        if (this._config.debug) {
          console.log(`[httpRequest] incoming going options[${JSON.stringify(options, null, 2)}] response[${JSON.stringify(content, null, 2)}]`);
        }

        return content as T;
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

    const params = new URLSearchParams(Object.assign({},
      RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
      method !== 'DELETE' ? { dtos: RequestOptionsFacory.getDTOVersionsString([dtoName]) } : undefined,
      additionalQs) as { [key: string]: string });

    return await this._request<T>(
      `${RequestOptionsFacory.getDataApiUriFor(token, dtoName, dtoId)}?${params}`,
      {
        method,
        headers: RequestOptionsFacory.getRequestHeaders(token, this._config),
        body: method != 'GET' ? JSON.stringify(dtoData) : undefined
      });
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
    const token = await this._ensureToken();
    const params = new URLSearchParams({
      ...RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
      dtos: RequestOptionsFacory.getDTOVersionsString(dtoNames)
    });
    return await this._request(`${token.cluster_url}/api/query/v1?${params}`,
      {
        method: 'POST',
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          RequestOptionsFacory.getRequestHeaders(token, this._config)
        ),
        body: JSON.stringify({ query: coreSQL })
      }) as { data: T[] };
  }

  /**
   * Retrieving Lists of Objects
   * @param resourceName DTOName 
   * @param resourceId uuid as string
   * @returns Promise<ClientResponse<DTO>>
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
   * @param resourceName DTOName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
   */
  public async post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._requestDataApi('POST', resourceName, resource) as Promise<ClientResponse<T>>;
  }

  /**
   * Updating Existing Objects
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   * @returns Promise<ClientResponse<DTO>>
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
   * @returns Promise<ClientResponse<DTO>>
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
   * @returns Promise<BatchResponseJson<T>[]>
   */
  public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
    const token = await this._ensureToken();
    const body = new BatchRequest(token, this._config, actions).toString();

    const params = new URLSearchParams(Object.assign({
      clientIdentifier: this._config.clientIdentifier,
      dtos: RequestOptionsFacory.getDTOVersionsString(actions.map(it => it.dtoName)),
      ...RequestOptionsFacory.getRequestAccountQueryParams(token, this._config),
    }));

    const responseBody = await this._request<string>(`${token.cluster_url}/api/data/batch/v1?${params}`, {
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


  /**
   * get OauthTokenResponse
   * @returns Readonly<OauthTokenResponse> | undefined
   */
  public getToken(): Readonly<OauthTokenResponse> | undefined {
    return this._token;
  }

  /**
   * set OauthTokenResponse
   * @param token OauthTokenResponse
   * @returns CoreAPIClient
   */
  public setToken(token: OauthTokenResponse): CoreAPIClient {

    if (!token || !token.account) {
      throw new Error('invalid token');
    }

    this._token = token;
    this._tokenExpiration = new Date(new Date().getTime() + token.expires_in * 1000);

    return this;
  }

}
