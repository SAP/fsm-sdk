# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] 2025-12-19

### BREAKING CHANGES

#### CoreAPIClient API Structure
The SDK has been restructured with dedicated service accessors to improve organization and maintainability:

**Before (v3.x):**
```typescript
await client.getAccounts();
await client.getCompaniesByAccount(accountId);
```

**After (v4.x):**
```typescript
await client.accountAPI.getAccounts();
await client.accountAPI.getCompaniesByAccount(accountId);
```

#### Migration Guide from v3 to v4

1. **Account Operations** - Now accessed via `accountAPI`:
   - `client.getAccounts()` → `client.accountAPI.getAccounts()`
   - `client.getCompaniesByAccount(id)` → `client.accountAPI.getCompaniesByAccount(id)`

2. **Service Management Operations** - Now accessed via `serviceManagementAPI`:
   - Use `client.serviceManagementAPI.activity.*` for activity operations
   - Use `client.serviceManagementAPI.serviceCall.*` for service call operations
   - Use `client.serviceManagementAPI.composite.*` for composite operations

3. **Translation Operations** - Now accessed via `translationAPI`:
   - Use `client.translationAPI.*` for translation label and value operations

4. **Data Cloud (Legacy)** - Now accessed via `dataServiceAPI` (deprecated):
   - `client.query()` → `client.dataServiceAPI.query()`
   - `client.post()` → `client.dataServiceAPI.post()`
   - `client.getById()` → `client.dataServiceAPI.getById()`
   - All other CRUD operations now use `client.dataServiceAPI.*`
### Added
- Service Management API support with new service accessor `serviceManagementAPI` on `CoreAPIClient`.
  - `ActivityAPI` with business actions: `cancel`, `close`, `duplicate`, `plan`, `release`, `replan`, `reschedule`
  - `ActivityBulkAPI` with 19 bulk operations including: `cancel`, `close`, `duplicate`, `plan`, `release`, `replan`, `reschedule`, and more
  - `ServiceCallAPI` with business actions: `cancel`, `technicallyComplete`
  - `CompositeTreeAPI` for service calls with nested activities
  - `CompositeBulkAPI` for bulk service call operations
- Account API support with new service accessor `accountAPI` on `CoreAPIClient`.
  - `getAccounts()` - Retrieve all accessible accounts
  - `getCompaniesByAccount(accountId)` - Retrieve companies by account ID
- Translation API support with new service accessor `translationAPI` on `CoreAPIClient`.
  - Label and value operations for managing translations
- Public `getToken()`, `setToken(token)`, and `setAuthCompany(companyName)` methods to `CoreAPIClient` for improved token management and multi-company support.
- New `authCompany` property in `ClientConfig` type for specifying the company to use for authentication when the token contains multiple companies.
- Comprehensive JSDoc documentation for all public methods and APIs.

### Changed
- **BREAKING**: Replaced direct CRUD methods on `CoreAPIClient` with dedicated service accessors:
  - Use `client.serviceManagementAPI.*` for Service Management operations (replaces legacy data cloud methods)
  - Use `client.accountAPI.*` for Account operations
  - Use `client.translationAPI.*` for Translation operations
  - Legacy `client.dataServiceAPI` is now deprecated (see Deprecated section)
- Updated TypeScript and Rollup configuration for modern JavaScript output and improved bundling.

### Deprecated
- `dataServiceAPI` - The Data Service API (Data Cloud) is deprecated. Migrate to Service Management API for service call and activity operations.

### Fixed
- Fixed Mocha test discovery to include all `.spec.ts` files in subfolders.


## [3.0.0] 2025-06-18
### Updated & Added
- (breaking change) Updated ClientConfig to support setting `baseUrl` that is used to determine the FSM cluster, the cluster is not determined by the FSM token.
- (breaking change) Updated Support for OAuth API v2, client credential and password flows, default `oauthEndpoint` changed. 
- (breaking change) Removed support browser based bundle.
- (breaking change) NodeJs v23 LTS is now required.
- Updated Public `getToken()`, `setToken(token)`, and `setAuthCompany(companyName)` methods to `CoreAPIClient` for improved token management and multi-company support.
- Adding `getAccounts()` and `getCompaniesByAccount(accountId)` to interact with the AccountAPI

## [2.1.1] 2021-10-13
### Updated & Added
- Updated DTOs versions [ [ref](https://github.com/SAP/fsm-sdk/pull/17) ]

## [2.1.0] 2021-09-16
### Added
- Support `getByExternalId`, `postByExternalId`, `patchByExternalId`, `putByExternalId`, `deleteByExternalId`  for working with external ids
- `login()` to used oauth api stand alone
- More links to docs 
- Adding missing DTOs

### Updated 
- DTO versions updates
- Updating down stream npm packages - High vulnerability [ [ref](https://npmjs.com/advisories/1781 ]

## [2.0.1] 2021-08-05
### Added
- Adding token expiration and refresh as proposed by Tobias Wymer ( [@tswymer](https://github.com/tswymer) ) on [ [ref](https://github.com/SAP/fsm-sdk/pull/11) ]
- Adding `tenant_id`, `personId` and `permissionGroupId` to `OauthTokenResponse`
### Changed 
- Internal refactoring facade public client API
### Updated 
- Updating down stream npm packages - High vulnerability [ [ref](https://npmjs.com/advisories/1770) ]

## [2.0.0] 2021-07-26
### Changed
- **BREAKING** Dropping support for Node.js < v12, sdk now requires Node.js v12 or newer 
### Added
- Adding support for using client in browser (isomorphic), migrate from `node-fetch` to `isomorphic-fetch` as proposed by Andrei Vishnevsky ( [@VishnAndr](https://github.com/VishnAndr) ) on [ [ref](https://github.com/SAP/fsm-sdk/pull/9) ]
- **BREAKING** Adding `user_id` to `OauthTokenResponse`
- Adding compatibility tests
### Updated 
- Updating down stream npm packages 


## [1.2.4] 2021-03-24
### Updated 
- Fix error handling, http errors `4xx/5xx` status throw `ErrorResponse`, `304` and `302` do not throw 

## [1.2.3] 2021-03-16
### Changed 
- Replace the deprecated `request` library with `node-fetch`

## [1.2.2] 2021-01-15
### Added
- Batch api support 
### Updated 
- DTO versions, removed `CrowdBusinessPartner`, `CrowdAssignment`, `CrowdPerson` DTO
### Changed
- internal refactoring

## [1.0.1] 2020-12-11
### Added
- public `setToken` and `getToken` to allow an already retrieved token
### Changed
- license to Apache-2.0