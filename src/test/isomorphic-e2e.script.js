function log(name, data) {
    console.log('running: ', name, data);
    const pre = document.querySelectorAll('#output')[0];
    pre.innerHTML += [('-'.repeat(99)), `running: ${name}`, (!!data ? (JSON.stringify(data, null, 2) + '\n') : '')].join('\n');
}

const prepareFixture = () => ({
    "leader": null,
    "subject": null,
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
    "id": null,
    "problemTypeCode": null,
    "changelog": null,
    "endDateTime": "2017-07-26T09:57:36Z",
    "priority": null,
    "branches": null,
    "salesOrder": null,
    "dueDateTime": "2017-07-25T21:59:59Z",
    "salesQuotation": null,
    "udfMetaGroups": null,
    "orderReference": null,
    "responsibles": [],
    "syncStatus": "IN_CLOUD",
    "statusCode": "-2",
    "code": null,
    "businessPartner": null,
    "projectPhase": null,
    "technicians": [],
    "typeName": null,
    "chargeableMileages": false,
    "chargeableMaterials": false,
    "statusName": "Ready to plan",
    "orderDateTime": null,
    "chargeableExpenses": false,
    "lastChanged": null,
    "serviceContract": null,
    "createPerson": null,
    "externalId": null,
    "groups": null,
    "team": null,
    "typeCode": null,
    "createDateTime": "2018-08-30T11:26:12Z",
    "equipments": [],
    "startDateTime": "2017-07-25T08:00:36Z",
    "location": null,
    "udfValues": null,
    "lastChangedBy": null,
    "incident": null,
    "remarks": null,
    "originName": null
});

async function queryAPI(client) {
    const list = await client.query(
        `SELECT 
        bp.id, sc.id
        FROM
            BusinessPartner bp
            JOIN ServiceCall sc ON bp=sc.businessPartner
        LIMIT 3`,
        ['BusinessPartner', 'ServiceCall'])
        .then(r => (log('client.query', r.data), r.data));
    return list.length === 3;
}

async function dataAPI(client) {

    const THE_ID = fsm.CoreAPIClient.createUUID();

    // post
    const [r1] = await client.post('ServiceCall', {
        ...prepareFixture(),
        id: THE_ID,
        externalId: `test-cleanup-${THE_ID}`,
        subject: 'subject-changed-with-POST',
    }).then(r => (log('client.post', r.data), r.data));

    // get
    const [r2] = await client.getById('ServiceCall', THE_ID)
        .then(r => (log('client.getById', r.data), r.data));

    // put
    const [r3] = await client.put('ServiceCall', { ...r2.serviceCall, subject: 'subject-changed-with-PUT' })
        .then(r => (log('client.put', r.data), r.data));

    // patch
    const [r4] = await client.patch('ServiceCall', {
        id: THE_ID,
        subject: 'subject-changed-with-PATCH',
        lastChanged: r3.serviceCall.lastChanged
    }).then(r => (log('client.patch', r.data), r.data));


    // delete
    await client.deleteById('ServiceCall', { id: THE_ID, lastChanged: r4.serviceCall.lastChanged })
        .then(r => (log('client.deleteById', r.data), r.data));


    return THE_ID === r1.serviceCall.id
        && r1.serviceCall.id === r2.serviceCall.id
        && r3.serviceCall.subject === 'subject-changed-with-PUT'
        && r4.serviceCall.subject === 'subject-changed-with-PATCH'
}

async function batchAPI(client) {
    const id1 = fsm.CoreAPIClient.createUUID()
    const id2 = fsm.CoreAPIClient.createUUID()

    // create 
    const actions = [
        new fsm.CreateAction('ServiceCall', {
            ...prepareFixture(),
            id: id1,
            subject: `auto-cleanup`,
        }),
        new fsm.CreateAction('ServiceCall', {
            ...prepareFixture(),
            id: id2,
            subject: `auto-cleanup`,
        })
    ];

    const responses = await client.batch(actions)
        .then(r => (log('client.batch', r), r));

    const query = `select x from ServiceCall x where x.subject='auto-cleanup'`;
    const toDelete = await client.query(query, ['ServiceCall'])
        .then(r => r.data.map(it => it.x))

    // delete 
    await client.batch(toDelete.map(({ id, lastChanged }) => new fsm.DeleteAction('ServiceCall', { id, lastChanged })))
        .then(r => (log('client.batch', r), r));

    return responses.length === 2
        && responses[0].body.data[0].serviceCall.id === id1
        && responses[1].body.data[0].serviceCall.id === id2
}

async function runTests(config) {
    const client = new fsm.CoreAPIClient(config);

    const allResults = await Promise.all([
        queryAPI(client),
        dataAPI(client),
        batchAPI(client)
    ])

    if (allResults.some(r => r !== true)) {
        throw new Error('one or more tests failed');
    }
    return true;
}
