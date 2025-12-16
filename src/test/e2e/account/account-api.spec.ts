import { ClientConfigBuilder } from '../../integration-test.config';
import { CoreAPIClient } from '../../../core-api.client';

describe('AccountApi', () => {

  describe('getAccounts', () => {
    const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('password'), debug: false });
    it('should throw if no access', done => {

      client.accountAPI.getAccounts()
        .then(_ => done(new Error('should throw')))
        .catch(e => done());

    }).timeout(ClientConfigBuilder.getTestTimeout());
  });

  describe('getCompaniesByAccount', () => {
    const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('password'), debug: false });
    it('should throw if no access', done => {

      client.accountAPI.getCompaniesByAccountId(1)
        .then(_ => done(new Error('should throw')))
        .catch(e => done());

    }).timeout(ClientConfigBuilder.getTestTimeout());
  })

});
