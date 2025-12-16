import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { ActivityBulkAPI } from './activity-bulk-api.service';
import { Activity, UdfValue, UnifiedIdentifier } from './service-management.model';


export class ActivityAPI {


    public bulk: ActivityBulkAPI;

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) {
        this.bulk = new ActivityBulkAPI(this._config, this._http, this._auth);
    }

    /**
     * Constructs the API URL for activity bulk operations.
     * 
     * @param {string} path - Path to append to the base URL.
     * @returns {string} The complete API URL.
     * @see https://api.sap.com/api/service_management_ext/resource/Activity_Business_Actions
     */
    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/v2/activities/${path}`; // note: "api/" segment is missing on the routing.
    }

    /**
     * Cancels an activity by its ID.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional cancellation parameters.
     * @param {boolean} options.cancelServiceCallConfirmed - Whether service call cancellation is confirmed.
     * @param {string} options.cancellationReason - Reason for cancellation.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the cancelled activity.
     */
    public async cancel(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            cancelServiceCallConfirmed: boolean,
            cancellationReason: string,
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/cancel${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Closes an activity by its ID.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional closing parameters.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the closed activity.
     */
    public async close(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/close${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Duplicates an activity by its ID.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional duplication parameters.
     * @param {string} options.crew - Crew identifier.
     * @param {string[]} options.responsibles - Array of responsible person identifiers.
     * @param {string} options.startDateTime - Start date and time in ISO 8601 format.
     * @param {string} options.unit - Unit identifier.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the duplicated activity.
     */
    public async duplicate(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            responsibles: string[],
            startDateTime: string,
            unit: string,
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/duplicate${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Plans an activity by its ID.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional planning parameters.
     * @param {string} options.crew - Crew identifier.
     * @param {UnifiedIdentifier} options.technician - Technician identifier.
     * @param {string} options.startDateTime - Start date and time in ISO 8601 format.
     * @param {boolean} options.startDateTimeFixed - Whether start date/time is fixed.
     * @param {number} options.plannedDurationInMinutes - Planned duration in minutes.
     * @param {number} options.travelTimeFromInMinutes - Travel time from in minutes.
     * @param {number} options.travelTimeToInMinutes - Travel time to in minutes.
     * @param {string} options.endDateTime - End date and time in ISO 8601 format.
     * @param {boolean} options.endDateTimeFixed - Whether end date/time is fixed.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the planned activity.
     */
    public async plan(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            technician: UnifiedIdentifier,

            startDateTime: string,
            startDateTimeFixed: boolean,

            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,

            endDateTime: string,
            endDateTimeFixed: boolean,

            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Releases an activity by its ID.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional release parameters.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the released activity.
     */
    public async release(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/release${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Replans an activity to a different technician.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional replanning parameters.
     * @param {string} options.crew - Crew identifier.
     * @param {UnifiedIdentifier} options.technician - New technician identifier.
     * @param {string} options.startDateTime - New start date and time in ISO 8601 format.
     * @param {boolean} options.startDateTimeFixed - Whether start date/time is fixed.
     * @param {number} options.plannedDurationInMinutes - Planned duration in minutes.
     * @param {number} options.travelTimeFromInMinutes - Travel time from in minutes.
     * @param {number} options.travelTimeToInMinutes - Travel time to in minutes.
     * @param {string} options.endDateTime - End date and time in ISO 8601 format.
     * @param {boolean} options.endDateTimeFixed - Whether end date/time is fixed.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the replanned activity.
     */
    public async replan(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            technician: UnifiedIdentifier,

            startDateTime: string,
            startDateTimeFixed: boolean,

            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,

            endDateTime: string,
            endDateTimeFixed: boolean,

            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/replan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

    /**
     * Reschedules an activity to a different time slot and/or technician.
     * 
     * @param {string} id - Activity ID (also supports code=$ or externalId=$ format).
     * @param {object} options - Optional rescheduling parameters.
     * @param {string} options.crew - Crew identifier.
     * @param {UnifiedIdentifier} options.technician - New technician identifier.
     * @param {string} options.startDateTime - New start date and time in ISO 8601 format.
     * @param {boolean} options.startDateTimeFixed - Whether start date/time is fixed.
     * @param {number} options.plannedDurationInMinutes - Planned duration in minutes.
     * @param {number} options.travelTimeFromInMinutes - Travel time from in minutes.
     * @param {number} options.travelTimeToInMinutes - Travel time to in minutes.
     * @param {string} options.endDateTime - End date and time in ISO 8601 format.
     * @param {boolean} options.endDateTimeFixed - Whether end date/time is fixed.
     * @param {UdfValue[]} options.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string[]} params.fields - Fields to include/exclude/add.
     * @returns {Promise<{ activity: Activity }>} A promise resolving to the rescheduled activity.
     */
    public async reschedule(
        id: string, // also support code=$ or externalId=$,
        options: Partial<{
            crew: string,
            technician: UnifiedIdentifier,

            startDateTime: string,
            startDateTimeFixed: boolean,

            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,

            endDateTime: string,
            endDateTimeFixed: boolean,

            udfValues: UdfValue[]
        }> = {},
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string[]
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<{ activity: Activity }>(this.getApiUrl(`${id}/actions/reschedule${(Object.keys(params || {}).length ? `?${new URLSearchParams(params)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(options)
        }) as Promise<{ activity: Activity }>;

    }

}
