import assert = require('assert');
import fs = require('fs');
import { integrationTestConfig } from './integration-test.config';
import { CoreAPIClient } from '../core-api.client';
import { ALL_DTO_VERSIONS } from '../core/all-dto-versions.constant';

describe('compatibility', () => {

    const removeTokenFile = () => {
        if (!integrationTestConfig.debug || !integrationTestConfig.tokenCacheFilePath) {
            return;
        }
        try {
            require(integrationTestConfig.tokenCacheFilePath);
            fs.unlinkSync(integrationTestConfig.tokenCacheFilePath);
        } catch (error) { }
    }

    describe('CoreAPIClient', () => {

        // ensure token is fetched
        removeTokenFile();
        const client = new CoreAPIClient({ ...integrationTestConfig, debug: false });

        it('should have public methods defined', () => {
            [
                'batch',
                'deleteById',
                'getById',
                'getToken',
                'patch',
                'post',
                'put',
                'query',
                'setToken',
            ].forEach(fn => assert((client as any)[fn], `${fn} to be defined`));
        });

        describe('getToken', () => {
            it('should get token', async () => {
                assert.deepStrictEqual(client.getToken(), undefined);
            });
        });

        describe('setToken', () => {
            it('should set token', async () => {
                assert(!!client.setToken({ account: -1 } as any));
                assert.deepStrictEqual(client.getToken(), { account: -1 });
            });
        });

    });

    describe('ALL_DTO_VERSIONS', () => {
        it('should have DTOs', () => {
            assert.strictEqual(Object.keys(ALL_DTO_VERSIONS).length, 78);
        });

    });

});
