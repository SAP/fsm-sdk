import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { OptimizationTask, OptimizationTaskCancelRequest } from './optimization.model';

/**
 * Service for optimization task operations.
 * Provides access to task status and cancellation.
 */
export class TasksAPI {

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) { }

  /**
   * Constructs the API URL for optimization tasks operations.
   * 
   * @param {string} path - Path to append to the base URL.
   * @returns {string} The complete API URL.
   */
  private getApiUrl(path: string = ''): string {
    return `${this._config.baseUrl}/optimization/api/v1/tasks${path ? '/' + path : ''}`;
  }

  /**
   * Retrieves information about a specific optimization task.
   * 
   * @param {string} taskId - The UUID of the optimization task.
   * @returns {Promise<OptimizationTask | null>} Promise resolving to the task details.
   * 
   * @example
   * ```typescript
   * const task = await client.optimizationAPI.tasks.get('task-uuid');
   * console.log(task.status);
   * ```
   */
  public async get(taskId: string): Promise<OptimizationTask | null> {
    const token = await this._auth.ensureToken(this._config);

    return this._http.request<OptimizationTask>(this.getApiUrl(taskId), {
      method: 'GET',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
    });
  }

  /**
   * Cancels an ongoing optimization task.
   * 
   * The endpoint allows updating of the task state to CANCELLED.
   * 
   * @param {string} taskId - The UUID of the optimization task to cancel.
   * @param {OptimizationTaskCancelRequest} request - Optional cancellation request with reason.
   * @returns {Promise<void>} Promise resolving when the task is cancelled.
   * 
   * @example
   * ```typescript
   * await client.optimizationAPI.tasks.cancel('task-uuid', {
   *   reason: 'User requested cancellation'
   * });
   * ```
   */
  public async cancel(taskId: string, request?: OptimizationTaskCancelRequest): Promise<void> {
    const token = await this._auth.ensureToken(this._config);

    await this._http.request<void>(this.getApiUrl(`${taskId}/actions/cancel`), {
      method: 'POST',
      headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
      body: JSON.stringify(request || {})
    });
  }

}
