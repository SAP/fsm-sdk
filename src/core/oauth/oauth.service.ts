import { toBase64, URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthResponse } from './oauth-response.model';
import { RequestOptionsFactory } from '../request-options.factory';

export class AuthService {
    private _token: OAuthResponse | undefined;
    private _tokenExpiration: Date | undefined;

    constructor(
        private _http: Readonly<HttpService>,
        private _logger: { error: Function } = console
    ) { }

    private async _fetchAndSaveToken(config: Readonly<ClientConfig>): Promise<OAuthResponse> {
        const body = new URLSearchParams({
            grant_type: config.authGrantType,
            ...(config.authGrantType === 'password'
                ? {
                    username: `${config.authAccountName}/${config.authUserName}`,
                    password: config.authPassword
                }
                : {}
            )
        });

        const response = await this._http.request<string>(`${config.oauthEndpoint}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Basic ${toBase64(`${config.clientIdentifier}:${config.clientSecret}`)}`,
                ...RequestOptionsFactory.getRequestXHeaders(config)
            },
            body: body.toString()
        });

        if (config.debug && config.tokenCacheFilePath) {
            try {
                const fs = require('fs'); // inline import for isomorphic
                fs.writeFileSync(config.tokenCacheFilePath, JSON.stringify(response));
            } catch (error) {
                this._logger.error(`ERROR: could not create ${config.tokenCacheFilePath}`, error);
            }
        }

        const token: OAuthResponse = typeof response === 'string' ? JSON.parse(response) : response;

        return token;
    }

    private async _readToken(config: Readonly<ClientConfig>): Promise<OAuthResponse> {
        try {
            return await new Promise<OAuthResponse>((resolve, fail) => {
                if (config.debug && config.tokenCacheFilePath) {
                    const path = require('path');
                    const token = require(path.resolve(config.tokenCacheFilePath));
                    return resolve(token);
                }
                fail({ code: 'MODULE_NOT_FOUND' });
            });
        } catch (error) {
            if ((error as any).code === 'MODULE_NOT_FOUND') {
                return await this._fetchAndSaveToken(config);
            }
            throw error;
        }
    }

    public async ensureToken(config: Readonly<ClientConfig>): Promise<OAuthResponse> {
        return this._token && this._tokenExpiration && (new Date() < this._tokenExpiration)
            ? Promise.resolve(this._token)
            : this._readToken(config)
                .then(token => this.setToken(token).getToken() as OAuthResponse);
    }

    public getToken(): Readonly<OAuthResponse> | undefined {
        return this._token;
    }

    public setToken(token: OAuthResponse): AuthService {

        if (!token || !token.account) {
            throw new Error('invalid token');
        }

        this._token = token;
        this._tokenExpiration = new Date(new Date().getTime() + token.expires_in * 1000);

        return this;
    }

}