import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { ProcessedJobListResponse } from './optimization.model';

/**
 * Service for processed jobs operations.
 * Provides access to jobs processed by optimization tasks.
 */
export class ProcessedJobsAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for processed jobs operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v1/processed-jobs${path ? '/' + path : ''}`;
  }

  /**
   * Retrieves a list of jobs related to an optimization task.
   * 
   * Provides a ranked list of processed jobs for a given task ID (or last task ID if query does not contain it).
   * Processed jobs are related to the activity IDs sent to the optimization task.
   * Values for assignmentChangeCategory will be from: 'assigned', 'reassigned', 'unchanged', 'unassigned'.
   * 
   * @param {object} params - Optional query parameters.
   * @param {string} params.taskId - Filter by task ID.
   * @param {number} params.page - Page number for pagination.
   * @param {number} params.size - Page size for pagination.
   * @param {string} params.sort - Sort field and order.
   * @returns {Promise<ProcessedJobListResponse | null>} Promise resolving to paginated processed jobs.
   * 
   * @example
   * ```typescript
   * const jobs = await client.optimizationAPI.processedJobs.list({
   *   taskId: 'task-uuid',
   *   page: 0,
   *   size: 50
   * });
   * ```
   */
  public async list(params?: Partial<{
    taskId: string;
    page: number;
    size: number;
    sort: string;
  }>): Promise<ProcessedJobListResponse | null> {
    const token = await this._auth.ensureToken(this._config);
    const queryString = params ? `?${new URLSearchParams(params as any)}` : '';

    return this._http.request<ProcessedJobListResponse>(this.getApiUrl() + queryString, {
      method: 'GET',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
    });
  }

}
