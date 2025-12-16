# Development

## Local Development Setup

```bash
npm install
```

For local development, provide a `.env` file containing valid FSM account credentials.

### Environment Configuration

Example `.env` file:
```bash
CLIENT_IDENTIFIER=<insert-value>
CLIENT_SECRET=<insert-value>
OAUTH_ENDPOINT=https://qt.fsm-dev.cloud.sap/api/oauth2/v2
BASE_URL=https://qt.fsm-dev.cloud.sap

AUTH_ACCOUNT_NAME=fsm-sdk-e2e
AUTH_COMPANY_NAME=<insert-value>
AUTH_USERNAME=<insert-value>
AUTH_PASSWORD=<insert-value>
AUTH_GRANT_TYPE=password

# Optional: Debug mode for tests
DEBUG_TESTS=false
```

## Running Tests

Run tests in TDD style:

```bash
npm run test
```

Run specific test files:
```bash
npm run test -- --grep "RulesAPI"
```

## Building

Build for Node.js:
```bash
npm run build:node
```

Build for all targets:
```bash
npm run build
```

## Running Examples

```bash
npm run start:examples
```

## Updating DTO Versions and Models

### Step 1: Update DTO Versions

Run the update tool:
```bash
npm run tools:update-dto-versions
```

### Step 2: Copy Versioned Values

Copy the versioned values into:
- `src/core/data-service/batch/batch-action.model.ts`
- `src/core/data-service/all-dto-versions.constant.ts`

## Project Structure

```
src/
├── core-api.client.ts          # Main SDK entry point
├── index.ts                     # Public API exports
├── core/
│   ├── account/                 # Account API
│   ├── data-service/            # Legacy Data Cloud API (deprecated)
│   ├── rules/                   # Rules API
│   ├── service-management/      # Service Management API
│   └── translations/            # Translation API
└── test/
    ├── e2e/                     # End-to-end tests
    ├── unit/                    # Unit tests
    └── isomorphic/              # Browser compatibility tests
```

## Adding New APIs

When implementing a new API service:

1. Create model file: `src/core/<api-name>/<api-name>.model.ts`
2. Create service file: `src/core/<api-name>/<api-name>-api.service.ts`
3. Add import and property in `src/core-api.client.ts`
4. Initialize in constructor
5. Add public getter method
6. Export types from `src/index.ts`
7. Update documentation (README.md, CHANGELOG.md, copilot-instructions.md)
8. Create E2E tests in `src/test/e2e/<api-name>/`
9. Create example in `examples/node/`

## Code Style

- Use arrow functions: `() => {}`
- Use `assert` from Node.js for tests (not chai)
- Follow existing patterns in service-management and rules APIs
- Add JSDoc comments for all public methods
- Include TypeScript types for all parameters and return values