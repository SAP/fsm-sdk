import assert from 'assert';
import { ClientConfigBuilder } from '../integration-test.config';
import { CoreAPIClient } from '../../core-api.client';

describe.skip('AccountApi', () => {

  const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
  it('should getAccounts', done => {

    client.getAccounts()
      .then(data => {
        assert(Array.isArray(data));
        assert(data.length > 0);
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(ClientConfigBuilder.getTestTimeout());

});
