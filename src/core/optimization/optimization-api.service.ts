import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { BestMatchingTechniciansAPI } from './best-matching-technicians-api.service';
import { ExecutionsAPI } from './executions-api.service';
import { JobSlotsAPI } from './job-slots-api.service';
import { PluginsAPI } from './plugins-api.service';
import { ProcessedJobsAPI } from './processed-jobs-api.service';
import { ReOptimizationAPI } from './re-optimization-api.service';
import { TasksAPI } from './tasks-api.service';

/**
 * Main service for accessing SAP Field Service Management Optimization APIs.
 * 
 * These REST endpoints are used for optimization and automated scheduling requests.
 * Optimizes the assignment of technicians to jobs, and the scheduling of jobs to time slots.
 * Provides also operations on optimization tasks and access to optimization outputs.
 * 
 * @see https://api.sap.com/api/dispatchservice_ext/overview
 */
export class OptimizationAPIService {

  public plugins: PluginsAPI;
  public executions: ExecutionsAPI;
  public processedJobs: ProcessedJobsAPI;
  public tasks: TasksAPI;
  public jobSlots: JobSlotsAPI;
  public bestMatchingTechnicians: BestMatchingTechniciansAPI;
  public reOptimization: ReOptimizationAPI;

  constructor(
    private _config: Readonly<ClientConfig>,
    private _http: Readonly<HttpService>,
    private _auth: Readonly<OAuthService>
  ) {
    this.plugins = new PluginsAPI(this._config, this._http, this._auth);
    this.executions = new ExecutionsAPI(this._config, this._http, this._auth);
    this.processedJobs = new ProcessedJobsAPI(this._config, this._http, this._auth);
    this.tasks = new TasksAPI(this._config, this._http, this._auth);
    this.jobSlots = new JobSlotsAPI(this._config, this._http, this._auth);
    this.bestMatchingTechnicians = new BestMatchingTechniciansAPI(this._config, this._http, this._auth);
    this.reOptimization = new ReOptimizationAPI(this._config, this._http, this._auth);
  }

}
