import { ClientConfig } from '../model/ClientConfig';

require('dotenv').config()

export const integrationTestConfig: ClientConfig = {

  debug: false,

  oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',
  tokenCacheFilePath: './coresystems-oauth2-token.json',

  clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  clientVersion: process.env.CLIENT_VERSION as string,

  authGrantType: process.env.AUTH_GRANT_TYPE as 'password' | 'client_credentials',

  authAccountName: process.env.AUTH_ACCOUNTNAME as string,
  authUserName: process.env.AUTH_USERNAME as string,
  authPassword: process.env.AUTH_PASSWORD as string,
  authCompany: undefined // use first 

};