import { ClientConfig } from '../client-config.model';
import { HttpService } from '../http/http-service';
import { OAuthService } from '../oauth/oauth.service';
import { ActivityAPI } from './activity-api.service';
import { CompositeBulkAPI } from './composite-bulk-api.service';
import { CompositeTreeAPI } from './composite-tree-api.service';



export class ServiceManagementAPIService {

    public activity: ActivityAPI;
    public composite: {
        tree: CompositeTreeAPI,
        bulk: CompositeBulkAPI,
    }

    constructor(
        private _config: Readonly<ClientConfig>,
        private _http: Readonly<HttpService>,
        private _auth: Readonly<OAuthService>
    ) {
        this.activity = new ActivityAPI(this._config, this._http, this._auth)
        this.composite = {
            tree: new CompositeTreeAPI(this._config, this._http, this._auth),
            bulk: new CompositeBulkAPI(this._config, this._http, this._auth),
        }
    }

}