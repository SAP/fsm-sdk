import { URLSearchParams } from '../../polyfills';
import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { RequestOptionsFactory } from '../request-options.factory';
import { LabelTranslationDto, PageDto, ValueTranslationDataDto, ValueTranslationDto } from './translations.model';

type RSQLFilter = string; // e.g. 'language eq "en"' // https://github.com/perplexhub/rsql-jpa-specification?tab=readme-ov-file#rsql-syntax-reference
type RSQLSorter = string; // e.g. 'key,asc'


export class TranslationApiService {

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) { }

    // https://api.sap.com/api/cloud_translation_service_ext/overview
    private getApiUrl(path: string): string {
        return `${this._config.baseUrl}/cloud-translation-service/api/v1/translations/${path}`;
    }


    public async getLabels(params?: Partial<{ filter: RSQLFilter, size: number, page: number, sort: RSQLSorter }>) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<PageDto<LabelTranslationDto>>(this.getApiUrl(`labels` + (params ? `?${new URLSearchParams(params)}` : '')), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }

    public async postLabel(data: Partial<LabelTranslationDto>) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<LabelTranslationDto>(this.getApiUrl('labels'), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        })
    }

    public async putLabel(data: Partial<LabelTranslationDto>) {
        if (!data.id)
            throw new Error('id is required for update');

        const token = await this._auth.ensureToken(this._config)
        return this._http.request<LabelTranslationDto>(this.getApiUrl(`labels/${data.id}`), {
            method: 'PUT',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        })
    }

    public async deleteLabel(id: string) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<''>(this.getApiUrl(`labels/${id}`), {
            method: 'DELETE',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }


    public async getValues(params?: Partial<{ filter: RSQLFilter, size: number, page: number, sort: RSQLSorter }>) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<PageDto<ValueTranslationDto<ValueTranslationDataDto>>>(this.getApiUrl(`values` + (params ? `?${new URLSearchParams(params)}` : '')), {
            method: 'GET',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        })
    }

    public async postValue(data: Partial<ValueTranslationDto<Partial<ValueTranslationDataDto>>>) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ValueTranslationDto<ValueTranslationDataDto>>(this.getApiUrl('values'), {
            method: 'POST',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        })
    }


    public async putValue(data: Partial<ValueTranslationDto<Partial<ValueTranslationDataDto>>>) {
        if (!data.id)
            throw new Error('id is required for update');

        const token = await this._auth.ensureToken(this._config)
        return this._http.request<ValueTranslationDto<ValueTranslationDataDto>>(this.getApiUrl(`values/${data.id}`), {
            method: 'PUT',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config),
            body: JSON.stringify(data)
        })
    }

    public async deleteValue(id: string) {
        const token = await this._auth.ensureToken(this._config)
        return this._http.request<''>(this.getApiUrl(`values/${id}`), {
            method: 'DELETE',
            headers: RequestOptionsFactory.getRequestHeaders(token, this._config)
        });
    }


}
