import assert = require('assert');
import fs = require('fs');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';
import { ErrorResponse } from '../core/error-response.model';
import { OauthTokenResponse } from '../core/oauth-token-response.model';
import { HttpService } from '../core/http-service';
import { AuthService } from '../core/auth.service';

describe('Auth', () => {

  const removeTokenFile = () => {
    if (!integrationTestConfig.debug || !integrationTestConfig.tokenCacheFilePath) {
      return;
    }
    try {
      require(integrationTestConfig.tokenCacheFilePath);
      fs.unlinkSync(integrationTestConfig.tokenCacheFilePath);
    } catch (error) { }
  }

  describe('AuthService', () => {

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
      ],
      cluster_url: '<cluster_url>'
    };

    describe('ensureToken', () => {

      it('should fetch token if not present', done => {

        removeTokenFile();

        const auth = new AuthService({ request: () => Promise.resolve(tokenMock) } as any as HttpService);

        auth.ensureToken(integrationTestConfig)
          .then(token => assert.deepStrictEqual(token, tokenMock))
          .then(() => done())
          .catch(e => done(e));

      });

      it('should refresh token if expired', done => {

        removeTokenFile();

        const httpStub = { request: () => Promise.resolve(JSON.stringify(tokenMock)) } as any as HttpService;
        const loggerStub = { error: () => { } }
        const auth = new AuthService(httpStub, loggerStub);

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
        const auth = new AuthService(httpStub);

        const validToken = { ...tokenMock, expires_in: 8888888 };
        auth.setToken(validToken);

        auth.ensureToken({ ...integrationTestConfig, debug: false, authGrantType: 'client_credentials' })
          .then(token => assert.deepStrictEqual(token, validToken))
          .then(() => done())
          .catch(e => done(e))

      });

    });

  });

  describe('login', () => {

    it('should do login', done => {
      // ensure token is fetched
      removeTokenFile();

      const client = new CoreAPIClient({ ...integrationTestConfig, debug: false });
      client.login()
        .then(token => assert.ok(token.expires_in))
        .then(() => done())
        .catch(e => done(e))

    }).timeout(5000);

  });
  
  describe('auth errors', () => {

    it('should forward error', done => {
      // ensure token is fetched
      removeTokenFile();

      const client = new CoreAPIClient({ ...integrationTestConfig, debug: false, clientIdentifier: 'i/n/v/a/l/i/d', clientSecret: '******' });
      client.query(`does not matter`, ['ServiceCall'])
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 401);
          assert.strictEqual(errorResp.message, 'Unauthorized');
          assert.strictEqual(errorResp.error.error, 'invalid_client');
          assert.strictEqual(errorResp.error.error_description, 'Client authentication failed');
          return done();
        });
    }).timeout(5000);

    it('should forward error for password', done => {

      // ensure token is fetched
      removeTokenFile();

      const client = new CoreAPIClient({ ...integrationTestConfig, debug: false, authGrantType: 'password', authUserName: 'i/n/v/a/l/i/d', authPassword: '******' });
      client.query(`does not matter`, ['ServiceCall'])
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string, disassociated: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 400);
          assert.strictEqual(errorResp.error.error, 'invalid_grant');
          assert.strictEqual(errorResp.error.error_description, 'Bad credentials');
          assert.strictEqual(errorResp.error.disassociated, 'true');
          return done();
        });
    }).timeout(5000);


    it('should forward error unknown endpoints', done => {

      // ensure token is fetched
      removeTokenFile();

      const client = new CoreAPIClient({ ...integrationTestConfig, debug: false, oauthEndpoint: 'https://ds.coresuite.com/api/RANDOM-API' });
      client.query(`does not matter`, ['ServiceCall'])
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string, disassociated: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 404);
          assert(!!errorResp.error);
          return done();
        });
    }).timeout(5000);


  });


});
