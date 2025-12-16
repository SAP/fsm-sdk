# FSM SDK Copilot Instructions

## Project Overview

This is a TypeScript SDK for SAP Field Service Management (FSM) APIs. It provides a Node.js client library that interfaces with FSM's REST APIs for managing service calls, activities, and other field service operations. The SDK supports both browser and Node.js environments (isomorphic).

## Architecture

### Core Client Structure

- **CoreAPIClient**: Main entry point at [src/core-api.client.ts](../src/core-api.client.ts)
  - Instantiated with `ClientConfig` containing authentication credentials and OAuth settings
  - Exposes specialized API services: `serviceManagementAPI`, `dataServiceAPI`, `accountAPI`, `translationAPI`
  - Manages OAuth authentication internally via `OAuthService`

### API Service Hierarchy

1. **Service Management API** (preferred, modern): `client.serviceManagementAPI`
   - `activity`: Activity business actions (cancel, close, duplicate, plan)
   - `serviceCall`: Service call operations
   - `composite.tree`: Composite tree operations
   - `composite.bulk`: Bulk composite operations

2. **Rules API**: `client.rulesAPI`
   - Business rule management: create, update, query rules
   - Execution record tracking and monitoring
   - Supports filtering by event type, object type, health state

3. **Data Service API** (legacy, deprecated): `client.dataServiceAPI`
   - Legacy CRUD operations using Data Cloud DTOs
   - All methods marked `@deprecated` - use Service Management API instead
   - Still used for CoreSQL queries and batch operations

### Authentication Flow

- OAuth 2.0 with two grant types: `password` (user credentials) or `client_credentials` (service-to-service)
- Token caching supported via `tokenCacheFilePath` config option (useful for tests)
- Auto-login on first API call; explicit `client.login()` optional
- Tokens stored with expiration and auto-refreshed

## Key Patterns & Conventions

### UUID Generation

Use `CoreAPIClient.createUUID({ legacyFormat: true })` for FSM object IDs:
- `legacyFormat: true` (default): uppercase without dashes (e.g., `A1B2C3D4E5F6...`)
- `legacyFormat: false`: standard UUID format with dashes

### Batch Operations

Use action classes from [src/core/data-service/batch/batch-action.model.ts](../src/core/data-service/batch/batch-action.model.ts):

```typescript
const actions = [
  new CreateAction('ServiceCall', { id: CoreAPIClient.createUUID(), ...data }),
  new UpdateAction('ServiceCall', { id: existingId, ...updates }),
  new DeleteAction('ServiceCall', { id, lastChanged }) // lastChanged required for optimistic locking
];
await client.dataServiceAPI.batch(actions);
```

### DTO Versioning

DTO versions are in [src/core/data-service/all-dto-versions.constant.ts](../src/core/data-service/all-dto-versions.constant.ts). Update via:
```bash
npm run tools:update-dto-versions
```

### Optimistic Locking

Delete and update operations require `lastChanged` timestamp to prevent concurrent modification conflicts. Omit for force delete.

## Development Workflow

### Environment Setup

Create `.env` file with FSM credentials (see [development.md](../development.md)):
```bash
CLIENT_IDENTIFIER=<value>
CLIENT_SECRET=<value>
OAUTH_ENDPOINT=https://qt.fsm-dev.cloud.sap/api/oauth2/v2
BASE_URL=https://qt.fsm-dev.cloud.sap
AUTH_ACCOUNT_NAME=<account>
AUTH_COMPANY_NAME=<company>
AUTH_USERNAME=<username>
AUTH_PASSWORD=<password>
AUTH_GRANT_TYPE=password
```

### Build & Test

```bash
npm run build          # Build Node.js + browser bundles
npm run build:node     # TypeScript compilation to release/
npm run test           # Run mocha tests with nyc coverage
npm run start:examples # Run node examples with dotenv
```

- Tests located in `src/test/` with subdirs: `e2e/`, `unit/`, `isomorphic/`
- Test config at [src/test/integration-test.config.ts](../src/test/integration-test.config.ts) using `ClientConfigBuilder`
- Coverage thresholds: 90% statements, 50% branches, 90% functions/lines
- Test files: `src/**/*.spec.ts` (configured in [mocha.opts](../mocha.opts))

### TypeScript Configuration

- Target: ES2016, module: CommonJS
- Output: `release/` directory with `.d.ts` declarations
- Strict mode enabled with full type checking
- Source maps generated for debugging

## Common Pitfalls

1. **Don't use Data Service API for new code**: Methods like `query()`, `getById()`, `upsert()` are deprecated. Use Service Management API instead.

2. **Token caching in tests**: Set `tokenCacheFilePath: './coresystems-oauth2-token.json'` to avoid repeated OAuth calls during development.

3. **Grant type mismatch**: Ensure `authGrantType` matches your credentials. User credentials require `password` grant with `authUserName`/`authPassword`. Service accounts use `client_credentials`.

4. **DTO version updates**: When FSM APIs update, run `npm run tools:update-dto-versions` and manually copy values into `all-dto-versions.constant.ts` and batch request models.

5. **Isomorphic compatibility**: Avoid Node.js-specific APIs in core services. Use conditional requires (e.g., `require('fs')` inline) or polyfills in [src/polyfills.ts](../src/polyfills.ts).

## Testing Strategy

- E2E tests hit real FSM APIs using credentials from `.env`
- Tests create objects with `subject: 'auto-cleanup'` for easy test data removal
- Use `ClientConfigBuilder.getTestTimeout()` for API call timeouts
- Clean up test data via batch delete querying by subject name

## References

- [SAP FSM Documentation](https://help.sap.com/viewer/product/SAP_FIELD_SERVICE_MANAGEMENT/Cloud/en-US)
- [Integration Guidelines](https://help.sap.com/viewer/fsm_integration_guidelines/Cloud/en-US/integration-guidelines-intro.html)
- API Explorer: `https://api.sap.com/api/service_management_ext`
