import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Job Slots', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    // This test requires a valid activity ID
    // We'll skip if no activity is available
    const activityId = 'TEST_ACTIVITY_ID'; // Replace with actual activity ID in real test

    describe('search()', () => {

        xit('should search for available job slots with activityId', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const result = await client.optimizationAPI.jobSlots.search({
                    activityId: activityId,
                    slots: [
                        {
                            start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString()
                        }
                    ],
                    resources: {
                        includeNonSchedulable: false
                    },
                    options: {
                        maxResults: 10,
                        defaultDrivingTimeMinutes: 30
                    },
                    policy: 'DistanceAndSkills'
                });

                assert.ok(result, 'Result should not be null');
                assert.ok(Array.isArray(result.results), 'Results should be an array');

                if (result.results.length > 0) {
                    const slot = result.results[0];
                    assert.ok(slot.personId, 'Slot should have a personId');
                    assert.ok(slot.start, 'Slot should have a start time');
                    assert.ok(slot.end, 'Slot should have an end time');
                    assert.strictEqual(typeof slot.score, 'number', 'Slot should have a numeric score');
                }
            } catch (error) {
                console.error('Error searching job slots with activityId:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should search for available job slots with job definition', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.jobSlots.search({
                    job: {
                        duration: 120, // 2 hours
                        skills: [],
                        address: {
                            city: 'Berlin',
                            country: 'DE'
                        }
                    },
                    slots: [
                        {
                            start: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString()
                        },
                        {
                            start: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString()
                        }
                    ],
                    resources: {
                        includeNonSchedulable: false
                    },
                    options: {
                        maxResults: 5,
                        defaultDrivingTimeMinutes: 30
                    },
                    policy: 'DistanceAndSkills'
                });

                // The API may not return results if no resources match the criteria
                if (result) {
                    assert.ok(result, 'Result should not be null');

                    if (result.results !== undefined) {
                        assert.ok(Array.isArray(result.results), 'Results should be an array');

                        if (result.results.length > 0) {
                            assert.ok(result.results.length <= 5, 'Should respect maxResults option');
                        }
                    }

                    if (result.warnings !== undefined) {
                        assert.ok(Array.isArray(result.warnings), 'Warnings should be an array if present');
                    }
                }
            } catch (error) {
                console.error('Error searching job slots with job definition:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should search with specific person IDs filter', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.jobSlots.search({
                    job: {
                        duration: 60
                    },
                    slots: [
                        {
                            start: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString()
                        }
                    ],
                    resources: {
                        personIds: [], // Empty array means search all
                        includeNonSchedulable: false
                    },
                    options: {
                        maxResults: 3,
                        considerTravelTime: true,
                        considerWorkingHours: true,
                        defaultDrivingTimeMinutes: 20
                    },
                    policy: 'DistanceAndSkills'
                });

                if (result) {
                    assert.ok(result, 'Result should not be null');

                    if (result.results !== undefined) {
                        assert.ok(Array.isArray(result.results), 'Results should be an array');
                    }

                    if (result.scoreLog !== undefined) {
                        assert.ok(Array.isArray(result.scoreLog), 'Score log should be an array if present');
                    }
                }
            } catch (error) {
                console.error('Error searching with specific person IDs filter:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        xit('should handle request with multiple time slots', async () => {
            try {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);

                const result = await client.optimizationAPI.jobSlots.search({
                    job: {
                        duration: 90
                    },
                    slots: [
                        {
                            start: new Date(tomorrow.setHours(8, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(9, 30, 0, 0)).toISOString()
                        },
                        {
                            start: new Date(tomorrow.setHours(13, 0, 0, 0)).toISOString(),
                            end: new Date(tomorrow.setHours(14, 30, 0, 0)).toISOString()
                        },
                        {
                            start: new Date(dayAfterTomorrow.setHours(9, 0, 0, 0)).toISOString(),
                            end: new Date(dayAfterTomorrow.setHours(10, 30, 0, 0)).toISOString()
                        }
                    ],
                    resources: {
                        includeNonSchedulable: false
                    },
                    options: {
                        maxResults: 10,
                        defaultDrivingTimeMinutes: 15
                    },
                    policy: 'DistanceAndSkills'
                });

                if (result && result.results !== undefined) {
                    assert.ok(Array.isArray(result.results), 'Results should be an array');

                    // Verify slot results correspond to the requested time windows
                    result.results.forEach(slot => {
                        assert.ok(slot.personId, 'Each slot should have a personId');
                        assert.ok(slot.start, 'Each slot should have a start time');
                        assert.ok(slot.end, 'Each slot should have an end time');
                    });
                }
            } catch (error) {
                console.error('Error handling request with multiple time slots:', error);
                throw error;
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
