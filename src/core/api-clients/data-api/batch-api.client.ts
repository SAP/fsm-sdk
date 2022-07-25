import { URLSearchParams } from '../../../polyfills';
import { AuthService } from '../../oauth/oauth.service';
import { HttpService } from '../../http/http-service';

import { BatchAction } from './model/batch-action.model';
import { BatchRequest } from './model/batch-request.model';
import { BatchResponse, BatchResponseJson } from './model/batch-response';

import { ClientConfig } from '../../client-config.model';
import { DTOModels } from './model/dto-name.model';


import { OAuthResponse } from '../../oauth/oauth-response.model';
import { RequestOptionsFactory } from '../../request-options.factory';

export class BatchApiClient {

    constructor(private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<AuthService>) { }

    private async login(): Promise<OAuthResponse> {
        return await this._auth.ensureToken(this._config);
    }

    public async batch<T extends DTOModels>(actions: BatchAction[]): Promise<BatchResponseJson<T>[]> {
        const token = await this.login();
        const body = new BatchRequest(token, this._config, actions).toString();

        const queryParams = new URLSearchParams(Object.assign({
            clientIdentifier: this._config.clientIdentifier,
            dtos: RequestOptionsFactory.getDTOVersionsString(actions.map(it => it.dtoName)),
            ...RequestOptionsFactory.getRequestAccountQueryParams(token, this._config),
        }));

        const responseBody = await this._http.request<string>(`${token.cluster_url}/api/data/batch/v1?${queryParams}`, {
            method: 'POST',
            headers: {
                'content-type': 'multipart/mixed;boundary="======boundary======"',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config),
            },
            body
        });

        return responseBody !== null
            ? new BatchResponse<T>(responseBody).toJson()
            : [];
    }
}