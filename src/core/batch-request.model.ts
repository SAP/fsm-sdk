import { BatchAction } from './batch-action.model';
import { ClientConfig } from './client-config.model';
import { OauthTokenResponse } from './oauth-token-response.model';
import { RequestOptionsFactory } from './request-options.factory';

export class BatchRequest {

  constructor(
    private _token: OauthTokenResponse,
    private _config: ClientConfig,
    private _actions: BatchAction[]) {
  }

  public toString() {
    const body = this._actions.map((action, idx) => {
      let bodyPart: string = '';
      bodyPart += '--======boundary======\n';
      bodyPart += 'Content-Type: application/http\n';
      bodyPart += 'Content-ID: req' + idx + '\n';
      bodyPart += '\n';
      bodyPart += [
        action.method.toUpperCase(),
        ' ',
        RequestOptionsFactory.getDataApiUriFor(this._token, action.dtoName, (action.method !== 'POST' ? action.dtoData.id : undefined)),
        '?',
        RequestOptionsFactory.stringify({
          clientIdentifier: this._config.clientIdentifier,

          ...RequestOptionsFactory.getRequestAccountQueryParams(this._token, this._config),

          ...(action.method !== 'DELETE' && { dtos: RequestOptionsFactory.getDTOVersionsString([action.dtoName]) }),
          ...(action.force && action.method !== 'DELETE' && { forceUpdate: 'true' }),
          ...(action.force && action.method === 'DELETE' && { forceDelete: 'true' }),
          ...(action.method === 'DELETE' && !!action.dtoData && !!action.dtoData.lastChanged && { lastChanged: action.dtoData.lastChanged }),
        }),
        ' ',
        'HTTP/1.1\n'
      ].join('');
      bodyPart += 'Content-Type: application/json\n';
      bodyPart += '\n';
      bodyPart += JSON.stringify(action.dtoData);
      bodyPart += '\n\n';
      return bodyPart;
    }).join('\n');

    return body;
  }
}