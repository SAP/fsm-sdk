import { OAuthService } from "../oauth/oauth.service";
import { ClientConfig } from "../client-config.model";
import { HttpService } from "../http/http-service";
import { RequestOptionsFactory } from "../request-options.factory";

export type Company = {
    id: number;
    name: string;
    accountId: number;
    accountName: string;
    dataCloudId: number;
    companyStatus: 'OK';
    description: string | null;
    strictEncryptionPolicy: boolean;
}

export type Account = {
    id: number;
    name: string;
};

export class MasterAPIService {
    private http: HttpService;

    constructor(private _config: Readonly<ClientConfig>, private _auth: Readonly<OAuthService>) {
        this.http = new HttpService(_config)
    }

    async getCompaniesByAccount(accountId: number): Promise<Company[]> {
        const token = await this._auth.ensureToken(this._config);
        return await this.http.request<Company[]>(`${this._config.baseUrl}/api/master/v1/accounts/${accountId}/companies`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config)
            },
        }) as Company[]
    }

    async getAccounts(): Promise<Account[]> {
        const token = await this._auth.ensureToken(this._config);
        return await this.http.request(`${this._config.baseUrl}/api/master/v1/accounts`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config)
            },
        }) as Account[]
    }

}