import { URLSearchParams } from '../../../polyfills';
import { ClientConfig } from '../../client-config.model';
import { DataCloudDTOModels, DataCloudDTOName } from '../../dto-name.model';
import { HttpService } from '../../http/http-service';
import { OAuthService } from '../../oauth/oauth.service';
import { RequestOptionsFactory } from '../../request-options.factory';

export class QueryApiService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    public async query<T extends { [projection: string]: DataCloudDTOModels }>(coreSQL: string, dtoNames: DataCloudDTOName[]): Promise<{ data: T[] }> {
        const token = await this._auth.ensureToken(this._config);
        const queryParams = new URLSearchParams({
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
            dtos: RequestOptionsFactory.getDTOVersionsString(dtoNames)
        });
        return await this._http.request(`${this._config.baseUrl}/api/query/v1?${queryParams}`,
            {
                method: 'POST',
                headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
                body: JSON.stringify({ query: coreSQL })
            }) as { data: T[] };
    }

}