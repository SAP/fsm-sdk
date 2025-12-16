import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Executions', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    describe('list()', () => {

        it('should retrieve optimization executions', async () => {
            const result = await client.optimizationAPI.executions.list();

            assert.ok(result, 'Result should not be null');

            // Handle case where API might return empty results or different structure
            if (result && result.results !== undefined) {
                assert.ok(Array.isArray(result.results), 'Results should be an array');
                assert.strictEqual(typeof result.totalElements, 'number', 'totalElements should be a number');
                assert.strictEqual(typeof result.totalPages, 'number', 'totalPages should be a number');
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should support filtering by status', async () => {
            const result = await client.optimizationAPI.executions.list({
                filter: {
                    status: 'SUCCESS'
                }
            });

            assert.ok(result, 'Result should not be null');

            if (result && result.results && result.results.length > 0) {
                result.results.forEach(execution => {
                    assert.strictEqual(execution.status, 'SUCCESS', 'All executions should have SUCCESS status');
                });
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should support pagination', async () => {
            const result = await client.optimizationAPI.executions.list({
                page: 0,
                size: 10
            });

            assert.ok(result, 'Result should not be null');

            if (result && result.size !== undefined) {
                assert.ok(result.size <= 10, 'Page size should be respected');
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
