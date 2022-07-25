import assert = require('assert');
import fs = require('fs');
import { integrationTestConfig } from './integration-test.config';
import * as fsm from '..';


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

    describe('fsm', () => {
        it('public API', () => {
            [
                'CoreAPIClient',

                'CreateAction',
                'UpdateAction',
                'DeleteAction',

                'ALL_DTO_VERSIONS'
            ].forEach((it: any) => assert((fsm as any)[it], `${it} to be defined`));
        });
    });

    describe('CoreAPIClient', () => {

        // ensure token is fetched
        removeTokenFile();
        const client = new fsm.CoreAPIClient({ ...integrationTestConfig, debug: false });

        it('should have public methods defined', () => {
            [
                'batch',
                'deleteById',
                'deleteByExternalId',
                'getById',
                'getByExternalId',
                'getToken',
                'patch',
                'patchByExternalId',
                'post',
                'postByExternalId',
                'put',
                'putByExternalId',
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

            it('should throw on invalid tokens', async () => {
                let ok = false;
                try {
                    client.setToken({} as any);
                } catch (error) {
                    ok = true
                }
                assert(ok);
            });

        });

    });

    describe('ALL_DTO_VERSIONS', () => {
        it('should have DTOs', () => {
            assert.strictEqual(Object.keys(fsm.ALL_DTO_VERSIONS).length, 166);
        });

    });

});
