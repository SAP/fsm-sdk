import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { ExecutionsFilter, ExecutionsListResponse } from './optimization.model';

/**
 * Service for optimization execution operations.
 * Provides access to execution history and status.
 */
export class ExecutionsAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for optimization executions operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v1/executions${path ? '/' + path : ''}`;
  }

  /**
   * Retrieves a list of optimization executions with optional filtering.
   * 
   * Provides a ranked list of Executions with support for filtering by task, policy, status, and time range.
   * 
   * @param {object} params - Optional query parameters for filtering and pagination.
   * @param {ExecutionsFilter} params.filter - Filter criteria for executions.
   * @param {string} params.search - Search term to filter the executions.
   * @param {number} params.page - Page number for pagination.
   * @param {number} params.size - Page size for pagination.
   * @param {string} params.sort - Sort field and order (e.g., 'enqueuedAt,desc').
   * @returns {Promise<ExecutionsListResponse | null>} Promise resolving to paginated executions.
   * 
   * @example
   * ```typescript
   * const executions = await client.optimizationAPI.executions.list({
   *   filter: {
   *     status: 'SUCCESS',
   *     policyName: 'DistanceAndSkills'
   *   },
   *   page: 0,
   *   size: 20
   * });
   * ```
   */
  public async list(params?: Partial<{
    filter: ExecutionsFilter;
    search: string;
    page: number;
    size: number;
    sort: string;
  }>): Promise<ExecutionsListResponse | null> {
    const token = await this._auth.ensureToken(this._config);
    
    // Convert nested filter object to flat query params
    const queryParams: any = {};
    if (params?.filter) {
      Object.assign(queryParams, params.filter);
    }
    if (params?.search) queryParams.search = params.search;
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;
    if (params?.sort) queryParams.sort = params.sort;

    const queryString = Object.keys(queryParams).length ? `?${new URLSearchParams(queryParams as any)}` : '';

    return this._http.request<ExecutionsListResponse>(this.getApiUrl() + queryString, {
      method: 'GET',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
    });
  }

}
