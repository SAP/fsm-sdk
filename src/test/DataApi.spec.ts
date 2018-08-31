import assert = require('assert');
import { integrationTestConfig } from './integrationTest.config';
import { CoreAPIClient } from '../CoreAPIClient';

describe('DataApi', () => {

  let client: CoreAPIClient

  beforeEach(() => {
    client = new CoreAPIClient(integrationTestConfig);
  });

  function prepareFixture() {
    return require('./serviceCall.fixture.json');
  }

  const THE_ID = CoreAPIClient.createUUID();

  it('POST serviceCall', done => {

    const serviceCall = {
      ...prepareFixture(),
      id: THE_ID,
      externalId: `test-cleanup-${THE_ID}`,
      subject: 'subject-changed-with-POST',
    };
    client.post('ServiceCall', serviceCall)
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.equal(serviceCall.id, THE_ID, 'POST');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('GET serviceCall', done => {

    client.getById('ServiceCall', THE_ID)
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.equal(serviceCall.id, THE_ID, 'POST');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));

  }).timeout(5000);

  it('PUT serviceCall', done => {
    client.getById('ServiceCall', THE_ID)
      .then(response => {
        const [{ serviceCall }] = response.data;
        return client.put('ServiceCall', { ...serviceCall, subject: 'subject-changed-with-PUT' })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.equal(serviceCall.subject, 'subject-changed-with-PUT', 'PUT');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('PATCH serviceCall', done => {

    client.getById('ServiceCall', THE_ID)
      .then(response => {
        const [{ serviceCall }] = response.data;
        return client.patch('ServiceCall', {
          id: THE_ID,
          subject: 'subject-changed-with-PATCH',
          lastChanged: serviceCall.lastChanged
        })
      })
      .then(response => {
        const [{ serviceCall }] = response.data;
        assert.equal(serviceCall.subject, 'subject-changed-with-PATCH', 'PATCH');
        return serviceCall;
      })
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

  it('DELETE serviceCall', done => {
    client.getById('ServiceCall', THE_ID)
      .then(response => {
        const [{ serviceCall }] = response.data;
        return client.deleteById('ServiceCall', { id: THE_ID, lastChanged: serviceCall.lastChanged as number })
      })
      .then(_ => client.getById('ServiceCall', THE_ID))
      .then(response => assert.equal(response.data.length, 0))
      .then(_ => done())
      .catch(e => done(e));
  }).timeout(5000);

});
