import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Best Matching Technicians', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    // This test requires a valid activity ID
    const activityId = 'TEST_ACTIVITY_ID'; // Replace with actual activity ID in real test

    describe('find()', () => {

        xit('should find best matching technicians for an activity', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(dayAfterTomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    schedulingOptions: {
                        maxResults: 10
                    }
                });

                assert.ok(result, 'Result should not be null');
                assert.ok(Array.isArray(result.results), 'Results should be an array');

                if (result.results.length > 0) {
                    const technician = result.results[0];
                    assert.ok(technician.personId, 'Technician should have a personId');
                    assert.strictEqual(typeof technician.score, 'number', 'Technician should have a numeric score');

                    if (technician.availableSlots !== undefined) {
                        assert.ok(Array.isArray(technician.availableSlots), 'Available slots should be an array');
                    }

                    if (technician.distanceMeters !== undefined) {
                        assert.strictEqual(typeof technician.distanceMeters, 'number', 'Distance should be a number');
                    }

                    if (technician.travelTimeMinutes !== undefined) {
                        assert.strictEqual(typeof technician.travelTimeMinutes, 'number', 'Travel time should be a number');
                    }
                }
            } catch (error) {
                console.error('Error finding best matching technicians:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should respect maxResults option', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    schedulingOptions: {
                        maxResults: 3
                    }
                });

                if (result && result.results) {
                    assert.ok(result.results.length <= 3, 'Should return at most 3 results');
                }
            } catch (error) {
                console.error('Error testing maxResults option:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should filter technicians by person IDs', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    resources: {
                        personIds: ['PERSON_ID_1', 'PERSON_ID_2'], // Replace with actual person IDs
                        includeNonSchedulable: false
                    },
                    schedulingOptions: {
                        maxResults: 5
                    }
                });

                if (result && result.results) {
                    assert.ok(Array.isArray(result.results), 'Results should be an array');

                    // All returned technicians should be from the specified person IDs
                    result.results.forEach(tech => {
                        assert.ok(['PERSON_ID_1', 'PERSON_ID_2'].includes(tech.personId),
                            'Technician should be from specified person IDs');
                    });
                }
            } catch (error) {
                console.error('Error filtering by person IDs:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should include additional data options', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    additionalDataOptions: {
                        includeJobsAsBookings: true,
                        includeReleasedJobsAsBookings: true,
                        includeUnassignedJobs: true
                    },
                    schedulingOptions: {
                        maxResults: 5,
                        considerTravelTime: true,
                        considerWorkingHours: true
                    }
                });

                assert.ok(result, 'Result should not be null');

                if (result.results) {
                    assert.ok(Array.isArray(result.results), 'Results should be an array');
                }

                if (result.scoreLog) {
                    assert.ok(Array.isArray(result.scoreLog), 'Score log should be an array');

                    if (result.scoreLog.length > 0) {
                        const logEntry = result.scoreLog[0];
                        assert.ok(logEntry.personId, 'Score log entry should have personId');
                        assert.strictEqual(typeof logEntry.score, 'number', 'Score log entry should have numeric score');
                    }
                }
            } catch (error) {
                console.error('Error including additional data options:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should handle different policies', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                // Test with different policy (if available in your account)
                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'Distance', // Use a policy that exists in your account
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    schedulingOptions: {
                        maxResults: 5
                    }
                });

                assert.ok(result, 'Result should not be null');

                if (result.results) {
                    assert.ok(Array.isArray(result.results), 'Results should be an array');
                }
            } catch (error) {
                console.error('Error handling different policies:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should return score log when available', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.bestMatchingTechnicians.find(activityId, {
                    policy: 'DistanceAndSkills',
                    start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                    end: new Date(tomorrow.setHours(18, 0, 0, 0)).toISOString(),
                    schedulingOptions: {
                        maxResults: 5
                    }
                });

                if (result && result.scoreLog) {
                    assert.ok(Array.isArray(result.scoreLog), 'Score log should be an array');

                    result.scoreLog.forEach(entry => {
                        assert.ok(entry.personId, 'Each score log entry should have personId');
                        assert.strictEqual(typeof entry.score, 'number', 'Each score should be a number');
                    });
                }
            } catch (error) {
                console.error('Error checking score log:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
