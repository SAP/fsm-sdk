import assert from 'assert';
import { DataApiClient } from '../core/api-clients/data-api/data-api.client';
import { oAuthResponseMock } from './fixture/oAuthResponse.mock';

describe('DataApiClient', () => {

    describe('getDataApiUriFor', () => {

        it('with no id', () => {
            const result = DataApiClient.getDataApiUriFor({ ...oAuthResponseMock, cluster_url: 'test.com' }, 'Activity');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity`);
        });

        it('by dto id', () => {
            const result = DataApiClient.getDataApiUriFor({ ...oAuthResponseMock, cluster_url: 'test.com' }, 'Activity', '1-uid');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1-uid`);
        });

        it('by external id', () => {
            const result = DataApiClient.getDataApiUriFor({ ...oAuthResponseMock, cluster_url: 'test.com' }, 'Activity', null, '1-external-id');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/externalId/1-external-id`);
        });

        it('should prefer id', () => {
            const result = DataApiClient.getDataApiUriFor({ ...oAuthResponseMock, cluster_url: 'test.com' }, 'Activity', '1-uid', '1-external-id');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1-uid`);
        });
    });

});