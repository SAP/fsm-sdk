import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';
import ServiceCallTreeFixture from '../service-management/service-call-tree.fixture.json';

describe('Optimization API - Re-Optimization', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    const prepare = async () => {
        const [{ businessPartner }] = await client
            .dataServiceAPI
            .query(`select businessPartner FROM BusinessPartner businessPartner LIMIT 1`, ['BusinessPartner'])
            .then(r => r.data);

        // Create two service calls with activities in parallel
        const [serviceCall1, serviceCall2] = await Promise.all([
            client.serviceManagementAPI.composite.tree.postServiceCall({
                ...ServiceCallTreeFixture,
                id: CoreAPIClient.createUUID(),
                subject: 'Test Service Call 1 for Re-Optimization',
                businessPartner: { id: businessPartner?.id || '' },
            }, { autoCreateActivity: true }),
            client.serviceManagementAPI.composite.tree.postServiceCall({
                ...ServiceCallTreeFixture,
                id: CoreAPIClient.createUUID(),
                subject: 'Test Service Call 2 for Re-Optimization',
                businessPartner: { id: businessPartner?.id || '' },
            }, { autoCreateActivity: true })
        ]);

        const activityIds = [
            serviceCall1.activities?.[0]?.id || '',
            serviceCall2.activities?.[0]?.id || ''
        ].filter(id => id);

        return { activityIds, serviceCall1, serviceCall2 };
    };

    describe('execute()', () => {

        it('should execute re-optimization with valid activity IDs', async () => {
            try {
                const { activityIds } = await prepare();

                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: activityIds,
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(6, 0, 0, 0)).toISOString(),
                    end: new Date(dayAfterTomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    simulation: true, // Use simulation mode for testing
                    releaseOnSchedule: false
                });

                assert.ok(result, 'Result should not be null');
                assert.strictEqual(typeof result.result, 'boolean', 'Result should have a boolean result property');

                if (result.optimizationTaskIds !== undefined) {
                    assert.ok(Array.isArray(result.optimizationTaskIds), 'Task IDs should be an array');

                    if (result.optimizationTaskIds.length > 0) {
                        result.optimizationTaskIds.forEach(taskId => {
                            assert.strictEqual(typeof taskId, 'string', 'Task ID should be a string');
                            assert.ok(taskId.length > 0, 'Task ID should not be empty');
                        });
                    }
                }

                if (result.errors !== undefined) {
                    assert.ok(Array.isArray(result.errors), 'Errors should be an array');
                }
            } catch (error) {
                console.error('Error executing re-optimization:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should execute re-optimization with resource filters', async () => {
            try {
                const { activityIds } = await prepare();
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: activityIds,
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    simulation: true,
                    resources: {
                        personIds: [
                            CoreAPIClient.createUUID(), // non-existent for test
                        ]
                    },
                    schedulingOptions: {
                        defaultDrivingTimeMinutes: 30
                    }
                });

                assert.ok(result, 'Result should not be null');
                assert.strictEqual(typeof result.result, 'boolean', 'Result should have a boolean result property');
            } catch (error) {
                console.error('Error executing re-optimization with resource filters:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should execute re-optimization with partitioning strategy', async () => {
            try {
                const { activityIds } = await prepare();
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: activityIds,
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(6, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(20, 0, 0, 0)).toISOString(),
                    simulation: true,
                    partitioningStrategy: {
                        type: 'SPATIAL',
                        maxResourcesPerPartition: 10
                    },
                    parallelizable: true,
                    key: 'test-optimization-run'
                });

                assert.ok(result, 'Result should not be null');

                if (result.optimizationTaskIds) {
                    // With partitioning, there might be multiple task IDs
                    assert.ok(result.optimizationTaskIds.length > 0, 'Should have at least one task ID');
                }
            } catch (error) {
                console.error('Error executing re-optimization with partitioning:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should execute re-optimization with additional data options', async () => {
            try {
                const { activityIds } = await prepare();
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: activityIds,
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    simulation: true,
                    additionalDataOptions: {
                        includeReleasedJobsAsBookings: true
                    },
                    reAssignWithoutCopy: false,
                    trigger: 'manual-test'
                });

                assert.ok(result, 'Result should not be null');
                assert.strictEqual(typeof result.result, 'boolean', 'Result should have a boolean result property');
            } catch (error) {
                console.error('Error executing re-optimization with additional data options:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should handle re-optimization errors gracefully', async () => {
            try {
                // Try with invalid activity IDs to trigger an error response
                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: [CoreAPIClient.createUUID()],
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date().toISOString(),
                    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    simulation: true
                });

                if (result && result.errors) {
                    assert.ok(Array.isArray(result.errors), 'Errors should be an array');

                    if (result.errors.length > 0) {
                        const error = result.errors[0];
                        assert.ok(error.skill !== undefined || error.error !== undefined,
                            'Error should have skill or error property');

                        if (error.error) {
                            assert.ok(error.error.code, 'Error should have code');
                            assert.ok(error.error.message, 'Error should have message');
                        }
                    }
                }
            } catch (error) {
                console.error('Error handling re-optimization errors:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should execute re-optimization without releasing on schedule', async () => {
            try {
                const { activityIds } = await prepare();
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.reOptimization.execute({
                    activityIds: activityIds,
                    optimizationPlugin: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    simulation: true,
                    releaseOnSchedule: false // Don't automatically release activities
                });

                assert.ok(result, 'Result should not be null');
                assert.strictEqual(typeof result.result, 'boolean', 'Result should have a boolean result property');
            } catch (error) {
                console.error('Error executing re-optimization without release:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
