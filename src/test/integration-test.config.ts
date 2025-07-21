import { readFileSync } from 'fs';
import { ClientConfig, OAuthGrantType } from '../core/client-config.model';
const packageJson = JSON.parse(readFileSync('./package.json').toString()) as { version: string };
require('dotenv').config()

const baseConfig: Partial<ClientConfig> = {

  debug: (process.env.DEBUG_TESTS === 'true') || false,

  oauthEndpoint: process.env.OAUTH_ENDPOINT,
  baseUrl: process.env.BASE_URL,

  clientVersion: packageJson.version as string,
  clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  clientSecret: process.env.CLIENT_SECRET as string,
}

export class ClientConfigBuilder {

  private static configs = new Map<OAuthGrantType, Partial<ClientConfig>>()
    .set('client_credentials', {
      ...baseConfig,

      tokenCacheFilePath: undefined,

      authGrantType: 'client_credentials',
      authAccountName: process.env.AUTH_ACCOUNT_NAME as string,
      authCompany: process.env.AUTH_COMPANY_NAME as string,
      authUserName: undefined,
      authPassword: undefined
    })
    .set('password', {
      ...baseConfig,

      tokenCacheFilePath: './coresystems-oauth2-token.json',

      authGrantType: 'password',
      authAccountName: process.env.AUTH_ACCOUNT_NAME as string,
      authCompany: process.env.AUTH_COMPANY_NAME as string,
      authUserName: process.env.AUTH_USERNAME as string,
      authPassword: process.env.AUTH_PASSWORD as string
    });

  public static getConfig(gradtype: OAuthGrantType): Partial<ClientConfig> {
    const config = { ...this.configs.get(gradtype) || this.configs.get('client_credentials') || {} };

    Object.keys(config).forEach((key) => {
      const missingMandatoryValue = [
        'clientIdentifier',
        'clientSecret',
        'clientVersion'
      ].indexOf(key as keyof ClientConfig) !== -1 && !config[key as keyof ClientConfig];

      if (missingMandatoryValue) {
        throw new Error(`missing mandatory config key [${key}]\n`);
      }
    })

    return config;
  }

  public static getTestTimeout() {
    return parseInt(process.env.TEST_TIMEOUT || '10000', 10);
  }
}

// integrationTestConfig
