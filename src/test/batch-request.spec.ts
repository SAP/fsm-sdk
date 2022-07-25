import assert = require('assert');
import { CreateAction } from '../core/api-clients/data-api/model/batch-action.model';
import { BatchRequest } from '../core/api-clients/data-api/model/batch-request.model';
import { ClientConfigService } from '../core/config/client-config.service';
import { oAuthResponseMock } from './fixture/oAuthResponse.mock';


describe('BatchRequest', () => {

    it('empty', () => {
        const config = ClientConfigService.getDefault();
        const req = new BatchRequest(oAuthResponseMock, config, []);
        const str = req.toString();
        assert.strictEqual(str, '');
    });

    it('inst', () => {
        const config = ClientConfigService.getDefault();
        const actions = [
            new CreateAction('ServiceCall', { id: 'test-id-1' }),
            new CreateAction('ServiceCall', { id: 'test-id-2' }),
        ];
        const req = new BatchRequest(oAuthResponseMock, config, actions);
        const str = req.toString();
        assert.ok(str);
    });

    it('stringify', () => {
        const params = {
            a_number: 1,
            a_boolean: true,
            a_string: 'str"ing'
        };
        const result = BatchRequest.stringify(params);
        assert.deepStrictEqual(result, `a_number=1&a_boolean=true&a_string=str%22ing`);
    });

});