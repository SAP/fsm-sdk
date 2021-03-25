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

    // ensure token is fetched
    removeTokenFile();

    it('should forward error', done => {
      const client = new CoreAPIClient({ ...integrationTestConfig, debug: false, clientIdentifier: 'i/n/v/a/l/i/d', clientSecret: '******' });
      client.query(`does not matter`, ['ServiceCall'])
        .catch((errorResp: ErrorResponse<{ error: string, error_description: string }>) => {
          assert.strictEqual(errorResp.statusCode, 401);
          assert.strictEqual(errorResp.message, 'Unauthorized');
          assert.strictEqual(errorResp.error.error, 'invalid_client');
          assert.strictEqual(errorResp.error.error_description, 'Client authentication failed');
          return done();
        });
    }).timeout(5000);
  });


});
