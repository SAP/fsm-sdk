
const fsm = require('../../release');
const packageJson = require('../../package.json');

const client = new fsm.CoreAPIClient({

  debug: true,

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

  const getByIdResult = await client.getById('ServiceCall', 'DA921AB9A823435A99A4673BB6D37D99', {
    useExternalIds: true
  });
  console.log(JSON.stringify(getByIdResult, null, 2));

})();