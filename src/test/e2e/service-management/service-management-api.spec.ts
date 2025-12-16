import assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';
import { ClientConfig } from '../../../core/client-config.model';
import { HttpService } from '../../../core/http/http-service';
import { OAuthService } from '../../../core/oauth/oauth.service';
import { ServiceManagementAPIService } from '../../../core/service-management/service-management.service';
import { Activity, ServiceCall } from '../../../core/service-management/service-management.model';

import ServiceCallTreeFixture from './service-call-tree.fixture.json';
import { BulkResponse } from '../../../core/service-management/composite-bulk-api.service';


describe('ServiceManagementAPI', () => {

    const config = { ...ClientConfigBuilder.getConfig('password'), tokenCacheFilePath: undefined, debug: false } as ClientConfig
    const https = new HttpService(config);
    const service = new ServiceManagementAPIService(config, https, new OAuthService(https));

    let onActivityCreated: (object: Activity) => void;
    let getFreshActivity = new Promise<Activity>((resolve, reject) => {
        onActivityCreated = resolve;
    });

    describe('Composite', () => {

        const prepare = async () => {
            const [{ businessPartner }] = await new CoreAPIClient(config)
                .query(`select businessPartner FROM BusinessPartner businessPartner LIMIT 1`, ['BusinessPartner'])
                .then(r => r.data);

            return { businessPartner };
        }

        describe('Tree', () => {

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
                        onActivityCreated(activity);
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

        describe('Bulk', () => {

            const THE_IDs: string[] = [
                CoreAPIClient.createUUID(),
                CoreAPIClient.createUUID()
            ];


            let onBulkServiceCallsCreated: (object: BulkResponse<ServiceCall>) => void;
            let getFreshBulkServiceCalls = new Promise<BulkResponse<ServiceCall>>((resolve, reject) => {
                onBulkServiceCallsCreated = resolve;
            });

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
                        onBulkServiceCallsCreated(result);
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

            it('POST ServiceCalls Technically Complete', done => {

                // bulk cancel service calls before calling technically complete
                getFreshBulkServiceCalls.then(bulk => {
                    const activities = bulk.results.map(it => it.resource.activities!)
                        .reduce((all, activities) => [...all, ...activities], [] as Activity[])
                    return service.activity.bulk.cancel(activities.map(a => ({ activityId: a.id!, cancellationReason: 'Some-Reason-For' + a.id! })))
                })
                    .then(response => {
                        const serviceCallIds = response.results.map(it => it.newActivity?.object?.objectId).filter(it => !!it);
                        return service.composite.bulk.postServiceCallsTechnicallyComplete({
                            serviceCallIds: serviceCallIds.map(id => ({ id }))
                        })
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

        });

    })

    describe('Activity', () => {

        let onActivityDubplicated: (object: Activity) => void;
        let getFreshDubplicateActivity = new Promise<Activity>((resolve, reject) => {
            onActivityDubplicated = resolve;
        });

        const prepare = async () => {
            const [
                activity,
                [{ person }]
            ] = await Promise.all([
                getFreshActivity, // reusing from other test

                new CoreAPIClient(config)
                    .query(`select person FROM UnifiedPerson person WHERE person.plannableResource=true LIMIT 1`, ['UnifiedPerson'])
                    .then(r => r.data)

            ]);

            return { activity, person };
        }

        it('duplicate', done => {
            prepare()
                .then(({ activity }) => {
                    return service.activity.duplicate(activity.id!).then(response => ({ response, activity })); // pass activity along for next then
                })
                .then(({ response, activity }) => {
                    assert(response, 'should return a result');
                    assert(response.activity.id !== activity.id, 'should have a different id');
                    assert(response.activity.originActivity === activity.id, 'originActivity should point to the original activity');
                    assert(response.activity.sourceActivity === activity.id, 'sourceActivity should point to the original activity');
                    onActivityDubplicated(response.activity);
                    return
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());


        it('plan', done => {
            prepare()
                .then(({ activity, person }) => {
                    return service.activity.plan(activity.id!, {
                        startDateTime: new Date('2030-01-01').toISOString(),
                        plannedDurationInMinutes: 60,
                        technician: { id: person?.id || '' },
                    }).then(({ activity }) => ({ activity, person })); // pass person along for next then
                })
                .then(({ activity, person }) => {
                    return assert((activity.responsibles as string[]).some((pId) => pId === person?.id), 'should have the planned technician');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());


        it('release', done => {
            prepare()
                .then(({ activity }) => {
                    return service.activity.release(activity.id!, {
                        udfValues: []
                    })
                })
                .then(({ activity }) => {
                    assert(activity, 'should return a result');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('replan', done => {
            prepare()
                .then(({ activity, person }) => {
                    return service.activity.replan(activity.id!, {
                        startDateTime: new Date('2030-02-01').toISOString(),
                        plannedDurationInMinutes: 90,
                        technician: { id: person?.id || '' },
                    }).then(({ activity }) => ({ activity, person }));
                })
                .then(({ activity, person }) => {
                    assert(activity, 'should return a result');
                    assert((activity.responsibles as string[]).some((pId) => pId === person?.id), 'should have the replanned technician');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('reschedule', done => {
            prepare()
                .then(({ activity, person }) => {
                    return service.activity.reschedule(activity.id!, {
                        startDateTime: new Date('2030-03-01').toISOString(),
                        plannedDurationInMinutes: 120,
                        technician: { id: person?.id || '' },
                    }).then(({ activity }) => ({ activity, person }));
                })
                .then(({ activity, person }) => {
                    assert(activity, 'should return a result');
                    assert((activity.responsibles as string[]).some((pId) => pId === person?.id), 'should have the rescheduled technician');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('cancel', done => {
            prepare()
                .then(({ activity }) => {
                    return service.activity.cancel(activity.id!, {
                        cancellationReason: 'Not needed anymore',
                        cancelServiceCallConfirmed: true,
                    })
                })
                .then(({ activity }) => {
                    assert(activity, 'should return a result');
                    assert(activity!.cancellationReason === 'Not needed anymore', 'should have the cancellationReason');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('close', done => {
            prepare()
                .then(({ activity }) => {

                    console.log('Closing activity', activity);

                    return service.activity.close(activity.id!)
                })
                .then(({ activity }) => {
                    assert(activity, 'should return a result');
                    assert(activity!.status === 'CLOSED', 'should have status CLOSED');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

        describe('Bulk', () => {

            it('duplicate', done => {
                prepare()
                    .then(({ activity }) => {
                        return service.activity.bulk.duplicate([{ id: activity.id! }]).then(response => ({ response, activity })); // pass activity along for next then
                    })
                    .then(({ response, activity }) => {
                        assert(response.results, 'should return a result');
                        assert(response.hasErrors === false, 'should not have errors');
                        assert(response.results.length === 1, 'should have 1 results');
                        assert(response.results.every(r => r.status === 200), 'all should have status 200');
                        assert(response.results.every(r => (r.newActivity.originActivity as string) === activity.id), 'originActivity should point to the original activity')
                        assert(response.results.every(r => (r.newActivity.sourceActivity as string) === activity.id), 'sourceActivity should point to the original activity')
                        return
                    })
                    .then(_ => done())
                    .catch(e => done(e));

            }).timeout(ClientConfigBuilder.getTestTimeout());

            it('plan', done => {
                prepare()
                    .then(({ person }) => {
                        return getFreshDubplicateActivity.then(activity => ({ activity, person }))
                    })
                    .then(({ activity, person }) => {
                        return service.activity.bulk.plan([
                            {
                                id: activity.id!,
                                startDateTime: new Date('2030-01-01').toISOString(),
                                plannedDurationInMinutes: 60,
                                technician: { id: person?.id || '' },
                            }
                        ]).then(response => ({ response, person })); // pass person along for next then
                    })
                    .then(({ response, person }) => {
                        assert(response.results, 'should return a result');
                        assert(response.hasErrors === false, 'should not have errors');
                        assert(response.results.length === 1, 'should have 1 results');
                        assert(response.results.every(r => r.status === 200), 'all should have status 200');
                        assert(response.results.every(r => (r.newActivity.responsibles as string[]).some((pId) => pId === person?.id)), 'should have the planned technician')
                    })
                    .then(_ => done())
                    .catch(e => done(e));

            }).timeout(ClientConfigBuilder.getTestTimeout());


            it('cancel', done => {
                getFreshDubplicateActivity
                    .then((activity) => {
                        return service.activity.bulk.cancel([{
                            id: activity.id!,
                            cancellationReason: 'Not needed anymore',
                            cancelServiceCallConfirmed: true,
                        }])
                    })
                    .then((response) => {
                        assert(response.results, 'should return a result');
                        assert(response.hasErrors === false, 'should not have errors');
                        assert(response.results.length === 1, 'should have 1 results');
                        assert(response.results.every(r => r.status === 200), 'all should have status 200');
                        assert(response.results.every(r => r.newActivity.cancellationReason === 'Not needed anymore'), 'originActivity should point to the original activity')
                    })
                    .then(_ => done())
                    .catch(e => done(e));

            }).timeout(ClientConfigBuilder.getTestTimeout());

        });
    })
})