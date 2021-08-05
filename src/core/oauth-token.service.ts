import { toBase64, URLSearchParams } from '../polyfills';
import { ClientConfig } from './client-config.model';
import { HttpService } from './http-service';
import { OauthTokenResponse } from './oauth-token-response.model';
import { RequestOptionsFacory } from './request-options.facory';

export class AuthService {
    private _token: OauthTokenResponse | undefined;

    constructor(private _http: Readonly<HttpService>, private _config: Readonly<ClientConfig>) { }

    private async _fetchAndSaveToken() {
        const body = new URLSearchParams({
            grant_type: this._config.authGrantType,
            ...(this._config.authGrantType === 'password'
                ? {
                    username: `${this._config.authAccountName}/${this._config.authUserName}`,
                    password: this._config.authPassword
                }
                : {}
            )
        });

        const response = await this._http.request<string>(`${this._config.oauthEndpoint}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Basic ${toBase64(`${this._config.clientIdentifier}:${this._config.clientSecret}`)}`,
                ...RequestOptionsFacory.getRequestXHeaders(this._config)
            },
            body: body.toString()
        });

        if (this._config.debug && this._config.tokenCacheFilePath) {
            try {
                const fs = require('fs'); // inline import for isomorphic
                fs.writeFileSync(this._config.tokenCacheFilePath, JSON.stringify(response));
            } catch (error) {
                console.error(`ERROR: could not create ${this._config.tokenCacheFilePath}`, error);
            }
        }

        return typeof response === 'string' ? JSON.parse(response) : response;
    }

    private async _readToken(): Promise<OauthTokenResponse> {
        try {
            return await new Promise<OauthTokenResponse>((resolve, fail) => {
                if (this._config.debug && this._config.tokenCacheFilePath) {
                    const path = require('path');
                    return resolve(require(path.resolve(this._config.tokenCacheFilePath)));
                }
                fail({ code: 'MODULE_NOT_FOUND' });
            });
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                return await this._fetchAndSaveToken();
            }
            throw error;
        }
    }

    public ensureToken(): Promise<OauthTokenResponse> {
        return this._token
            ? Promise.resolve(this._token)
            : this._readToken()
                .then(token => this.setToken(token).getToken() as OauthTokenResponse);
    }

    public getToken(): Readonly<OauthTokenResponse> | undefined {
        return this._token;
    }

    public setToken(token: OauthTokenResponse): AuthService {

        if (!token || !token.account) {
            throw new Error('invalid token');
        }

        this._token = token;
        return this;
    }

}