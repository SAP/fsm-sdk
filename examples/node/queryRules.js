const fsm = require('../../../release/index');

const client = new fsm.CoreAPIClient({
  clientIdentifier: process.env.CLIENT_IDENTIFIER,
  clientSecret: process.env.CLIENT_SECRET,
  clientVersion: '4.0.0',

  authGrantType: 'password',
  authAccountName: process.env.AUTH_ACCOUNT_NAME,
  authUserName: process.env.AUTH_USERNAME,
  authPassword: process.env.AUTH_PASSWORD,
  authCompany: process.env.AUTH_COMPANY_NAME,

  baseUrl: process.env.BASE_URL,
  debug: false
});

async function queryRules() {
  try {
    console.log('=== Querying Business Rules ===\n');

    // Get all rules with pagination
    const rulesPage = await client.rulesAPI.getRules({
      page: 0,
      size: 5,
      sortBy: 'name',
      order: 'asc'
    });

    console.log(`Total Rules: ${rulesPage.totalElements}`);
    console.log(`Page: ${rulesPage.number + 1} of ${rulesPage.totalPages}\n`);

    if (rulesPage.content && rulesPage.content.length > 0) {
      console.log('Rules:');
      rulesPage.content.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.name} (${rule.code})`);
        console.log(`   - Enabled: ${rule.enabled}`);
        console.log(`   - Event Type: ${rule.eventType}`);
        console.log(`   - Object Type: ${rule.objectType}`);
        console.log(`   - Health State: ${rule.healthState || 'N/A'}`);
        console.log('');
      });

      // Get details of the first rule
      const firstRuleId = rulesPage.content[0].id;
      if (firstRuleId) {
        console.log('=== Getting Rule Details ===\n');
        const ruleDetails = await client.rulesAPI.getRule(firstRuleId);
        console.log('Rule Details:');
        console.log(JSON.stringify(ruleDetails, null, 2));

        // Get execution records for this rule
        console.log('\n=== Getting Execution Records ===\n');
        const executionRecords = await client.rulesAPI.getRuleExecutionRecords(firstRuleId, {
          page: 0,
          size: 5
        });
        console.log(`Total Execution Records: ${executionRecords.totalElements}`);
        if (executionRecords.content && executionRecords.content.length > 0) {
          console.log('Recent Executions:');
          executionRecords.content.forEach((record, index) => {
            console.log(`${index + 1}. Status: ${record.status}`);
            console.log(`   - Execution Date: ${record.executionDate}`);
            console.log(`   - Event Type: ${record.eventType}`);
            console.log(`   - Object ID: ${record.objectId || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('No execution records found for this rule.');
        }
      }
    } else {
      console.log('No rules found.');
    }

    // Example: Filter rules by event type
    console.log('\n=== Filtering Rules by Event Type ===\n');
    const createRules = await client.rulesAPI.getRules({
      eventType: 'CREATE',
      page: 0,
      size: 3
    });
    console.log(`Rules with CREATE event type: ${createRules.totalElements}`);

  } catch (error) {
    console.error('Error querying rules:', error);
    throw error;
  }
}

// Run the example
queryRules()
  .then(() => {
    console.log('\n✓ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Example failed:', error.message);
    process.exit(1);
  });
