import { readFileSync } from 'fs';
import { ClientConfig } from '../core/client-config.model';
const packageJson = JSON.parse(readFileSync('./package.json').toString()) as { version: string };
require('dotenv').config()

export const integrationTestConfig: ClientConfig = {

  debug: (process.env.DEBUG_TESTS === 'true') || false,

  oauthEndpoint: process.env.OAUTH_ENDPOINT || 'https://ds.coresuite.com/api/oauth2/v1',
  tokenCacheFilePath: './coresystems-oauth2-token.json',

  clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  clientVersion: packageJson.version as string,

  authGrantType: process.env.AUTH_GRANT_TYPE as 'password' | 'client_credentials' || 'password',

  authAccountName: process.env.AUTH_ACCOUNTNAME as string,
  authUserName: process.env.AUTH_USERNAME as string,
  authPassword: process.env.AUTH_PASSWORD as string,
  authCompany: undefined // use first 

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