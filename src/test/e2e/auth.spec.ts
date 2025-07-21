import assert from 'assert';
import { ClientConfigBuilder } from '../integration-test.config';
import { CoreAPIClient } from '../../core-api.client';
import { ErrorResponse } from '../../core/http/error-response.model';

describe('Auth', () => {

  describe('login', () => {

    it('should do login via [client_credentials]', done => {
      const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), tokenCacheFilePath: undefined });
      client.login()
        .then(token => {
          assert.ok(token.access_token)
          assert.ok(token.expires_in)
          assert.ok(token.content)
          assert.ok(token.contentType === 'client')
        })
        .then(() => done())
        .catch(e => done(e))

    }).timeout(ClientConfigBuilder.getTestTimeout());

    it('should do login via [password]', done => {
      const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('password'), tokenCacheFilePath: undefined });
      client.login()
        .then(token => {
          assert.ok(token.access_token)
          assert.ok(token.expires_in)
          assert.ok(token.content)
          assert.ok(token.contentType === 'user')
        })
        .then(() => done())
        .catch(e => done(e))

    }).timeout(ClientConfigBuilder.getTestTimeout());

  });

  describe('auth errors', () => {
    it('should forward error for invalid client', done => {
      const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), tokenCacheFilePath: undefined, clientIdentifier: 'i/n/v/a/l/i/d', clientSecret: '******' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 401);
          assert.strictEqual(errorResp.message, 'Unauthorized');
          done();
        });

    }).timeout(ClientConfigBuilder.getTestTimeout());

    it('should forward error for password', done => {
      const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), tokenCacheFilePath: undefined, authGrantType: 'password', authUserName: 'i/n/v/a/l/i/d', authPassword: '******' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 400); // this should be 401, not 400
          done();
        });
    }).timeout(ClientConfigBuilder.getTestTimeout());


    it('should forward error unknown endpoints', done => {

      const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), tokenCacheFilePath: undefined, oauthEndpoint: 'https://eu.fsm.cloud.sap/api/oauth2/random-API' });
      client.login()
        .then(t => done(new Error('should not resolve')))
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }, any>) => {
          assert.strictEqual(errorResp.statusCode, 405);
          done();
        });

    }).timeout(ClientConfigBuilder.getTestTimeout());

  });

});
