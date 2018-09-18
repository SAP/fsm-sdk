# NodeJS FSM-SDK to Interface with Coresystems APIs and Services.
Find more documentation and related information at [Coresystems API Documentation](https://docs.coresystems.net/dev-index.html)

- [Getting started](#getting-started)
- [CoreAPIClient](#coreapiclient)
  * [Query for objects using CoreSQL](#query-for-objects-using-coresql)
  * [CRUD object](#crud-object)
    + [Create a new object](#create-a-new-object)
    + [Read object by id](#read-object-by-id)
    + [Update object (providing full new version)](#update-object--providing-full-new-version-)
    + [Update object (providing only fields to change)](#update-object--providing-only-fields-to-change-)
    + [Delete object](#delete-object)
      - [lastChanged](#lastchanged)

Some illustrative cases are provided in the [examples](https://github.com/coresystemsFSM/fsm-sdk/tree/master/examples) folder.

---

[![Build Status](https://travis-ci.org/coresystemsFSM/fsm-sdk.svg?branch=master)](https://travis-ci.org/coresystemsFSM/fsm-sdk) [![Coverage Status](https://coveralls.io/repos/github/coresystemsFSM/fsm-sdk/badge.svg?branch=master)](https://coveralls.io/github/coresystemsFSM/fsm-sdk?branch=master)


[![npm version](https://badge.fury.io/js/fsm-sdk.svg)](https://badge.fury.io/js/fsm-sdk)

## Getting started

install from NPM
```bash
npm i fsm-sdk --save
```

using the sdk with credentials:
```typescript
const fsm = require('fsm-sdk');

const client = new fsm.CoreAPIClient({

  // [mandatory] your client configuration
  clientIdentifier: '<your-clientIdentifier>',
  clientSecret: '<your-clientSecret>',
  clientVersion: '<your-clientVersion>',

  // [mandatory] your auth & account configuration
  authAccountName: '<your-authAccountName>',
  authUserName: '<your-authUserName>',
  authPassword: '<your-authPassword>',

  // [optional] provide verbose logs
  debug: true,

  // [optional] enable using custom oauthEndpoints
  oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',

  // [optional] client will cache token (helpful for writing integration tests)
  tokenCacheFilePath: './.myToken.json'

});
```

related doc's:
- [Generating Client ID and Secret](https://docs.coresystems.net/admin/account.html#wow7)
- [OAuth API Documentation](https://docs.coresystems.net/api/oauth.html#wow1)


---

## CoreAPIClient

The CoreAPIClient will return a Promise and is asynchronous by default.

### Query for objects using CoreSQL

Provides the [coreSQL] and the [dtos] used in the query
see [Query API Documentation](https://docs.coresystems.net/api/query-api.html)

```typescript

const coreSQL =
  `SELECT
    sc.id,
    sc.subject
  FROM
    ServiceCall sc
  WHERE
   sc.id = '36A5626F65A54FE7911F536C501D151A'
  `;

await client.query(coreSQL, ['ServiceCall']);
```

### CRUD object

related doc's:
- [Data Model Documentation](https://docs.coresystems.net/api/data-model.html)

#### Create a new object

```typescript
const serviceCall = {
   id: fsm.CoreAPIClient.createUUID(), // => 36A5626F65A54FE7911F536C501D151A
   ...
};

await client.post('ServiceCall', serviceCall);
```

#### Read object by id

```typescript
await client.getById('ServiceCall', '36A5626F65A54FE7911F536C501D151A');
```

#### Update object (providing full new version)

```typescript
await client.put('ServiceCall', { ... });
```

#### Update object (providing only fields to change)

```typescript
await client.patch('ServiceCall', {
    id: '36A5626F65A54FE7911F536C501D151A',
    subject: 'update-only-subject',
    lastChanged: 1535712340
  });
```

#### Delete object

```typescript
await client.deleteById('ServiceCall', {
    id: '36A5626F65A54FE7911F536C501D151A',
    lastChanged: 1535712340
  });
```

##### lastChanged

The `lastChanged` field is used for optimistic locking.
It's like a version-key you have to provide in order to update an object.
