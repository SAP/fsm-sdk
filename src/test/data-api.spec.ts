import assert = require('assert');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';

describe('DataApi', () => {

  let client: CoreAPIClient

  beforeEach(() => {
    client = new CoreAPIClient(integrationTestConfig);
  });

  function prepareFixture() {
    return require('./serviceCall.fixture.json');
  }

  const THE_ID = CoreAPIClient.createUUID();
  const THE_EXTERNAL_ID = `test-cleanup-${THE_ID}`;

  it('should throw on unknown DTOs', done => {
    client.getById('THIS_IS_NOT_A_DTO' as any, 'SOME-ID')
      .catch(error => {
        assert(error instanceof Error)
        assert.deepStrictEqual((error as Error).message, 'no DTO version found for THIS_IS_NOT_A_DTO')
      })
      .then(_ => done())
      .catch(error => done(error));
  }).timeout(5000);

  it('POST serviceCall', done => {

    const serviceCall = {
      ...prepareFixture(),
      id: THE_ID,
      externalId: THE_EXTERNAL_ID,
      subject: 'subject-changed-with-POST',
    };
    client.post('ServiceCall', serviceCall)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        assert.strictEqual(serviceCall.id, THE_ID, 'POST');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('GET serviceCall by Id', done => {

    client.getById<{ id: string }>('ServiceCall', THE_ID)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        assert.strictEqual(serviceCall.id, THE_ID, 'POST');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('GET serviceCall by ExternalId', done => {
    Promise.all([
      client.getById<{ id: string }>('ServiceCall', THE_ID),
      client.getByExternalId<{ id: string }>('ServiceCall', THE_EXTERNAL_ID)
    ])
      .then(([resp1, resp2]) => {
        resp1.data[0].serviceCall.id;
        assert.strictEqual(resp1.data[0].serviceCall.id, THE_ID, 'POST');
        assert.strictEqual(resp2.data[0].serviceCall.id, resp2.data[0].serviceCall.id, 'POST ExternalId');
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('PUT serviceCall by Id', done => {
    client.getById<{ id: string, subject: string }>('ServiceCall', THE_ID)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        return client.put('ServiceCall', { ...serviceCall, subject: 'subject-changed-with-PUT-ID' })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.strictEqual(serviceCall.subject, 'subject-changed-with-PUT-ID', 'PUT by ID');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('PUT serviceCall by ExternalId', done => {
    client.getByExternalId<{ id: string, subject: string, lastChanged: number }>('ServiceCall', THE_EXTERNAL_ID)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        return client.putByExternalId('ServiceCall', { externalId: THE_EXTERNAL_ID, lastChanged: serviceCall.lastChanged, subject: 'subject-changed-with-PUT-ExternalId' })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.strictEqual(serviceCall.subject, 'subject-changed-with-PUT-ExternalId', 'PUT by ExternalId');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('PATCH serviceCall by Id', done => {
    client.getById<{ id: string, lastChanged: number }>('ServiceCall', THE_ID)
      .then(async (fromDB) => {
        const [{ serviceCall }] = fromDB.data;
        return client.patch('ServiceCall', {
          id: THE_ID,
          subject: 'subject-changed-with-PATCH-ID',
          lastChanged: serviceCall.lastChanged
        })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.strictEqual(serviceCall.subject, 'subject-changed-with-PATCH-ID', 'PATCH by ID');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('PATCH serviceCall by ExternalId', done => {
    client.getByExternalId<{ id: string, lastChanged: number, }>('ServiceCall', THE_EXTERNAL_ID)
      .then(async (fromDB) => {
        const [{ serviceCall }] = fromDB.data;
        return client.patchByExternalId('ServiceCall', {
          externalId: THE_EXTERNAL_ID,
          subject: 'subject-changed-with-PATCH-ExternalId',
          lastChanged: serviceCall.lastChanged
        })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.strictEqual(serviceCall.subject, 'subject-changed-with-PATCH-ExternalId', 'PATCH by ExternalId');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('DELETE serviceCall by Id', done => {
    client.getById<{ id: string, lastChanged: number }>('ServiceCall', THE_ID)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        return client.deleteById('ServiceCall', { id: THE_ID, lastChanged: serviceCall.lastChanged as number })
      })
      .then(_ => client.getById('ServiceCall', THE_ID))
      .then(fromDB => assert.strictEqual(fromDB.data.length, 0))
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('DELETE serviceCall by externalId', done => {
    const id = CoreAPIClient.createUUID();

    const serviceCall = {
      ...prepareFixture(),
      id: id,
      externalId: `delete-me-${id}`,
      subject: 'subject-changed-with-POST',
    };

    client.post<{ externalId: string, lastChanged: number }>('ServiceCall', serviceCall)
      .then(response => {
        const [{ serviceCall }] = response.data;
        return client.deleteByExternalId('ServiceCall', { externalId: serviceCall.externalId, lastChanged: serviceCall.lastChanged as number })
      })
      .then(_ => client.getById('ServiceCall', id))
      .then(fromDB => assert.strictEqual(fromDB.data.length, 0))
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

});
