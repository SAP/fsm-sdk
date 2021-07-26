const fs = require('fs');
require('dotenv').config();
const packageJson = JSON.parse(fs.readFileSync('./package.json').toString());

const config = {

    debug: (process.env.DEBUG_TESTS === 'true') || false,

    oauthEndpoint: process.env.OAUTH_ENDPOINT || 'https://ds.coresuite.com/api/oauth2/v1',
    tokenCacheFilePath: './coresystems-oauth2-token.json',

    clientIdentifier: process.env.CLIENT_IDENTIFIER,
    clientSecret: process.env.CLIENT_SECRET,
    clientVersion: packageJson.version,

    authGrantType: process.env.AUTH_GRANT_TYPE || 'password',

    authAccountName: process.env.AUTH_ACCOUNTNAME,
    authUserName: process.env.AUTH_USERNAME,
    authPassword: process.env.AUTH_PASSWORD,
    authCompany: undefined // use first 

}

const filename = './examples/html/config.js';

const content = [
    '// do not edit, auto-generated file',
    `const config = ${JSON.stringify(config, null, 2)};`,
    '' // new line EOF
].join('\n');

fs.writeFileSync(filename, content);
