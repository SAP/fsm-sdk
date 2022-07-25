import { ClientConfig } from './client-config.model';

export class ClientConfigService {
    public static getDefault(): ClientConfig {
        return {
            debug: false,

            oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',
            tokenCacheFilePath: undefined,

            clientIdentifier: '<your-clientIdentifier>',
            clientSecret: '<your-clientSecret>',
            clientVersion: '<your-clientVersion>',

            authGrantType: 'password',

            authAccountName: undefined,
            authUserName: undefined,
            authPassword: undefined,
            authCompany: undefined
        }
    }
}