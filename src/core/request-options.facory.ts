import _crypto = require('crypto');
import { ALL_DTO_VERSIONS } from './all-dto-versions.constant';
import { ClientConfig } from './client-config.model';
import { DTOName } from './dto-name.model';
import { OauthTokenResponse } from './oauth-token-response.model';

export class RequestOptionsFacory {

  public static getDataApiUriFor(token: OauthTokenResponse, dtoName: DTOName, dtoId: string | null = null) {
    return `${token.cluster_url}/api/data/v4/${dtoName}${(dtoId ? `/${dtoId}` : '')}`
  }

  /**
   * map of DTO objects and versions 
   * { ['<DTOName>']: number }
   * Note: DTOName is case sensitiv
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

  public static getRequestXHeaders(config: ClientConfig) {
    const requestId = _crypto.randomBytes(16).toString('hex');
    return {
      'X-Client-Id': config.clientIdentifier,
      'X-Client-Version': config.clientVersion,
      'X-Request-ID': requestId,
      'X-B3-TraceId': requestId
    }
  }

  public static getRequestHeaders(token: OauthTokenResponse, config: ClientConfig) {
    return {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Accept': 'application/json',
      ...RequestOptionsFacory.getRequestXHeaders(config)
    }
  }

  public static _getRequestAccountQueryParams(token: OauthTokenResponse, config: ClientConfig) {
    if (!token.companies || !token.companies.length) {
      throw new Error('no compnay found on given account');
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