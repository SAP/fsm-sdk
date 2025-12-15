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


    /*
    public async cancelConfirmation(
        activities: Array<Partial<{
            activityIds: UnifiedIdentifier,
            id: UnifiedIdentifier,
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
        return this._http.request(this.getApiUrl(`actions/cancel/confirmation${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async close(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/close${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async parallelGroup(
        activities: Array<{ activityId: UnifiedIdentifier }>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/parallel-group${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify({ activities })
        });
    }

    public async release(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/release${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async replan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            crew: string,
            technician: UnifiedIdentifier,
            startDateTime: string,
            startDateTimeFixed: boolean,
            plannedDurationInMinutes: number,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number,
            endDateTime: string,
            endDateTimeFixed: boolean,
            team: string,
            unit: string,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/replan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async reschedule(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            startDateTime: string,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/reschedule${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async sequentialGroup(
        activities: Array<{ activityId: UnifiedIdentifier }>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/sequential-group${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify({ activities })
        });
    }

    public async teamsPlan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            team: string,
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
        return this._http.request(this.getApiUrl(`actions/teams/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async teamsReplan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            team: string,
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
        return this._http.request(this.getApiUrl(`actions/teams/replan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async travel(
        items: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            travelTimeFromInMinutes: number,
            travelTimeToInMinutes: number
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/travel${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify({ items })
        });
    }

    public async unassign(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            id: UnifiedIdentifier,
            udfValues: UdfValue[]
        }>>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/unassign${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async ungroup(
        activities: Array<{ activityId: UnifiedIdentifier }>,
        params: Partial<{
            fieldsMode: 'INCLUDE' | 'EXCLUDE' | 'ADD',
            fields: string
        }> = {}
    ) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request(this.getApiUrl(`actions/ungroup${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async unitsTeamPlan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            unit: string,
            team: string,
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
        return this._http.request(this.getApiUrl(`actions/units/team/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async unitsTechnicianPlan(
        activities: Array<Partial<{
            activityId: UnifiedIdentifier,
            unit: string,
            technician: UnifiedIdentifier,
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
        return this._http.request(this.getApiUrl(`actions/units/technician/plan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }

    public async unitsTechnicianReplan(
        activities: Array<Partial<{
            unit: string,
            technician: UnifiedIdentifier,
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
        return this._http.request(this.getApiUrl(`actions/units/technician/replan${(Object.keys(params || {}).length ? `?${new URLSearchParams(params as any)}` : '')}`), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(activities)
        });
    }
    */
}