import { ClientConfig } from './client-config.model';
import { ErrorResponse, HttpRequestOptions, HttpResponse } from './error-response.model';
import { fetch } from '../polyfills';

export class HttpService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _logger: { log: Function } = console
    ) { }

    public request<T>(uri: string, options: HttpRequestOptions): Promise<T | string | null> {

        if (this._config.debug) {
            this._logger.log(`[httpRequest] outgoing ${uri} options[${JSON.stringify(options, null, 2)}]`);
        }

        return fetch(uri, options)
            .then(async (response: HttpResponse) => {

                const contentType = response.headers.get('content-type');
                const isJson = contentType && contentType.includes('application/json');

                const content: T | string | null = await (!!response.json && !!response.text
                    ? isJson
                        ? response.json<T>()
                        : response.text()
                    : Promise.resolve(null)
                );

                if (!response.ok && [304, 302].indexOf(response.status || -1) === -1) {
                    throw <ErrorResponse<any, HttpRequestOptions>>{
                        statusCode: response.status,
                        message: response.statusText,
                        error: content,
                        response: response,
                        options: options
                    };
                }

                if (this._config.debug) {
                    this._logger.log(`[httpRequest] incoming going options[${JSON.stringify(options, null, 2)}] response[${JSON.stringify(content, null, 2)}]`);
                }

                return content as T;
            });
    }
}