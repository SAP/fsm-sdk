import { URLSearchParams } from '../../../polyfills';
import { BatchAction } from './batch-action.model';
import { BatchRequest } from './batch-request.model';
import { BatchResponse, BatchResponseJson } from './batch-response';
import { ClientConfig } from '../../client-config.model';
import { DataCloudDTOModels } from '../dto-name.model';
import { HttpService } from '../../http/http-service';
import { OAuthService } from '../../oauth/oauth.service';
import { RequestOptionsFactory } from '../../request-options.factory';

export class BatchAPIService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    public async batch<T extends DataCloudDTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
        const token = await this._auth.ensureToken(this._config);
        const body = new BatchRequest(token, this._config, actions).toString();

        const queryParams = new URLSearchParams(Object.assign({
            clientIdentifier: this._config.clientIdentifier,
            dtos: RequestOptionsFactory.getDTOVersionsString(actions.map(it => it.dtoName)),
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
        }));

        const responseBody = await this._http.request<string>(`${this._config.baseUrl}/api/data/batch/v1?${queryParams}`, {
            method: 'POST',
            headers: {
                ...RequestOptionsFactory.getRequestHeaders(token, this._config),
                'Content-Type': 'multipart/mixed;boundary="======boundary======"'
            },
            body
        });

        return responseBody !== null
            ? new BatchResponse<T>(responseBody).toJson()
            : [];
    }
} 