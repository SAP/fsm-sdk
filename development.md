# Development

# local development

```bash
npm i 
````

For local development provide a `.env`-file containing a valid a fsm account.

Example:
```bash
AUTH_ACCOUNTNAME=fsm-sdk-e2e
AUTH_USERNAME=<insert-value>
AUTH_GRANT_TYPE=password
AUTH_PASSWORD=<insert-value>
CLIENT_IDENTIFIER=<insert-value>
CLIENT_SECRET=<insert-value>
OAUTH_ENDPOINT=https://qt.dev.coresuite.com/api/oauth2/v1
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