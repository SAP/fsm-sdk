# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] 2021-07-23
### Added
- Adding support for using client in browser (isomorphic), migrate from `node-fetch` to `isomorphic-fetch`
- Adding `user_id` to `OauthTokenResponse`
- Adding compatibility tests
### Updated 
- Updating down stream npm packages 


## [1.2.4] 2021-03-24
### Updated 
- Fix error handling, http errors `4xx/5xx` status throw `ErrorResponse`, `304` and `302` do not throw 

## [1.2.3] 2021-03-16
### Changed 
- Replace the deprecated request library with node-fetch

## [1.2.2] 2021-01-15
### Added
- Batch api support 
### Updated 
- DTO versions, removed CrowdBusinessPartner, CrowdAssignment, CrowdPerson DTO
### Changed
- internal refactoring

## [1.0.1] 2020-12-11
### Added
- public `setToken` and `getToken` to allow an already retrieved token
### Changed
- license to Apache-2.0