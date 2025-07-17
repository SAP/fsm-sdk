# Development

# local development

```bash
npm i 
````

For local development provide a `.env`-file containing a valid a fsm account.

Example:
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

DEBUG_TESTS=false
```

then tdd-style run

```bash 
npm run test
```

# updating DTO versions and models

## 1.
run
```bash
npm run tools:update-dto-versions
```
## 2. copy versioned values into
- src/core/batch-request.model.ts
- src/core/all-dto-versions.constant.ts