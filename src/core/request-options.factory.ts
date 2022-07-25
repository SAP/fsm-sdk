import { v4 as uuid } from 'uuid';
import { ALL_DTO_VERSIONS } from './all-dto-versions.constant';
import { ClientConfig } from './client-config.model';
import { DTOName } from './api-clients/data-api/model/dto-name.model';
import { OAuthResponse } from './oauth/oauth-response.model';

export class RequestOptionsFactory {

  public static getUUID(): string {
    return uuid().replace(/\-/g, '');
  }

  public static stringify(o: { [key: string]: any }): string {
    return Object.keys(o).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(o[key])}`).join('&');
  }

  public static getDataApiUriFor(token: OAuthResponse, resourceName: DTOName, resourceId: string | null = null, externalId: string | null = null) {

    const identifier = [
      (resourceId ? `/${resourceId}` : '').trim(),
      (externalId && !resourceId ? `/externalId/${externalId}` : '').trim()
    ].join('').trim();

    return `${token.cluster_url}/api/data/v4/${resourceName}${identifier}`;
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

  public static getRequestXHeaders(config: ClientConfig) {
    const requestId = uuid().replace(/\-/g, '');
    return {
      'X-Client-Id': config.clientIdentifier,
      'X-Client-Version': config.clientVersion,
      'X-Request-ID': requestId,
      'X-B3-TraceId': requestId
    }
  }

  public static getRequestHeaders(token: OAuthResponse, config: ClientConfig) {
    return {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Accept': 'application/json',
      ...RequestOptionsFactory.getRequestXHeaders(config)
    }
  }

  public static getRequestAccountQueryParams(token: OAuthResponse, config: ClientConfig) {
    if (!token.companies || !token.companies.length) {
      throw new Error('no company found on given account');
    }

    const [selectedCompany] = token.companies;

    return {
      account: config.authAccountName,
      user: config.authUserName,
      company: config.authCompany
        ? config.authCompany
        : selectedCompany.name,
    }
  }
}