
const fsm = require('../../release');
const packageJson = require('../../package.json');

const client = new fsm.CoreAPIClient({

  // debug: true,

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
    const coreSQL1 = `
  SELECT
    it
  FROM
    ServiceCall it
  `;

    const result1 = await client.query(coreSQL1, ['ServiceCall']);
    console.log(JSON.stringify(result1, null, 2)); // => { "data": [ { "it": { ... } } ... ] ...

    const coreSQL2 = `
  SELECT
    serviceCall.id,
    serviceCall.subject
  FROM
    ServiceCall serviceCall
  WHERE
    serviceCall.id = '36A5626F65A54FE7911F536C501D151A'
  `;

    const result2 = await client.query(coreSQL2, ['ServiceCall']);
    console.log(JSON.stringify(result2, null, 2)); // => { "data": [ { "serviceCall": { "id": "36A5626F65A54FE7911F536C501D151A" ... } } ... ] ...
  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }

})();