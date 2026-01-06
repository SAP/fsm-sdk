import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Plugins', () => {

    let client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    describe('list()', () => {

        it('should retrieve optimization plugins (policies)', async () => {
            const result = await client.optimizationAPI.plugins.list();
            assert.ok(result, 'Result should not be null');
            assert.ok(Array.isArray(result.results), 'Results should be an array');
            assert.strictEqual(typeof result.totalElements, 'number', 'totalElements should be a number');
            assert.strictEqual(typeof result.totalPages, 'number', 'totalPages should be a number');

            if (result.results && result.results.length > 0) {
                const plugin = result.results[0];
                assert.ok(plugin.id, 'Plugin should have an id');
                assert.ok(plugin.name, 'Plugin should have a name');

            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should support pagination', async () => {
            const result = await client.optimizationAPI.plugins.list({ page: 0, size: 5 });

            assert.ok(result, 'Result should not be null');

            if (result && result.size !== undefined) {
                assert.ok(result.size <= 5, 'Page size should be respected');
            }
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
