
export type OAuthGrantType = 'password' | 'client_credentials' | 'authorization_code';
export type ClientConfig = {
  debug?: boolean | undefined;
  tokenCacheFilePath?: string | undefined;

  oauthEndpoint?: string | undefined;
  
  baseUrl: string;

  clientIdentifier: string;
  clientSecret: string;
  clientVersion: string;

  authGrantType?: OAuthGrantType | undefined;

  authAccountName?: string | undefined;
  authUserName?: string | undefined;
  authPassword?: string | undefined;
  authCompany?: string | undefined;
}
