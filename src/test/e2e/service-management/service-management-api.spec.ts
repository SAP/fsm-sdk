import assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';
import { ClientConfig } from '../../../core/client-config.model';
import { HttpService } from '../../../core/http/http-service';
import { OAuthService } from '../../../core/oauth/oauth.service';
import { ServiceManagementAPIService } from '../../../core/service-management/service-management.service';
import ServiceCallTreeFixture from './service-call-tree.fixture.json';

describe('ServiceManagementAPI', () => {

    const config = { ...ClientConfigBuilder.getConfig('password'), tokenCacheFilePath: undefined, debug: false } as ClientConfig
    const https = new HttpService(config);
    const service = new ServiceManagementAPIService(config, https, new OAuthService(https));

    const prepare = async () => {
        const [{ businessPartner }] = await new CoreAPIClient(config)
            .query(`select businessPartner FROM BusinessPartner businessPartner LIMIT 1`, ['BusinessPartner'])
            .then(r => r.data);

        return { businessPartner };
    }

    describe('Composite Tree', () => {

        const SC_ID = CoreAPIClient.createUUID();

        it('POST ServiceCall - autoCreateActivity: true', done => {
            prepare()
                .then(({ businessPartner }) => {
                    return service.composite.tree.postServiceCall({
                        ...ServiceCallTreeFixture,
                        id: SC_ID,
                        subject: 'my test',
                        businessPartner: { id: businessPartner?.id || '' },
                    }, { autoCreateActivity: true })
                })
                .then(serviceCall => {
                    assert(serviceCall, 'should return a result');
                    assert(serviceCall.id === SC_ID, 'should return the same id');
                })
                .then(_ => done())
                .catch(e => done(e));
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('GET ServiceCall', done => {
            service.composite.tree.getServiceCall(SC_ID)
                .then(serviceCall => {
                    assert(serviceCall, 'should return a result');
                    assert(serviceCall.id === SC_ID, 'should return the same id');
                    assert(serviceCall.activities?.length === 1, 'should have activities');
                })
                .then(_ => done())
                .catch(e => done(e));
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('GET Activity', done => {
            service.composite.tree.getServiceCall(SC_ID)
                .then(serviceCall => {
                    return service.composite.tree.getServiceCallActivity(SC_ID, serviceCall?.activities?.[0].id || '');
                })
                .then(activity => {
                    assert(activity, 'should return a result');
                })
                .then(_ => done())
                .catch(e => done(e));
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('PATCH ServiceCall', done => {
            service.composite.tree.patchServiceCall({
                id: SC_ID,
                subject: 'my test - updated'
            })
                .then(serviceCall => {
                    assert(serviceCall, 'should return a result');
                    assert(serviceCall.id === SC_ID, 'should return the same id');
                    assert(serviceCall.subject === 'my test - updated', 'should have the updated subject');
                })
                .then(_ => done())
                .catch(e => done(e));
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

    describe.only('Composite Bulk', () => {

        const THE_IDs: string[] = [
            CoreAPIClient.createUUID(),
            CoreAPIClient.createUUID()
        ];

        it('POST ServiceCalls', done => {
            prepare()
                .then(({ businessPartner }) => {
                    return service.composite.bulk.postServiceCalls([
                        {
                            ...ServiceCallTreeFixture,
                            id: THE_IDs[0],
                            subject: 'my test 1',
                            externalId: `EXT-${CoreAPIClient.createUUID()}`,
                            businessPartner: { id: businessPartner?.id || '' },
                        },
                        {
                            ...ServiceCallTreeFixture,
                            id: THE_IDs[1],
                            externalId: `EXT-${CoreAPIClient.createUUID()}`,
                            subject: 'my test 2',
                            businessPartner: { id: businessPartner?.id || '' },
                        }
                    ], { autoCreateActivity: true })
                })
                .then(result => {
                    assert(result, 'should return a result');
                    assert(result.hasErrors === false, 'should not have errors');
                    assert(result.results.length === 2, 'should have 2 results');
                    assert(result.results.every(r => r.status === 201), 'all should have status 201');
                    assert(result.results.every(r => r.resource.activities && r.resource.activities.length === 1), 'all should have 1 activity');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('POST ServiceCalls Technically Complete', done => {
            service.composite.bulk.postServiceCallsTechnicallyComplete({
                    serviceCallIds: [
                        { id: THE_IDs[0] },
                        { id: THE_IDs[1] }
                    ]
                })
                .then(result => {
                    console.log(JSON.stringify(result, null, 2));
                    assert(result, 'should return a result');
                    assert(result.hasErrors === false, 'should not have errors');
                    assert(result.results.length === 2, 'should have 2 results');
                    assert(result.results.every(r => r.status === 200), 'all should have status 200');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());


        it('PATCH ServiceCalls', done => {
            service.composite.bulk.patchServiceCalls([
                {
                    id: THE_IDs[0],
                    subject: 'my test - updated bulk'
                }
            ])
                .then(result => {
                    assert(result, 'should return a result');
                    assert(result.hasErrors === false, 'should not have errors');
                    assert(result.results.length === 1, 'should have 1 result');
                    assert(result.results[0].status === 200, 'should have status 200');
                    assert(result.results[0].resource.subject === 'my test - updated bulk', 'should have the updated subject');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

})