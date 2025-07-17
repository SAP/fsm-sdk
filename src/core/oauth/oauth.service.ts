import { toBase64, URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OauthTokenBase, OauthTokenResponse } from './oauth-token-response.model';
import { RequestOptionsFactory } from '../request-options.factory';

export class OAuthService {
    private _token: OauthTokenResponse | undefined;
    private _tokenExpiration: Date | undefined;

    constructor(
        private _http: Readonly<HttpService>,
        private _logger: { error: Function } = console
    ) { }

    private async _fetchAndSaveToken(config: Readonly<ClientConfig>): Promise<OauthTokenResponse> {
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

        if (config.debug && config.tokenCacheFilePath) {
            try {
                const fs = require('fs'); // inline import for isomorphic
                fs.writeFileSync(config.tokenCacheFilePath, JSON.stringify(response));
            } catch (error) {
                this._logger.error(`ERROR: could not create ${config.tokenCacheFilePath}`, error);
            }
        }

        const token: OauthTokenResponse = typeof response === 'string' ? JSON.parse(response) : response;

        return token;
    }

    private async _readToken(config: Readonly<ClientConfig>): Promise<OauthTokenResponse> {
        try {
            return await new Promise<OauthTokenResponse>((resolve, fail) => {
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

    public async ensureToken(config: Readonly<ClientConfig>): Promise<OauthTokenResponse> {
        return this._token && this._tokenExpiration && (new Date() < this._tokenExpiration)
            ? Promise.resolve(this._token)
            : this._readToken(config)
                .then(token => this.setToken(token).getToken() as OauthTokenResponse);
    }

    public getToken(): Readonly<OauthTokenResponse> | undefined {
        return this._token;
    }

    public setToken(token: OauthTokenResponse): OAuthService {

        const missing = (['access_token', 'expires_in', 'token_type'] as Array<keyof OauthTokenBase>)
            .filter(key => token[key] === undefined || token[key] === null);

        if (missing.length) {
            throw new Error(`Invalid token missing required properties [${missing.join(', ')}]`);
        }

        this._token = token;
        this._tokenExpiration = new Date(new Date().getTime() + token.expires_in * 1000);

        return this;
    }

}