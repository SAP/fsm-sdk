import assert from 'assert';
import { RequestOptionsFactory } from '../core/request-options.factory';

describe('RequestOptionsFactory', () => {

    it('stringify', () => {
        const params = {
            a_number: 1,
            a_boolean: true,
            a_string: 'str"ing'
        };
        const result = RequestOptionsFactory.stringify(params);
        assert.deepStrictEqual(result, `a_number=1&a_boolean=true&a_string=str%22ing`);
    });

    describe('getDataApiUriFor', () => {

        it('with no id', () => {
            const result = RequestOptionsFactory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity`);
        });

        it('by dto id', () => {
            const result = RequestOptionsFactory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', '1-uid');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1-uid`);
        });

        it('by external id', () => {
            const result = RequestOptionsFactory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', null, '1-external-id');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/externalId/1-external-id`);
        });

        it('should prefer id', () => {
            const result = RequestOptionsFactory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', '1-uid', '1-external-id');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1-uid`);
        });
    });

});