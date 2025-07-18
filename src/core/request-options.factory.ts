import { v4 as uuid } from 'uuid';
import { ALL_DTO_VERSIONS } from './all-dto-versions.constant';
import { DTOName } from './dto-name.model';
import { OAuthTokenResponse } from './oauth/oauth-token-response.model';
import { ClientConfig } from './client-config.model';

export class RequestOptionsFactory {

  public static getUUID(): string {
    return uuid().replace(/\-/g, '');
  }

  public static stringify(o: { [key: string]: any }): string {
    return Object.keys(o).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(o[key])}`).join('&');
  }

  private static getBaseUrl(config: Readonly<ClientConfig>) {
    return config.baseUrl;
  }

  public static getDataApiUriFor(config: Readonly<ClientConfig>, resourceName: DTOName, resourceId: string | null = null, externalId: string | null = null) {

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

  public static getDTOVersionsString(DTONames: DTOName[]): string {
    return DTONames
      .map(name => {
        if (!ALL_DTO_VERSIONS[name]) {
          throw new Error(`no DTO version found for ${name}`);
        }
        return `${name}.${ALL_DTO_VERSIONS[name]}`;
      }).join(';');
  }

  public static getRequestXHeaders(config: Partial<{ clientIdentifier: string, clientVersion: string }>) {
    const requestId = uuid().replace(/\-/g, '');
    return {
      'X-Client-Id': config.clientIdentifier || 'unknown',
      'X-Client-Version': config.clientVersion || 'unknown',
      'X-Request-ID': requestId,
      'X-B3-TraceId': requestId
    }
  }

  public static getRequestHeaders(token: { token_type: string, access_token: string }, config: { clientIdentifier: string, clientVersion: string }) {
    return {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Accept': 'application/json',
      ...RequestOptionsFactory.getRequestXHeaders(config)
    }
  }

  public static getRequestAccountQueryParams(token: OAuthTokenResponse,
    config: Partial<{ authAccountName: string, authUserName: string, authCompany: string }>) {

    const [firstCompany] = token.contentType === 'user'
      && token.content.companies || [];

    const company: string | undefined = config.authCompany
      ? config.authCompany
      : firstCompany?.name;

    const user = config.authUserName
      ? config.authUserName
      : token.contentType === 'user'
        ? token.content.user_name
        : undefined;

    return {
      user,
      company,
      account: config.authAccountName,
    }
  }
}