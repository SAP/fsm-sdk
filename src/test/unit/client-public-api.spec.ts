import assert from 'assert';
import { ClientConfigBuilder } from '../integration-test.config';
import * as fsm from '../..';
import { OAuthTokenResponse } from '../../core/oauth/oauth-token-response.model';


describe('compatibility', () => {

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

        it('should have public methods defined', () => {
            const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
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
                const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
                assert.deepStrictEqual(client.getToken(), undefined);
            });
        });

        describe('setToken', () => {
            it('should set token', async () => {
                const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
                const t = { access_token: '', expires_in: 999999, token_type: 'some', account: -1 } as any
                assert(!!client.setToken(t));
                assert.deepStrictEqual(client.getToken(), t);
            });

            it('should throw on invalid tokens', async () => {
                const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
                let ok = false;
                try {
                    client.setToken({} as any);
                } catch (error) {
                    ok = true
                }
                assert(ok);
            });

        });

        describe('setAuthCompany', () => {


            it('should set company', () => {
                const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
                const t = { access_token: '', expires_in: 999999, token_type: 'user', content: { companies: [{ name: 'Test Company' }] } } as Partial<OAuthTokenResponse>
                assert(!!client.setToken(t as OAuthTokenResponse));

                const company = { id: 1, name: 'Test Company' } as any;
                client.setAuthCompany(company);

            });

            it('should throw if no token present', () => {
                const client = new fsm.CoreAPIClient({ ...ClientConfigBuilder.getConfig('client_credentials'), debug: false });
                let ok = false;
                try {
                    client.setAuthCompany({} as any);
                } catch (error) {
                    ok = true;
                }
                assert(ok);
            });

        })

    });

    describe('ALL_DTO_VERSIONS', () => {
        it('should have DTOs', () => {
            assert.strictEqual(Object.keys(fsm.ALL_DTO_VERSIONS).length, 165);
        });

    });

});
