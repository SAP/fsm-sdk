import { toBase64, URLSearchParams } from '../polyfills';
import { ClientConfig } from './client-config.model';
import { HttpService } from './http-service';
import { OauthTokenResponse } from './oauth-token-response.model';
import { RequestOptionsFacory } from './request-options.facory';

export class AuthService {
    private _token: OauthTokenResponse | undefined;

    constructor(private _http: Readonly<HttpService>) { }

    private async _fetchAndSaveToken(config: Readonly<ClientConfig>) {
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
                ...RequestOptionsFacory.getRequestXHeaders(config)
            },
            body: body.toString()
        });

        if (config.debug && config.tokenCacheFilePath) {
            try {
                const fs = require('fs'); // inline import for isomorphic
                fs.writeFileSync(config.tokenCacheFilePath, JSON.stringify(response));
            } catch (error) {
                console.error(`ERROR: could not create ${config.tokenCacheFilePath}`, error);
            }
        }

        return typeof response === 'string' ? JSON.parse(response) : response;
    }

    private async _readToken(config: Readonly<ClientConfig>): Promise<OauthTokenResponse> {
        try {
            return await new Promise<OauthTokenResponse>((resolve, fail) => {
                if (config.debug && config.tokenCacheFilePath) {
                    const path = require('path');
                    return resolve(require(path.resolve(config.tokenCacheFilePath)));
                }
                fail({ code: 'MODULE_NOT_FOUND' });
            });
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                return await this._fetchAndSaveToken(config);
            }
            throw error;
        }
    }

    public async ensureToken(config: Readonly<ClientConfig>): Promise<OauthTokenResponse> {

        const tokenPromise = this._token
            ? Promise.resolve(this._token)
            : this._readToken(config)
                .then(token => this.setToken(token).getToken() as OauthTokenResponse);


        return tokenPromise;
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