
export type OauthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  account: string;
  account_id: number;
  user: string;
  user_id: number;
  user_email: string;
  companies: {
    strictEncryptionPolicy: boolean;
    name: string;
    description: string;
    id: number;
  }[];
  authorities: string[];
  cluster_url: string;
}