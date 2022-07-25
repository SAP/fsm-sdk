import { OAuthResponse } from '../../core/api-clients/oauth-api/oauth-response.model';

export const oAuthResponseMock: OAuthResponse = {

    expires_in: 9999999,

    access_token: '<token>',
    token_type: 'bearer',
    scope: '<scope>',
    account: '<account>',
    account_id: -1,
    tenant_id: null,
    user: '<user>',
    user_email: '<user_email>',
    user_id: -1,
    companies: [
        {
            permissionGroupId: -1,
            strictEncryptionPolicy: false,
            name: '<name>',
            description: '<description>',
            personId: '<personId>',
            id: -1
        }
    ],
    authorities: [
        'USER'
    ],
    cluster_url: '<cluster_url>'
};