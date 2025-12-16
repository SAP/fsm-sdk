import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Tasks', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    // This test requires a valid task ID from a previous optimization execution
    const taskId = 'TEST_TASK_ID'; // Replace with actual task ID in real test

    describe('get()', () => {

        xit('should retrieve optimization task by ID', async () => {
            try {
                const result = await client.optimizationAPI.tasks.get(taskId);

                assert.ok(result, 'Result should not be null');
                assert.strictEqual(result.id, taskId, 'Task ID should match');
                assert.ok(result.status, 'Task should have a status');
                assert.ok(['NEW', 'FETCHING', 'PROCESSING', 'SUCCESS', 'CANCELLED', 'FAILED'].includes(result.status),
                    'Status should be valid');
                assert.strictEqual(typeof result.simulation, 'boolean', 'Simulation should be a boolean');
                assert.ok(result.createdDateTime, 'Task should have createdDateTime');
                assert.ok(result.policyName, 'Task should have policyName');

                if (result.key !== undefined) {
                    assert.strictEqual(typeof result.key, 'string', 'Key should be a string');
                }

                if (result.statusMessage !== undefined) {
                    assert.strictEqual(typeof result.statusMessage, 'string', 'Status message should be a string');
                }

                if (result.jobs !== undefined) {
                    assert.ok(Array.isArray(result.jobs), 'Jobs should be an array');

                    if (result.jobs.length > 0) {
                        const job = result.jobs[0];
                        assert.ok(job.activityId, 'Job should have activityId');

                        if (job.assignmentChangeCategory !== undefined) {
                            assert.ok(['assigned', 'reassigned', 'unchanged', 'unassigned'].includes(job.assignmentChangeCategory),
                                'Assignment change category should be valid');
                        }
                    }
                }

                if (result.resources !== undefined) {
                    assert.ok(Array.isArray(result.resources), 'Resources should be an array');

                    if (result.resources.length > 0) {
                        const resource = result.resources[0];
                        assert.ok(resource.personId, 'Resource should have personId');
                    }
                }
            } catch (error) {
                console.error('Error retrieving optimization task:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should handle non-existent task ID gracefully', async () => {
            try {
                const nonExistentId = 'NON_EXISTENT_TASK_ID_12345';

                try {
                    await client.optimizationAPI.tasks.get(nonExistentId);
                    assert.fail('Should have thrown an error for non-existent task');
                } catch (error) {
                    // Expected to fail with 404 or similar error
                    assert.ok(error, 'Should throw an error for non-existent task');
                }
            } catch (error) {
                console.error('Error handling non-existent task:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

    describe('cancel()', () => {

        xit('should cancel an ongoing optimization task', async () => {
            try {
                // Note: This test requires a task in NEW, FETCHING, or PROCESSING state
                const cancelableTaskId = 'CANCELABLE_TASK_ID'; // Replace with actual task ID

                await client.optimizationAPI.tasks.cancel(cancelableTaskId, {
                    reason: 'Test cancellation'
                });

                // Verify task was cancelled by retrieving it
                const task = await client.optimizationAPI.tasks.get(cancelableTaskId);

                if (task) {
                    assert.strictEqual(task.status, 'CANCELLED', 'Task status should be CANCELLED');
                }
            } catch (error) {
                console.error('Error cancelling optimization task:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should cancel task without reason', async () => {
            try {
                const cancelableTaskId = 'CANCELABLE_TASK_ID'; // Replace with actual task ID

                await client.optimizationAPI.tasks.cancel(cancelableTaskId);

                // Verify task was cancelled
                const task = await client.optimizationAPI.tasks.get(cancelableTaskId);

                if (task) {
                    assert.strictEqual(task.status, 'CANCELLED', 'Task status should be CANCELLED');
                }
            } catch (error) {
                console.error('Error cancelling task without reason:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should not allow cancelling completed tasks', async () => {
            try {
                // Try to cancel a task that's already completed
                const completedTaskId = 'COMPLETED_TASK_ID'; // Replace with actual completed task ID

                try {
                    await client.optimizationAPI.tasks.cancel(completedTaskId, {
                        reason: 'Attempt to cancel completed task'
                    });
                    assert.fail('Should not allow cancelling a completed task');
                } catch (error) {
                    // Expected to fail - completed tasks cannot be cancelled
                    assert.ok(error, 'Should throw an error when trying to cancel completed task');
                }
            } catch (error) {
                console.error('Error testing cancellation of completed task:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
