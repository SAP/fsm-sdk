
export type OauthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  account: string;
  account_id: number;
  tenant_id?: null | number;
  user: string;
  user_id: number;
  user_email: string;
  companies: {
    id: number;
    name: string;
    description: string;
    strictEncryptionPolicy: boolean;
    personId?: string;
    permissionGroupId?: number;
  }[];
  authorities: string[]; // USER
  cluster_url: string;
}