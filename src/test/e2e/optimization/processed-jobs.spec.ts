import * as assert from 'assert';
import { CoreAPIClient } from '../../../core-api.client';
import { ClientConfigBuilder } from '../../integration-test.config';

describe('Optimization API - Processed Jobs', () => {

    const client = new CoreAPIClient(ClientConfigBuilder.getConfig('password'));

    describe('list()', () => {

        it('should retrieve processed jobs', async () => {
            const result = await client.optimizationAPI.processedJobs.list();

            assert.ok(result, 'Result should not be null');
            assert.ok(Array.isArray(result.results), 'Results should be an array');
            assert.strictEqual(typeof result.totalElements, 'number', 'totalElements should be a number');
        }).timeout(ClientConfigBuilder.getTestTimeout());

        it('should support pagination', async () => {
            const result = await client.optimizationAPI.processedJobs.list({
                page: 0,
                size: 20
            });

            assert.ok(result, 'Result should not be null');
            assert.ok(result.size <= 20, 'Page size should be respected');
        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
