import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';

export class AttachmentsAPIService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    // https://api.sap.com/api/cloud_attachment_service/resource/Attachment_Download_Service
    private getApiUrl(attachmentId: string): string {
        return `${this._config.baseUrl}/cloud-attachment-service/api/v1/Attachment/${attachmentId}/content`;
    }

    public async downloadContent(attachmentId: string): Promise<string | null> {
        const token = await this._auth.ensureToken(this._config);
        const { Accept: _, ...headers } = RequestOptionsFactory.getRequestHeaders(token, this._config) as { [key: string]: string; }
        return this._http.request<string>(this.getApiUrl(attachmentId), {
            method: 'GET',
            headers: headers
        });
    }

    public async checkExists(attachmentId: string): Promise<string | null> {
        const token = await this._auth.ensureToken(this._config);
        return this._http.request<string>(this.getApiUrl(attachmentId), {
            method: 'HEAD',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }

    public async deleteContent(attachmentId: string): Promise<string | null> {
        const token = await this._auth.ensureToken(this._config);
        return this._http.request<''>(this.getApiUrl(attachmentId), {
            method: 'DELETE',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }

}
