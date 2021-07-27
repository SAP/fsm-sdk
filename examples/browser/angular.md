# Usage in Angular

> npm i fsm-sdk --save

Add the umd bundle to angular cli config
```typescript
// angular.json
{
    "options": {
        ...
        "scripts": [
            "node_modules/fsm-sdk/release/umd/fsm-sdk.bundle.js"
        ]
    }
}
```

Example usage in angular client factory: 
```typescript 
// fsm-api-client.factory.ts

import { Injectable } from '@angular/core';
import { CoreAPIClient } from 'fsm-sdk';
declare var fsm: { CoreAPIClient: typeof CoreAPIClient }

@Injectable({
    providedIn: 'root'
})
export class FsmAPIClientFactory {

    // hook to login form
    public create(data: { account: string, user: string, password: string }): CoreAPIClient {
        return new fsm.CoreAPIClient({
            "clientIdentifier": environment.clientIdentifier,
            "clientSecret": environment.clientSecret
            "clientVersion": environment.appVersion,
            "authAccountName": data.account,
            "authUserName": data.user,
            "authPassword": data.password
        });
    }

    // store token state in storage
    public getToken(client: CoreAPIClient): OauthTokenResponse {
        return client.getToken(); 
    }

    // load token from storage to recreate client session
    public fromToken(token: OauthTokenResponse): CoreAPIClient {
        return this.create({ account: null, user: null, password: null }).setToken(token);
    }

}
```