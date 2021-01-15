import assert = require('assert');
import fs = require('fs');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';

describe('QueryApi', () => {

  const removeTokenFile = () => {
    if (!integrationTestConfig.debug || !integrationTestConfig.tokenCacheFilePath) {
      return;
    }
    try {
      require(integrationTestConfig.tokenCacheFilePath);
      fs.unlinkSync(integrationTestConfig.tokenCacheFilePath);
    } catch (error) { }
  }

  describe('without token', () => {

    // ensure token is fetched
    removeTokenFile();
    const client = new CoreAPIClient({ ...integrationTestConfig, debug: true });

    it('should execute query with auth context', done => {

      client.query(
        `SELECT
          bp.id,
          bp.name,
          sc.id
        FROM
          BusinessPartner bp
          JOIN ServiceCall sc ON bp=sc.businessPartner
        LIMIT 3`,
        ['BusinessPartner', 'ServiceCall'])
        .then(result => assert.deepEqual(result.data, []))
        .then(_ => done())
        .catch(e => done(e));

    });
  });


});
