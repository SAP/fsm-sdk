import assert = require('assert');
import fs = require('fs');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';
import { ErrorResponse } from '../core/error-response.model';

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
