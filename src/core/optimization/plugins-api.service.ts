import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { OptimizationPluginListResponse } from './optimization.model';

/**
 * Service for managing Optimization Policies (Plugins).
 * Provides access to optimization policy configurations.
 */
export class PluginsAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for optimization plugins operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v1/plugins${path ? '/' + path : ''}`;
  }

  /**
   * Retrieves a list of optimization policies (plugins) for the account or company.
   * 
   * @param {object} options Optional parameters for pagination.
   * @param {number} options.page Page number (default: 0).
   * @param {number} options.size Page size (default: 20).
   * @returns {Promise<OptimizationPluginListResponse | null>} Promise resolving to a list of optimization plugins.
   * 
   * @example
   * ```typescript
   * const plugins = await client.optimizationAPI.plugins.list();
   * console.log(plugins.results);
   * ```
   */
  public async list(options?: { page?: number; size?: number }): Promise<OptimizationPluginListResponse | null> {
    const token = await this._auth.ensureToken(this._config);
    const queryString = options ? `?${new URLSearchParams(options as any)}` : '';

    return this._http.request<OptimizationPluginListResponse>(this.getApiUrl() + queryString, {
      method: 'GET',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
    });
  }

}
