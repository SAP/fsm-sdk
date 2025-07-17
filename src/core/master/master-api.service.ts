import { OAuthService } from "../oauth/oauth.service";
import { ClientConfig } from "../client-config.model";
import { HttpService } from "../http/http-service";
import { RequestOptionsFactory } from "../request-options.factory";

export type CompanyResponse = {
    id: number;
    name: string;
    accountId: number;
    accountName: string;
    dataCloudId: number;
    companyStatus: 'OK';
    description: string | null;
    strictEncryptionPolicy: boolean;
}

export class MasterAPIService {
    private http: HttpService;

    constructor(private _config: Readonly<ClientConfig>, private _auth: Readonly<OAuthService>) {
        this.http = new HttpService(_config)
    }

    async getCompanies(accountId: number): Promise<CompanyResponse[]> {
        const token = await this._auth.ensureToken(this._config);
        return await this.http.request<CompanyResponse[]>(`${this._config.baseUrl}/api/master/v1/accounts/${accountId}/companies`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config)
            },
        }) as CompanyResponse[]
    }


    async getAccounts(): Promise<{ id: number, name: string }[]> {
        const token = await this._auth.ensureToken(this._config);
        return await this.http.request(`${this._config.baseUrl}/api/master/v1/accounts`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                ...RequestOptionsFactory.getRequestHeaders(token, this._config)
            },
        }) as { id: number, name: string }[]
    }

}