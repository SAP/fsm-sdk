import request = require('request-promise-native');
import { v4 as uuid } from 'uuid';
import _crypto = require('crypto');
import fs = require('fs');
import path = require('path');

import { DTOName, DTOModels } from './model/DTOModels';
import { ClientConfig } from './model/ClientConfig';
import { OauthTokenResponse } from './model/OauthTokenResponse';
import { ClientResponse } from './model/ClientResponse';

export class CoreAPIClient {

  private _token: OauthTokenResponse | undefined;
  private _config: ClientConfig = {
    debug: false,

    oauthEndpoint: 'https://ds.coresuite.com/api/oauth2/v1',
    tokenCacheFilePath: undefined,

    clientIdentifier: '<your-clientIdentifier>',
    clientSecret: '<your-clientSecret>',
    clientVersion: '<your-clientVersion>',

    authAccountName: '<your-authAccountName>',
    authUserName: '<your-authUserName>',
    authPassword: '<your-authPassword>',
  }

  /**
   *
   * @param _config ClientConfig {
   *   debug: boolean | undefined;
   *   tokenCacheFilePath: string | undefined;
   *
   *   oauthEndpoint: string;
   *
   *   clientIdentifier: string;
   *   clientSecret: string;
   *   clientVersion: string;
   *
   *   authAccountName: string;
   *   authUserName: string;
   *   authPassword: string;
   *  }
   */
  constructor(config: ClientConfig) {
    this._config = Object.assign(this._config, config);
  }

  /**
   *  https://docs.coresystems.net/api/oauth.html
   */
  private _fetchAndSaveToken() {
    const basicAuth = new Buffer(`${this._config.clientIdentifier}:${this._config.clientSecret}`).toString('base64');
    return this._httpCRUDRequest({
      method: 'POST',
      uri: `${this._config.oauthEndpoint}/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        ...this._getRequestXHeaders()
      },
      form: {
        grant_type: 'password',
        username: `${this._config.authAccountName}/${this._config.authUserName}`,
        password: this._config.authPassword
      }
    })
      .then((response: string) => {
        if (this._config.debug && this._config.tokenCacheFilePath) {
          fs.writeFileSync(this._config.tokenCacheFilePath, response);
        }
        return JSON.parse(response);
      });
  };

  private _readToken(): Promise<OauthTokenResponse> {
    return new Promise((resolve, fail) => {
      if (this._config.debug && this._config.tokenCacheFilePath) {
        return resolve(require(path.resolve(this._config.tokenCacheFilePath)))
      }
      fail({ code: 'MODULE_NOT_FOUND' });
    })
      .catch(error => {
        if (error.code === 'MODULE_NOT_FOUND') {
          return this._fetchAndSaveToken()
        }
        throw error;
      });
  };

  private _ensureToken(): Promise<OauthTokenResponse> {
    return this._token
      ? Promise.resolve(this._token)
      : this._readToken()
        .then(token => {
          this._token = token;
          return this._token;
        });
  };

  private _getVersionsParam(DTONames: DTOName[]): string {

    const ALL_DTO_VERSIONS: { [name: string]: number } = {
      'Activity': 23,
      'ActivitySubType': 14,
      'Approval': 13,
      'Attachment': 16,
      'Address': 17,
      'BusinessPartner': 20,
      'BusinessPartnerGroup': 14,
      'BusinessProcessStepDefinition': 15,
      'ChecklistInstance': 17,
      'ChecklistInstanceElement': 12,
      'ChecklistCategory': 10,
      'ChecklistTemplate': 17,
      'ChecklistTag': 8,
      'Currency': 11,
      'CustomRule': 8,
      'Contact': 15,
      'CompanyInfo': 15,
      'CompanySettings': 11,
      'EmployeeBranch': 9,
      'EmployeeDepartment': 9,
      'EmployeePosition': 9,
      'Enumeration': 10,
      'Equipment': 16,
      'Expense': 15,
      'ExpenseType': 15,
      'Filter': 11,
      'Function': 8,
      'Group': 13,
      'Icon': 8,
      'Item': 21,
      'ItemGroup': 10,
      'ItemPriceListAssignment': 14,
      'Material': 18,
      'Mileage': 16,
      'MileageType': 14,
      'PaymentTerm': 14,
      'Person': 18,
      'PersonReservation': 15,
      'PersonReservationType': 15,
      'PersonWorkTimePattern': 8,
      'Plugin': 8,
      'Project': 10,
      'ProjectPhase': 10,
      'PriceList': 14,
      'ProfileObject': 22,
      'ReportTemplate': 15,
      'Requirement': 8,
      'ReservedMaterial': 16,
      'ScreenConfiguration': 8,
      'ServiceAssignment': 24,
      'ServiceAssignmentStatus': 12,
      'ServiceAssignmentStatusDefinition': 14,
      'ServiceCall': 24,
      'ServiceCallProblemType': 13,
      'ServiceCallStatus': 13,
      'ServiceCallType': 12,
      'ServiceCallSubject': 12,
      'ServiceCallCode': 12,
      'ServiceCallResponsible': 12,
      'ServiceCallOrigin': 13,
      'Skill': 8,
      'Team': 8,
      'TeamTimeFrame': 8,
      'Tag': 8,
      'Tax': 9,
      'TimeEffort': 15,
      'TimeTask': 16,
      'TimeSubTask': 14,
      'Translation': 8,
      'UdfMeta': 13,
      'UdfMetaGroup': 10,
      'UserSyncConfirmation': 13,
      'Warehouse': 15,
      'WorkTimeTask': 15,
      'WorkTimePattern': 8,
      'WorkTime': 15,
      'CrowdBusinessPartner': 8,
      'CrowdAssignment': 8,
      'Notification': 8,
      'CrowdExecutionRecord': 8,
      'CrowdPerson': 8,
      'UnifiedPerson': 8
    };

    return DTONames
      .map(name => {
        if (!ALL_DTO_VERSIONS[name]) {
          throw new Error(`no DTO version found for ${name}`);
        }
        return `${name}.${ALL_DTO_VERSIONS[name]}`;
      }).join(';');
  }

  private _getRequestXHeaders() {
    return {
      'X-Client-Id': this._config.clientIdentifier,
      'X-Client-Version': this._config.clientVersion,
      'X-Request-ID': _crypto.randomBytes(16).toString('hex')
    }
  }

  private _getRequestHeaders(token: OauthTokenResponse) {
    return {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Accept': 'application/json',
      ...this._getRequestXHeaders()
    }
  }

  private _getRequestAccountQueryParams(token: OauthTokenResponse) {
    if (!token.companies || !token.companies.length) {
      throw new Error('no compnay found on given account');
    }
    const [selectedCompany] = token.companies;
    return {
      account: this._config.authAccountName,
      user: this._config.authUserName,
      company: selectedCompany.name,
    }
  }


  private _httpCRUDRequest(opt: request.Options) {
    if (this._config.debug) {
      console.log(`[httpRequest] outgoing options[${JSON.stringify(opt, null, 2)}]`);
    }
    return request(opt)
      .then(response => {
        if (this._config.debug) {
          console.log(`[httpRequest] incoming going options[${JSON.stringify(opt, null, 2)}] response[${JSON.stringify(response, null, 2)}]`);
        }
        return response;
      });
  }

  private _DataApiCRUDRequest<T extends DTOModels>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    resourceName: DTOName,
    resource: T | null | any,
    resourceId: string | null = null,
    additionalQs: { [k: string]: string | number | boolean } = {}
  ) {
    return this._ensureToken()
      .then(token => this._httpCRUDRequest({
        method,
        uri: `${token.cluster_url}/api/data/v4/${resourceName}${(resourceId ? `/${resourceId}` : '')}`,
        headers: this._getRequestHeaders(token),
        qs: Object.assign({},
          this._getRequestAccountQueryParams(token),
          method !== 'DELETE' ? { dtos: this._getVersionsParam([resourceName]) } : undefined,
          additionalQs),
        json: resource
      }));
  }

  /**
  * returns a uuid that can be used as object id
  */
  public static createUUID(): string {
    return uuid().replace(/\-/g, '').toUpperCase();
  }

  /**
   * Here, you can input and execute the CoreSQL query.
   * https://docs.coresystems.net/api/query-api.html
   * https://docs.coresystems.net/admin/query-api.html#wow3
   * @param coreSQL
   * @param resourceNames
   */
  public query<T>(coreSQL: string, resourceNames: DTOName[]): Promise<ClientResponse<T>> {
    return this._ensureToken()
      .then(token => this._httpCRUDRequest(
        {
          method: 'POST',
          uri: `${token.cluster_url}/api/query/v1`,
          headers: this._getRequestHeaders(token),
          qs: {
            ... this._getRequestAccountQueryParams(token),
            dtos: this._getVersionsParam(resourceNames)
          },
          json: { query: coreSQL }
        }));
  }

  /**
   * Retrieving Lists of Objects
   * https://docs.coresystems.net/api/reference.html
   * @param resourceName resourceName
   * @param resourceId uuid
   */
  public getById<T extends DTOModels>(resourceName: DTOName, resourceId: string): Promise<ClientResponse<T>> {
    return this._DataApiCRUDRequest('GET', resourceName, null, resourceId)
      .then(response => typeof response === 'string' ? JSON.parse(response) : response); // not sending json headers
  }

  public deleteById<T extends Partial<DTOModels>>(resourceName: DTOName, resource: { id: string, lastChanged: number }): Promise<undefined> {
    const { id, lastChanged } = resource;
    return this._DataApiCRUDRequest('DELETE', resourceName, null, id, { lastChanged });
  }

  /**
   * Creating Objects
   * https://docs.coresystems.net/api/reference.html
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   */
  public post<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    return this._DataApiCRUDRequest('POST', resourceName, resource);
  }

  /**
   * Updating Existing Objects
   * https://docs.coresystems.net/api/reference.html
   * @param resourceName resourceName
   * @param resource should contain in the body the ENTIRE updated resource
   */
  public put<T extends DTOModels>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    const { id } = resource;
    return this._DataApiCRUDRequest('PUT', resourceName, resource, id);
  }

  /**
   * Updating Existing Objects
   * https://docs.coresystems.net/api/reference.html
   * should contain in the body the entire updated resource
   * @param resourceName resourceName
   * @param resource should contain in the body the FIELDS THAT YOU WANT TO UPDATE
   */
  public patch<T extends Partial<DTOModels>>(resourceName: DTOName, resource: T): Promise<ClientResponse<T>> {
    const { id } = resource;
    return this._DataApiCRUDRequest('PATCH', resourceName, resource, id);
  }

}
