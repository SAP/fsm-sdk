import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { Activity, UdfValue, UnifiedIdentifier } from './service-management.model';


export type BulkResponse<T> = {
    hasErrors: boolean,
    results: Array<T & Partial<{
        status: number,
        id: string,
        error: { type: string, title: string, detail: string }
    }>>

}


export class ActivityBulkAPI {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    public getApiUrl(path: string = ''): string {
        return `${this._config.baseUrl}/service-management/v2/bulk/activities/${path}`;
    }

    /**
     * Cancels multiple activities in bulk.
     * 
     * @param {Array} activities - Array of activity objects to cancel.
     * @param {UnifiedIdentifier | string} activities[].activityId - Activity identifier.
     * @param {UnifiedIdentifier | string} activities[].id - Alternative activity identifier.
     * @param {boolean} activities[].cancelServiceCallConfirmed - Whether service call cancellation is confirmed.
     * @param {string} activities[].cancellationReason - Reason for cancellation.
     * @param {UdfValue[]} activities[].udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string} params.fields - Comma-separated list of fields.
     * @returns {Promise<BulkResponse<{ newActivity: Activity }>>} A promise resolving to bulk operation response.
     */
    public async cancel(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier | string,
            id: UnifiedIdentifier | string,
            cancelServiceCallConfirmed: boolean,
            cancellationReason: string,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/cancel${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        }) as Promise<BulkResponse<{ newActivity: Activity }>>;
    }

    /**
     * Duplicates multiple activities in bulk.
     * 
     * @param {Array} activities - Array of activity objects to duplicate.
     * @param {UnifiedIdentifier | string} activities[].activityId - Activity identifier.
     * @param {UnifiedIdentifier | string} activities[].id - Alternative activity identifier.
     * @param {object} activities[].duplicateActivityRequest - Duplication request parameters.
     * @param {string} activities[].duplicateActivityRequest.crew - Crew identifier.
     * @param {string[]} activities[].duplicateActivityRequest.responsibles - Array of responsible persons.
     * @param {string} activities[].duplicateActivityRequest.startDateTime - Start date/time in ISO 8601 format.
     * @param {string} activities[].duplicateActivityRequest.unit - Unit identifier.
     * @param {UdfValue[]} activities[].duplicateActivityRequest.udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string} params.fields - Comma-separated list of fields.
     * @returns {Promise<BulkResponse<{ newActivity: Activity }>>} A promise resolving to bulk operation response.
     */
    public async duplicate(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier | string,
            id: UnifiedIdentifier | string,
            duplicateActivityRequest: Partial<{
                crew: string,
                responsibles: string[],
                startDateTime: string,
                unit: string,
                udfValues: UdfValue[]
            }>
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/duplicate${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        }) as Promise<BulkResponse<{ newActivity: Activity }>>;
    }

    /**
     * Plans multiple activities in bulk.
     * 
     * @param {Array} activities - Array of activity objects to plan.
     * @param {UnifiedIdentifier | string} activities[].activityId - Activity identifier.
     * @param {UnifiedIdentifier | string} activities[].id - Alternative activity identifier.
     * @param {string} activities[].crew - Crew identifier.
     * @param {UnifiedIdentifier | string} activities[].technician - Technician identifier.
     * @param {string} activities[].startDateTime - Start date/time in ISO 8601 format.
     * @param {boolean} activities[].startDateTimeFixed - Whether start date/time is fixed.
     * @param {number} activities[].plannedDurationInMinutes - Planned duration in minutes.
     * @param {number} activities[].travelTimeFromInMinutes - Travel time from in minutes.
     * @param {number} activities[].travelTimeToInMinutes - Travel time to in minutes.
     * @param {string} activities[].endDateTime - End date/time in ISO 8601 format.
     * @param {boolean} activities[].endDateTimeFixed - Whether end date/time is fixed.
     * @param {UdfValue[]} activities[].udfValues - User-defined field values.
     * @param {object} params - Optional query parameters.
     * @param {string} params.fieldsMode - Fields mode: 'INCLUDE', 'EXCLUDE', or 'ADD'.
     * @param {string} params.fields - Comma-separated list of fields.
     * @returns {Promise<BulkResponse<{ newActivity: Activity }>>} A promise resolving to bulk operation response.
     */
    public async plan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier | string,
            id: UnifiedIdentifier | string,
            crew: string,
            technician: UnifiedIdentifier | string,
            startDateTime: string,
            startDateTimeFixed: boolean,
            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,
            endDateTime: string,
            endDateTimeFixed: boolean,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        }) as Promise<BulkResponse<{ newActivity: Activity }>>;
    }

}