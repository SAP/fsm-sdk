# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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