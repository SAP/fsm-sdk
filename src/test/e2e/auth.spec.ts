import assert from 'assert';
import { integrationTestConfig } from '../integration-test.config';
import { CoreAPIClient } from '../../core-api.client';
import { ErrorResponse } from '../../core/error-response.model';

describe('Auth', () => {

  describe('login', () => {

    it('should do login', done => {
      const client = new CoreAPIClient({ ...integrationTestConfig, tokenCacheFilePath: undefined });
      client.login()
        .then(token => assert.ok(token.expires_in))
        .then(() => done())
        .catch(e => done(e))

    }).timeout(5000);

  });

  describe('auth errors', () => {
    it('should forward error for invalid client', done => {
      const client = new CoreAPIClient({ ...integrationTestConfig, tokenCacheFilePath: undefined, clientIdentifier: 'i/n/v/a/l/i/d', clientSecret: '******' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 401);
          assert.strictEqual(errorResp.message, 'Unauthorized');
          done();
        });

    }).timeout(5000);

    it('should forward error for password', done => {
      const client = new CoreAPIClient({ ...integrationTestConfig, tokenCacheFilePath: undefined, authGrantType: 'password', authUserName: 'i/n/v/a/l/i/d', authPassword: '******' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 400); // this should be 401, not 400
          done();
        });
    }).timeout(5000);


    it('should forward error unknown endpoints', done => {

      const client = new CoreAPIClient({ ...integrationTestConfig, tokenCacheFilePath: undefined, oauthEndpoint: 'https://eu.fsm.cloud.sap/api/oauth2/random-API' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 405);
          done();
        });

    }).timeout(5000);

  });

});
