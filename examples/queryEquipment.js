
const fsm = require('../release');

const client = new fsm.CoreAPIClient({

    // debug: true,

    // put your client config here
    clientIdentifier: process.env.CLIENT_IDENTIFIER,
    clientSecret: process.env.CLIENT_SECRET,
    clientVersion: process.env.CLIENT_VERSION,

    // put your auth config here
    authAccountName: process.env.AUTH_ACCOUNTNAME,
    authUserName: process.env.AUTH_USERNAME,
    authPassword: process.env.AUTH_PASSWORD

});

(async () => {

    const coreSQL1 = `
  SELECT
    it
  FROM
    Equipment it
  `;

    const result1 = await client.query(coreSQL1, ['Equipment']);
    console.log(JSON.stringify(result1, null, 2)); // => { "data": [ { "it": { ... } } ... ] ...

})();