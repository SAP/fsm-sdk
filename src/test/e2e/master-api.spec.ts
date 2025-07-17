import assert from 'assert';
import { integrationTestConfig } from '../integration-test.config';
import { CoreAPIClient } from '../../core-api.client';

describe('MasterApi', () => {

  const client = new CoreAPIClient({ ...integrationTestConfig, debug: false });
  it('should getAccounts', done => {

    client.masterApi.getAccounts()
      .then(data => {
        assert(Array.isArray(data));
        assert(data.length > 0);
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

});
