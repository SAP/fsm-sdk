import { v4 as uuid } from 'uuid';
import { ALL_DTO_VERSIONS } from './data-service/all-dto-versions.constant';
import { DataCloudDTOName } from './data-service/dto-name.model';
import { OAuthTokenResponse } from './oauth/oauth-token-response.model';
import { ClientConfig } from './client-config.model';

export class RequestOptionsFactory {

  public static getUUID(legacyFormat: boolean): string {
    const id = uuid();
    return legacyFormat
      ? id.replace(/\-/g, '').toUpperCase()
      : id;
  }

  public static stringify(o: { [key: string]: any }): string {
    return Object.keys(o).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(o[key])}`).join('&');
  }

  private static getBaseUrl(config: Readonly<ClientConfig>) {
    return config.baseUrl;
  }

  public static getDataApiUriFor(config: Readonly<ClientConfig>, resourceName: DataCloudDTOName, resourceId: string | null = null, externalId: string | null = null) {

    const identifier = [
      (resourceId ? `/${resourceId}` : '').trim(),
      (externalId && !resourceId ? `/externalId/${externalId}` : '').trim()
    ].join('').trim();

    return `${this.getBaseUrl(config)}/api/data/v4/${resourceName}${identifier}`;
  }

  /**
   * map of DTO objects and versions 
   * { ['<DTOName>']: number }
   * Note: DTOName is case sensitive
   */
  public static getAllDTOVersions() {
    return ALL_DTO_VERSIONS;
  }

  public static getDTOVersionsString(DTONames: DataCloudDTOName[]): string {
    return DTONames
      .map(name => {
        if (!ALL_DTO_VERSIONS[name]) {
          throw new Error(`no DTO version found for ${name}`);
        }
        return `${name}.${ALL_DTO_VERSIONS[name]}`;
      }).join(';');
  }

  public static getRequestXHeaders(config: Readonly<ClientConfig>) {
    const requestId = uuid().replace(/\-/g, '');
    return {
      'X-Client-Id': config.clientIdentifier || 'unknown',
      'X-Client-Version': config.clientVersion || 'unknown',
      'X-Request-ID': requestId,
      'X-B3-TraceId': requestId,
    }
  }

  private static getContextXHeaders(token: Readonly<OAuthTokenResponse>, config: Readonly<ClientConfig>) {
    const { accountId, accountName, companyId, companyName, userId, } = this.resolveContext(token, config);
    return Object.entries({
      'X-Account-Id': accountId,
      'X-Account-Name': accountName,
      'X-Company-Id': companyId,
      'X-Company-Name': companyName,
      'X-User-Id': userId,
    }).reduce((headers, [key, value]) => (!value ? headers : { ...headers, [key]: value }), {});
  }


  private static getRequestContentType() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  public static getRequestHeaders(token: OAuthTokenResponse, config: Readonly<ClientConfig>) {
    return {
      'Authorization': `${token.token_type} ${token.access_token}`,
      ...this.getRequestXHeaders(config),
      ...this.getContextXHeaders(token, config),
      ...this.getRequestContentType(),
    }
  }

  private static resolveContext(token: Readonly<OAuthTokenResponse>, config: Readonly<ClientConfig>) {

    const companies = token.contentType === 'user'
      && token.content.companies || []; // todo: find a way to provide companies for other content types

    // will pick company by config.authCompany or first company in the list 
    const selcetedCompany = !!config.authCompany
      ? companies.find(c => c.name === config.authCompany)
      : companies[0];

    const companyName = selcetedCompany
      ? selcetedCompany.name
      : config.authCompany

    const companyId = selcetedCompany
      ? selcetedCompany.id
      : undefined; // todo find a way to provide companyId for other content types

    const userName = config.authUserName
      ? config.authUserName
      : token.contentType === 'user'
        ? token.content.user_name
        : undefined;

    const userId = token.contentType === 'user'
      ? token.content.user_id
      : undefined; // todo find a way to provide userId for other content types

    const accountName = config.authAccountName;

    const accountId = token.contentType === 'user'
      ? token.content.account_id
      : undefined; // todo find a way to provide accountId for other content types

    return {
      accountId,
      accountName,
      companyId,
      companyName,
      userId,
      userName
    }
  }

  public static getRequestAccountQueryParams(token: Readonly<OAuthTokenResponse>, config: Readonly<ClientConfig>) {
    const { companyName, userName, accountName } = RequestOptionsFactory.resolveContext(token, config);
    return {
      user: userName,
      company: companyName,
      account: accountName,
    }
  }
}