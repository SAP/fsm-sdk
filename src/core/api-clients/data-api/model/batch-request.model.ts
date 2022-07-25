import { BatchAction } from './batch-action.model';
import { ClientConfig } from '../../../config/client-config.model';
import { OAuthResponse } from '../../oauth-api/oauth-response.model';
import { RequestOptionsFactory } from '../../../request-options.factory';
import { DataApiClient } from '../data-api.client';

export class BatchRequest {

  constructor(
    private _token: OAuthResponse,
    private _config: ClientConfig,
    private _actions: BatchAction[]) {
  }

  public static stringify(o: { [key: string]: any }): string {
    return Object.keys(o).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(o[key])}`).join('&');
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
        DataApiClient.getDataApiUriFor(this._token, action.dtoName, (action.method !== 'POST' ? action.dtoData.id : undefined)),
        '?',
        BatchRequest.stringify({
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