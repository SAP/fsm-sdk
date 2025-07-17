import assert from 'assert';
import * as fs from 'fs';
import { integrationTestConfig } from '../integration-test.config';
import { OauthTokenResponse } from '../../core/oauth-token-response.model';
import { HttpService } from '../../core/http/http-service';
import { OAuthService } from '../../core/oauth/oauth.service';

const removeTokenFile = () => {
  if (!integrationTestConfig.debug || !integrationTestConfig.tokenCacheFilePath) {
    return;
  }
  try {
    require(integrationTestConfig.tokenCacheFilePath);
    fs.unlinkSync(integrationTestConfig.tokenCacheFilePath);
  } catch (error) { }
}

describe('OAuthService', () => {

  const tokenMock: OauthTokenResponse = {

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
    ]
  };

  describe('ensureToken', () => {

    it('should fetch token if not present', done => {

      removeTokenFile();

      const auth = new OAuthService({ request: () => Promise.resolve(tokenMock) } as any as HttpService);

      auth.ensureToken(integrationTestConfig)
        .then(token => assert.deepStrictEqual(token, tokenMock))
        .then(() => done())
        .catch(e => done(e));

    });

    it('should refresh token if expired', done => {

      removeTokenFile();

      const httpStub = { request: () => Promise.resolve(JSON.stringify(tokenMock)) } as any as HttpService;
      const loggerStub = { error: () => { } }
      const auth = new OAuthService(httpStub, loggerStub);

      const invalidToken = { ...tokenMock, expires_in: 0 };
      auth.setToken(invalidToken);

      auth.ensureToken({ ...integrationTestConfig, debug: true, authGrantType: 'client_credentials', tokenCacheFilePath: 'i/n/v/a/l/i/d' })
        .then(token => assert.deepStrictEqual(token, tokenMock))
        .then(() => done())
        .catch(e => done(e));

    });

    it('should NOT refresh token if still valid', done => {

      removeTokenFile();

      const httpStub = { request: () => Promise.resolve(JSON.stringify(tokenMock)) } as any as HttpService;
      const auth = new OAuthService(httpStub);

      const validToken = { ...tokenMock, expires_in: 8888888 };
      auth.setToken(validToken);

      auth.ensureToken({ ...integrationTestConfig, debug: false, authGrantType: 'client_credentials' })
        .then(token => assert.deepStrictEqual(token, validToken))
        .then(() => done())
        .catch(e => done(e))

    });

  });

});