/**
 * EXAMPLE
 * List technicians with fields relevant for FSM
 */

const fsm = require('../../release');
const packageJson = require('../../package.json');

const client = new fsm.CoreAPIClient({

  // put your client config here
  clientIdentifier: process.env.CLIENT_IDENTIFIER,
  clientSecret: process.env.CLIENT_SECRET,
  clientVersion: packageJson.version,

  // put your auth config here
  authAccountName: process.env.AUTH_ACCOUNTNAME,
  authUserName: process.env.AUTH_USERNAME,
  authPassword: process.env.AUTH_PASSWORD,

  authGrantType: process.env.AUTH_GRANT_TYPE,
  oauthEndpoint: process.env.OAUTH_ENDPOINT
});

(async () => {
  try {
    // select the data we need regarding technicians. It can be filtered by job title and external resource flag
    const coreSQL = `
  SELECT
    unifiedPerson.id,
    unifiedPerson.userName,
    unifiedPerson.firstName,
    unifiedPerson.lastName,
    unifiedPerson.externalResource,
    unifiedPerson.jobTitle
  FROM
    UnifiedPerson unifiedPerson
  WHERE
    unifiedPerson.plannableResource = true
  `;

    const result = await client.query(coreSQL, ['UnifiedPerson']);

    console.log(`Total ${result.data.length} technicians found`);

    result.data.forEach(el => {
      console.log(`username: ${el.unifiedPerson.userName}\tname: ${el.unifiedPerson.firstName} ${el.unifiedPerson.lastName}\tid: ${el.unifiedPerson.id}\texternal: ${el.unifiedPerson.externalResource}\ttitle: ${el.unifiedPerson.jobTitle}`);
    });
  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }

})();
