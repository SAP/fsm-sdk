# node fsm sdk to interface with coresystems apis and services.
Find more docs at https://docs.coresystems.net

## Getting started
```
npm i fsm-sdk --save
```

```typescript
const fsm = require('fsm-sdk');

const client = new fsm.CoreAPIClient({

  // debug: true  /* write oauth token to disk & provide verbose logs */

  // put your client config here
  clientIdentifier: '<your-clientIdentifier>',
  clientSecret: '<your-clientSecret>',
  clientVersion: '<your-clientVersion>',

  // put your auth config here
  authAccountName: '<your-authAccountName>',
  authUserName: '<your-authUserName>',
  authPassword: '<your-authPassword>',

});
```

related:
- https://docs.coresystems.net/api/oauth.html
- https://docs.coresystems.net/admin/account.html#wow6

## CoreAPIClient

CoreAPIClient will return a Promise and is async by default.

### Query for objects using CoreSQL 

providing the [coreSQL] and the [dtos] used in the query
see [https://docs.coresystems.net/api/query-api.html](https://docs.coresystems.net/api/query-api.html)

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

see [https://docs.coresystems.net/api/data-model.html](https://docs.coresystems.net/api/data-model.html)

#### create a new object
```typescript
const serviceCall = { 
   id: fsm.CoreAPIClient.createUUID(), // => 36A5626F65A54FE7911F536C501D151A
   ... 
};

await client.post('ServiceCall', serviceCall);
```

#### read object by id
```typescript
await client.getById('ServiceCall', '36A5626F65A54FE7911F536C501D151A');
```

#### update object (providing full new version)
```typescript
await client.put('ServiceCall', { ... });
```

#### update object (providing only fields to change)
```typescript
await client.patch('ServiceCall', {
    id: '36A5626F65A54FE7911F536C501D151A',
    subject: 'update-only-subject',
    lastChanged: 1535712340
  });
```

#### delete object
```typescript
await client.deleteById('ServiceCall', {
    id: '36A5626F65A54FE7911F536C501D151A',
    lastChanged: 1535712340
  });
```

##### lastChanged

The `lastChanged`-field is used for optimistic locking.
It's like a version-key you have to provide in order to update an object.
