
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

// valid serviceCall DTO object
const serviceCall = {
  "id": fsm.CoreAPIClient.createUUID(), // if you send [null] we will create one for you
  "subject": 'my test',
  "startDateTime": new Date('2018-01-01').toISOString(),
  "endDateTime": new Date('2018-01-02').toISOString(),
  "dueDateTime": new Date('2018-01-03').toISOString(),
  "statusCode": "-2",
  "statusName": "Ready to plan",

  "leader": null,
  "chargeableEfforts": false,
  "project": null,
  "owners": null,
  "objectGroup": null,
  "resolution": null,
  "syncObjectKPIs": null,
  "inactive": false,
  "partOfRecurrenceSeries": false,
  "contact": null,
  "problemTypeName": null,
  "originCode": null,
  "problemTypeCode": null,
  "changelog": null,
  "priority": null,
  "branches": null,
  "salesOrder": null,
  "salesQuotation": null,
  "udfMetaGroups": null,
  "orderReference": null,
  "responsibles": [],
  "syncStatus": null,
  "code": null,
  "businessPartner": null,
  "projectPhase": null,
  "technicians": [],
  "typeName": null,
  "chargeableMileages": false,
  "chargeableMaterials": false,
  "orderDateTime": null,
  "chargeableExpenses": false,
  "lastChanged": null,
  "serviceContract": null,
  "createPerson": null,
  "externalId": null,
  "groups": null,
  "team": null,
  "typeCode": null,
  "createDateTime": null,
  "equipments": [],
  "location": null,
  "udfValues": null,
  "lastChangedBy": null,
  "incident": null,
  "remarks": null,
  "originName": null
};

(async () => {
  try {
    const result = await client.post('ServiceCall', serviceCall);
    console.log(JSON.stringify(result, null, 2));  // => { data: [ { serviceCall: [Object] } ] }

  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }

})();
