
export type OAuthToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

type UserTokenContent = Partial<{
  auth_type: 'PASSWORD';
  user_email: string;
  user_name: string;
  rti: string;
  authorities: string[];
  client_id: string;
  user_uuid: null;
  companies: {
    id: number;
    name: string;
    description: string;
    strictEncryptionPolicy: boolean;
    permissionGroupId: number;
    personId: string;
  }[];
  account_id: number,
  user_id: number,
  permission_group_id: null,
  exp: number,
  user: string;
  account: string;
}>

type ClientTokenContent = Partial<{
  permission_group_id: number;
  exp: number;
  authorities: string[];
  jti: string;
  client_id: string;
}>


type TOAuthTokenResponse<T extends 'client' | 'user', U extends (ClientTokenContent | UserTokenContent)> = OAuthToken & {
  contentType: T,
  content: U
}

export type ClientOAuthTokenResponse = TOAuthTokenResponse<'client', ClientTokenContent>;
export type UserOAuthTokenResponse = TOAuthTokenResponse<'user', UserTokenContent>;

export type OAuthTokenResponse = ClientOAuthTokenResponse | UserOAuthTokenResponse;
