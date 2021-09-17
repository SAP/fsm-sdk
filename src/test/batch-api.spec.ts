import assert = require('assert');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';
import { CreateAction, DeleteAction } from '../index';

describe('BatchApi', () => {

  let client: CoreAPIClient

  beforeEach(() => {
    client = new CoreAPIClient({ ...integrationTestConfig, debug: false });
  });

  function prepareFixture() {
    return require('./fixture/serviceCall.fixture.json');
  }

  it('batch create', done => {

    const actions = [
      new CreateAction('ServiceCall', {
        ...prepareFixture(),
        id: CoreAPIClient.createUUID(),
        subject: `auto-cleanup`,
      }),
      new CreateAction('ServiceCall', {
        ...prepareFixture(),
        id: CoreAPIClient.createUUID(),
        subject: `auto-cleanup`,
      })
    ];

    client.batch<{ id: string }>(actions)
      .then(responses => {
        assert.deepStrictEqual(responses[0].body.data[0]['serviceCall'].id, actions[0].dtoData.id);
        assert.deepStrictEqual(responses[1].body.data[0]['serviceCall'].id, actions[1].dtoData.id);
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('batch delete', done => {
    new Promise<void>(async (ok, fail) => {
      try {

        const query = `select x from ServiceCall x where x.subject='auto-cleanup'`;
        const toDelete = await client.query<{ x: { id: string, lastChanged: number } }>(query, ['ServiceCall'])
          .then(r => r.data.map(it => it.x))

        // for each object one action with only { id, lastChanged } to not force delete
        const actions = toDelete.map(({ id, lastChanged }) => new DeleteAction('ServiceCall', { id, lastChanged }));

        const result = await client.batch<{}>(actions);

        result.forEach(r => {
          assert.strictEqual(r.statusCode, 200);
        });

        ok();
      } catch (error) {
        fail(error);
      }
    }).then(_ => done()).catch(e => done(e));

  }).timeout(5000);

});
