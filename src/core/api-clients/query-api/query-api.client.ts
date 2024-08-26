import { URLSearchParams } from '../../../polyfills';
import { OAuthApiClient } from '../oauth-api/oauth-api.client';
import { ClientConfig } from '../../config/client-config.model';
import { DTOModels, DTOName } from '../data-api/model/dto-name.model';
import { HttpService } from '../../http/http-service';
import { RequestOptionsFactory } from '../../request-options.factory';

export class QueryApiClient {

    constructor(private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _oauth: Readonly<OAuthApiClient>) { }

    public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
        const token = await this._oauth.ensureToken(this._config);

        const queryParams = new URLSearchParams({
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
            dtos: RequestOptionsFactory.getDTOVersionsString(dtoNames)
        });

        return await this._http.request(`${token.cluster_url}/api/query/v1?${queryParams}`,
            {
                method: 'POST',
                headers: Object.assign(
                    { 'Content-Type': 'application/json' },
                    RequestOptionsFactory.getRequestHeaders(token, this._config)
                ),
                body: JSON.stringify({ query: coreSQL })
            }) as { data: T[] };
    }
}