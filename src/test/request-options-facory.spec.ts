import assert from 'assert';
import { RequestOptionsFacory } from '../core/request-options.facory';

describe('RequestOptionsFacory', () => {

    it('stringify', () => {
        const params = {
            a_number: 1,
            a_boolean: true,
            a_string: 'str"ing'
        };
        const result = RequestOptionsFacory.stringify(params);
        assert.deepStrictEqual(result, `a_number=1&a_boolean=true&a_string=str%22ing`);
    });

    describe('getDataApiUriFor', () => {

        it('with no id', () => {
            const result = RequestOptionsFacory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity`);
        });

        it('by dto id', () => {
            const result = RequestOptionsFacory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', '1-uid');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1-uid`);
        });

        it('by external id', () => {
            const result = RequestOptionsFacory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', null, '1-external-id');
            assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/externalId/1-external-id`);
        });

    });

});