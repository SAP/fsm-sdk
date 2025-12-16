import assert from 'assert';
import { ClientConfigBuilder } from '../../integration-test.config';
import { CoreAPIClient } from '../../../core-api.client';

describe('RulesAPI', () => {

    let client: CoreAPIClient;

    beforeEach(() => {
        client = new CoreAPIClient({ ...ClientConfigBuilder.getConfig('password'), debug: false });
    });

    describe('getRules', () => {

        it('should retrieve rules with pagination', done => {
            client.rulesAPI.getRules({ page: 0, size: 10 })
                .then(result => {
                    assert.ok(result, 'Result should not be null');
                    assert.ok(typeof result.totalElements === 'number', 'Should have totalElements');
                    assert.ok(Array.isArray(result.content), 'Should have content array');
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

    describe('getRule', () => {

        it('should retrieve rules and get specific rule by id', done => {
            client.rulesAPI.getRules({ page: 0, size: 1 })
                .then(result => {
                    if (!result || !result.content || result.content.length === 0) {
                        throw new Error('No rules found to test getRule');
                    }

                    const firstRule = result.content[0];
                    if (!firstRule.id) {
                        throw new Error('First rule has no ID');
                    }

                    return client.rulesAPI.getRule(firstRule.id)
                        .then(rule => {
                            assert.ok(rule, 'Rule should not be null');
                            assert.strictEqual(rule.id, firstRule.id, 'Rule IDs should match');
                        });
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

    describe('createRule, updateRule, and getRuleExecutionRecords', () => {

        function prepareFixture() {
            return require('./rule.fixture.json');
        }

        it('should create, update, and retrieve execution records for a rule', done => {
            const ruleCode = `TEST_RULE_${Date.now()}`;
            let createdRuleId: string;

            const fixtureData = prepareFixture();

            // Create a rule using fixture data
            client.rulesAPI.createRule({
                ...fixtureData,
                code: ruleCode,
                name: 'Test Rule - Auto Cleanup',
                enabled: false,
                embedded: false
            })
                .then(createdRule => {
                    assert.ok(createdRule, 'Created rule should not be null');
                    assert.ok(createdRule.id, 'Created rule should have an ID');
                    assert.strictEqual(createdRule.code, ruleCode, 'Rule code should match');

                    createdRuleId = createdRule.id!;

                    // Update the rule
                    return client.rulesAPI.updateRule(createdRuleId, {
                        description: 'Updated test rule description'
                    });
                })
                .then(updatedRule => {
                    assert.ok(updatedRule, 'Updated rule should not be null');
                    assert.strictEqual(updatedRule.id, createdRuleId, 'Rule ID should match');
                    assert.strictEqual(updatedRule.description, 'Updated test rule description', 'Description should be updated');

                    // Get execution records (should be empty for a newly created rule)
                    return client.rulesAPI.getRuleExecutionRecords(createdRuleId, { page: 0, size: 10 });
                })
                .then(executionRecords => {
                    assert.ok(executionRecords, 'Execution records should not be null');
                    assert.ok(Array.isArray(executionRecords.content), 'Execution records should have content array');
                    // Note: execution records might be empty for a newly created, disabled rule
                })
                .then(_ => done())
                .catch(e => done(e));

        }).timeout(ClientConfigBuilder.getTestTimeout());

    });

});
