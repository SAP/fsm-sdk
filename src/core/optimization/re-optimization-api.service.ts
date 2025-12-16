import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { OptimizationRequest, ReOptimizationResponse } from './optimization.model';

/**
 * Service for re-optimization operations.
 * Provides asynchronous rescheduling of assigned activities.
 */
export class ReOptimizationAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for re-optimization operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v1/jobs/actions${path ? '/' + path : ''}`;
  }

  /**
   * Performs re-optimization of activities in an asynchronous way.
   * 
   * The re-optimize endpoint can be used to asynchronously reschedule assigned jobs
   * in an autonomous and optimized manner. The rescheduling makes use of optimization
   * policies (formerly called plugins) which are used to configure the optimization criteria.
   * 
   * @param {OptimizationRequest} request - The re-optimization request with activity IDs and configuration.
   * @returns {Promise<ReOptimizationResponse | null>} Promise resolving to the re-optimization response.
   * 
   * @example
   * ```typescript
   * const result = await client.optimizationAPI.reOptimization.execute({
   *   activityIds: ['ACTIVITY_ID_1', 'ACTIVITY_ID_2'],
   *   optimizationPlugin: 'DistanceAndSkills',
   *   start: '2030-08-12T06:00:00Z',
   *   end: '2030-08-12T18:00:00Z',
   *   simulation: false
   * });
   * ```
   */
  public async execute(request: OptimizationRequest): Promise<ReOptimizationResponse | null> {
    const token = await this._auth.ensureToken(this._config);

    return this._http.request<ReOptimizationResponse>(this.getApiUrl('re-optimize'), {
      method: 'POST',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
      body: JSON.stringify(request)
    });
  }

}
