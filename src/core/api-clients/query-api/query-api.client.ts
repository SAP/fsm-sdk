import { URLSearchParams } from '../../../polyfills';
import { AuthService } from '../../oauth/oauth.service';
import { ClientConfig } from '../../client-config.model';
import { DTOModels, DTOName } from '../data-api/model/dto-name.model';
import { HttpService } from '../../http/http-service';
import { OAuthResponse } from '../../oauth/oauth-response.model';
import { RequestOptionsFactory } from '../../request-options.factory';

export class QueryApiClient {

    constructor(private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<AuthService>) { }

    private async login(): Promise<OAuthResponse> {
        return await this._auth.ensureToken(this._config);
    }

    public async query<T extends { [projection: string]: DTOModels }>(coreSQL: string, dtoNames: DTOName[]): Promise<{ data: T[] }> {
        const token = await this.login();
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