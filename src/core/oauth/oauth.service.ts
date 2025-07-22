import { toBase64, URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthToken, OAuthTokenResponse } from './oauth-token-response.model';
import { RequestOptionsFactory } from '../request-options.factory';
import { jwtDecode } from 'jwt-decode';

export class OAuthService {
    private _token: OAuthTokenResponse | undefined;
    private _tokenExpiration: Date | undefined;

    constructor(
        private _http: Readonly<HttpService>,
        private _logger: { error: Function } = console
    ) { }

    private async _fetchAndSaveToken(config: Partial<ClientConfig>): Promise<OAuthTokenResponse> {
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

        const tokenEndpoint = config.oauthEndpoint
            ? `${config.oauthEndpoint}/token`
            : `https://${config.baseUrl}/api/oauth2/v2/token`;

        if (config.debug) {
            this._logger.error(`DEBUG: fetching token from ${tokenEndpoint}`);
        }

        const response = await this._http.request<string>(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Basic ${toBase64(`${config.clientIdentifier}:${config.clientSecret}`)}`,
                ...RequestOptionsFactory.getRequestXHeaders(config)
            },
            body: body.toString()
        });

        const token: OAuthToken = typeof response === 'string'
            ? JSON.parse(response)
            : response;

        const content = jwtDecode(token.access_token);

        const tokenResponse: OAuthTokenResponse = {
            ...token,
            content,
            contentType: config.authGrantType === 'password' // what about code?
                ? 'user'
                : 'client'
        };

        if (config.debug && config.tokenCacheFilePath) {
            try {
                const fs = require('fs'); // inline import for isomorphic
                fs.writeFileSync(config.tokenCacheFilePath, JSON.stringify(tokenResponse, null, 2));
            } catch (error) {
                this._logger.error(`ERROR: could not create ${config.tokenCacheFilePath}`, error);
            }
        }

        return tokenResponse;
    }

    private async _readToken(config: Partial<ClientConfig>): Promise<OAuthTokenResponse> {
        try {
            return await new Promise<OAuthTokenResponse>((resolve, fail) => {
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

    public async ensureToken(config: Readonly<ClientConfig>): Promise<OAuthTokenResponse> {
        return this._token && this._tokenExpiration && (new Date() < this._tokenExpiration)
            ? Promise.resolve(this._token)
            : this._readToken(config)
                .then(token => this.setToken(token).getToken() as OAuthTokenResponse);
    }

    public getToken(): Readonly<OAuthTokenResponse> | undefined {
        return this._token;
    }

    public setToken(token: OAuthTokenResponse): OAuthService {

        const missing = (['access_token', 'expires_in', 'token_type'] as Array<keyof OAuthToken>)
            .filter(key => token[key] === undefined || token[key] === null);

        if (missing.length) {
            throw new Error(`Invalid token missing required properties [${missing.join(', ')}]`);
        }

        this._token = token;
        this._tokenExpiration = new Date(new Date().getTime() + token.expires_in * 1000);

        return this;
    }

}