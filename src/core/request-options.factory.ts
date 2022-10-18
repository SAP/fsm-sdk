import { v4 as uuid } from 'uuid';
import { ALL_DTO_VERSIONS } from './all-dto-versions.constant';
import { ClientConfig } from './config/client-config.model';
import { DTOName } from './api-clients/data-api/model/dto-name.model';
import { OAuthResponse } from './api-clients/oauth-api/oauth-response.model';

export class RequestOptionsFactory {

  public static getUUID(): string {
    return uuid().replace(/\-/g, '');
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

  public static getRequestAccountQueryParams(token: { companies: { name: string }[] }, config: ClientConfig) {
    if (!token.companies || !token.companies.length) {
      throw new Error('no company found on given account');
    }

    const [firstCompany] = token.companies;

    return {
      account: config.authAccountName,
      user: config.authUserName,

      company: config.authCompany
        ? config.authCompany
        : firstCompany.name,
    }
  }
}