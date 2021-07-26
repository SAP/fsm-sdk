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

    it('getDataApiUriFor', () => {
        const result = RequestOptionsFacory.getDataApiUriFor({ cluster_url: 'test.com' } as any, 'Activity', '1');
        assert.deepStrictEqual(result, `test.com/api/data/v4/Activity/1`);
    });

});