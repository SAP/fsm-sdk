import assert from 'assert';
import { ClientConfigBuilder } from '../integration-test.config';
import { CoreAPIClient } from '../../core-api.client';
import { ALL_DTO_VERSIONS } from '../../core/all-dto-versions.constant';
import { DTOName } from '../../core/dto-name.model';

describe('QueryApi', () => {

  const client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('password'), debug: false });
  it('should execute query', done => {

    client.query(
      `SELECT
          bp.id,
          bp.name,
          sc.id
        FROM
          BusinessPartner bp
          JOIN ServiceCall sc ON bp=sc.businessPartner
        LIMIT 3`,
      Object.keys(ALL_DTO_VERSIONS) as DTOName[]
    )
      .then(result => {
        assert(Array.isArray(result.data));
        assert.strictEqual(result.data.length, 3);
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(ClientConfigBuilder.getTestTimeout());
});
