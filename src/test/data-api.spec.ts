import assert = require('assert');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';
import { CreateAction, DeleteAction } from '..';

describe('DataApi', () => {

  let client: CoreAPIClient

  beforeEach(() => {
    client = new CoreAPIClient(integrationTestConfig);
  });

  function prepareFixture() {
    const serviceCall = require('./fixture/serviceCall.fixture.json');
    const businessPartner = require('./fixture/businessPartner.fixture.json');
    return { serviceCall, businessPartner };
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

  it('POST serviceCall Id', done => {

    const serviceCall = {
      ...prepareFixture().serviceCall,
      id: THE_ID,
      externalId: THE_EXTERNAL_ID,
      subject: 'subject-changed-with-POST',
    };
    client.post('ServiceCall', serviceCall)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        assert.strictEqual(serviceCall.id, THE_ID, 'POST');
        assert.strictEqual(typeof (serviceCall as any as { createPerson: string }).createPerson, 'string');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('POST serviceCall ExternalId', done => {
    const MyExternalID = CoreAPIClient.createUUID();
    const serviceCall = {
      ...prepareFixture().serviceCall,
      externalId: MyExternalID,
      subject: 'subject-changed-with-POST',
    };
    client.postByExternalId('ServiceCall', serviceCall)
      .then(fromDB => {
        const [{ serviceCall }] = fromDB.data;
        assert.strictEqual(serviceCall.externalId, MyExternalID, 'POST');
        assert.strictEqual(typeof (serviceCall as any as { createPerson: { id: string } }).createPerson, 'object');
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
        assert.strictEqual(typeof (resp1.data[0].serviceCall as any as { createPerson: string }).createPerson, 'string');
        assert.strictEqual(resp2.data[0].serviceCall.id, resp1.data[0].serviceCall.id, 'POST ExternalId');
        assert.strictEqual(typeof (resp2.data[0].serviceCall as any as { createPerson: { id: string } }).createPerson, 'object');
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
        assert.strictEqual(typeof (serviceCall as any as { createPerson: string }).createPerson, 'string');
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
        assert.strictEqual(typeof (serviceCall as any as { createPerson: { id: string } }).createPerson, 'object');
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
        assert.strictEqual(typeof (serviceCall as any as { createPerson: string }).createPerson, 'string');
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
        assert.strictEqual(typeof (serviceCall as any as { createPerson: { id: string } }).createPerson, 'object');
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
      ...prepareFixture().serviceCall,
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

  it('External Id E2E', done => {

    const fix = prepareFixture();
    const BP_ID = CoreAPIClient.createUUID();
    const BP_EXT_ID = `Ext-BP-${BP_ID}`;
    const SC_ID = CoreAPIClient.createUUID();
    const SC_EXT_ID = `Ext-SC-${SC_ID}`;

    client.batch([
      new CreateAction('BusinessPartner', { ...fix.businessPartner, id: BP_ID, externalId: BP_EXT_ID }),
      new CreateAction('ServiceCall', { ...fix.serviceCall, id: SC_ID, externalId: SC_EXT_ID, businessPartner: BP_ID })
    ])
      .then(([resp1, resp2]) => {
        // setup
        const [{ businessPartner }] = resp1.body.data as [{ businessPartner: { id: string, lastChanged: number } }];
        const [{ serviceCall }] = resp2.body.data as [{ serviceCall: { id: string, lastChanged: number, businessPartner: string } }];
        assert.strictEqual(serviceCall.id, SC_ID, 'linked SC');
        assert.strictEqual(businessPartner.id, BP_ID, 'linked BP');
        assert.strictEqual(serviceCall.businessPartner, businessPartner.id, 'BP linked to SC');
      })
      .then(async () => {

        const [{ serviceCall }] = await client.getByExternalId<{ id: string, lastChanged: number, businessPartner: { id: string, externalId: string } }>('ServiceCall', SC_EXT_ID).then(x => x.data);
        assert.strictEqual(serviceCall.businessPartner.externalId, BP_EXT_ID);
        assert.strictEqual(serviceCall.businessPartner.id, BP_ID);

      })
      // clean up
      .then(() => client.batch<{}>([
        new DeleteAction('BusinessPartner', { id: BP_ID }, true),
        new DeleteAction('ServiceCall', { id: SC_ID }, true)
      ]))
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

});
