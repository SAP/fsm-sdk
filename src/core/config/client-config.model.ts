export type ClientConfig = {
  debug?: boolean | undefined;
  tokenCacheFilePath?: string | undefined;

  oauthEndpoint?: string | undefined;

  clientIdentifier: string;
  clientSecret: string;
  clientVersion: string;

  authGrantType?: 'password' | 'client_credentials' | undefined;

  authAccountName?: string | undefined;
  authUserName?: string | undefined;
  authPassword?: string | undefined;
  authCompany?: string | undefined;
}
