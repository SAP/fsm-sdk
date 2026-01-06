import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { BestMatchingTechniciansRequest, BestMatchingTechniciansResponse } from './optimization.model';

/**
 * Service for best matching technicians operations.
 * Provides ranked technician recommendations for activities.
 */
export class BestMatchingTechniciansAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for best matching technicians operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(jobId: string, path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v2/jobs/${jobId}/best-matching-technicians${path ? '/' + path : ''}`;
  }

  /**
   * Retrieves a ranked list of best matching technicians for a given job (activity or service call).
   * 
   * The Best Matching Technician endpoint enables customers to automatically find the best matching
   * technician for an activity. The process is policy based and creates additional value for the customer
   * through the possibility of customized policy that fit specific business needs.
   * 
   * @param {string} jobId - Activity ID or Service Call ID.
   * @param {BestMatchingTechniciansRequest} request - Request with policy and optional constraints.
   * @returns {Promise<BestMatchingTechniciansResponse | null>} Promise resolving to ranked technicians.
   * 
   * @example
   * ```typescript
   * const technicians = await client.optimizationAPI.bestMatchingTechnicians.find('ACTIVITY_ID', {
   *   policy: 'DistanceAndSkills',
   *   start: '2030-08-12T08:00:00Z',
   *   end: '2030-08-12T18:00:00Z',
   *   schedulingOptions: {
   *     maxResults: 10
   *   }
   * });
   * ```
   */
  public async find(jobId: string, request: BestMatchingTechniciansRequest): Promise<BestMatchingTechniciansResponse | null> {
    const token = await this._auth.ensureToken(this._config);

    return this._http.request<BestMatchingTechniciansResponse>(this.getApiUrl(jobId), {
      method: 'POST',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
      body: JSON.stringify(request)
    });
  }

}
