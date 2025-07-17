import { readFileSync } from 'fs';
import { ClientConfig, OAuthGrantType } from '../core/client-config.model';
const packageJson = JSON.parse(readFileSync('./package.json').toString()) as { version: string };
require('dotenv').config()

export const integrationTestConfig: ClientConfig = {

  debug: (process.env.DEBUG_TESTS === 'true') || false,

  oauthEndpoint: process.env.OAUTH_ENDPOINT || 'https://eu.fsm.cloud.sap/api/oauth2/v2',
  baseUrl: process.env.BASE_URL || 'https://eu.fsm.cloud.sap',
  tokenCacheFilePath: './coresystems-oauth2-token.json',

  clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  clientVersion: packageJson.version as string,

  authGrantType: process.env.AUTH_GRANT_TYPE as OAuthGrantType || 'password',

  authAccountName: process.env.AUTH_ACCOUNT_NAME as string,
  authCompany: process.env.AUTH_COMPANY_NAME as string,
  
  authUserName: process.env.AUTH_USERNAME as string,
  authPassword: process.env.AUTH_PASSWORD as string 

};

Object.keys(integrationTestConfig).forEach((key) => {
  const missingMandatoryValue = [
    'clientIdentifier',
    'clientSecret',
    'clientVersion'
  ].indexOf(key as keyof ClientConfig) !== -1 && !integrationTestConfig[key as keyof ClientConfig];

  if (missingMandatoryValue) {
    throw new Error(`missing mandatory config key [${key}]\n`);
  }
}, true)