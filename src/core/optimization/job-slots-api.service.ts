import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { JobSlotsSearchRequest, JobSlotsSearchResponse } from './optimization.model';

/**
 * Service for job slot search operations.
 * Provides slot finding for booking and scheduling.
 */
export class JobSlotsAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for job slots operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v3/job-slots/actions${path ? '/' + path : ''}`;
  }

  /**
   * Searches for free slots to perform/book a job.
   * 
   * This endpoint can be used to search for a free slot to perform/book a job.
   * Slots may then be used for booking a concrete appointment. This API does NOT
   * auto-reserve, book or block slots in any direct way, results are computed on real time data.
   * 
   * @param {JobSlotsSearchRequest} request - The slot search request with job details and constraints.
   * @returns {Promise<JobSlotsSearchResponse | null>} Promise resolving to available slots.
   * 
   * @example
   * ```typescript
   * const slots = await client.optimizationAPI.jobSlots.search({
   *   activityId: 'ACTIVITY_ID',
   *   slots: [
   *     { start: '2030-08-12T08:00:00Z', end: '2030-08-12T10:00:00Z' }
   *   ],
   *   resources: {
   *     personIds: ['PERSON_ID_1', 'PERSON_ID_2']
   *   },
   *   options: {
   *     maxResults: 10,
   *     defaultDrivingTimeMinutes: 30
   *   },
   *   policy: 'DistanceAndSkills'
   * });
   * ```
   */
  public async search(request: JobSlotsSearchRequest): Promise<JobSlotsSearchResponse | null> {
    const token = await this._auth.ensureToken(this._config);

    return this._http.request<JobSlotsSearchResponse>(this.getApiUrl('search'), {
      method: 'POST',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
      body: JSON.stringify(request)
    });
  }

}
