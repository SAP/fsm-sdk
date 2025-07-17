import { v4 as uuid } from 'uuid';
import { ALL_DTO_VERSIONS } from './all-dto-versions.constant';
import { DTOName } from './dto-name.model';

export class RequestOptionsFactory {

  public static getUUID(): string {
    return uuid().replace(/\-/g, '');
  }

  public static stringify(o: { [key: string]: any }): string {
    return Object.keys(o).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(o[key])}`).join('&');
  }

  public static getDataApiUriFor(baseUrl:string, resourceName: DTOName, resourceId: string | null = null, externalId: string | null = null) {

    const identifier = [
      (resourceId ? `/${resourceId}` : '').trim(),
      (externalId && !resourceId ? `/externalId/${externalId}` : '').trim()
    ].join('').trim();

    return `${baseUrl}/api/data/v4/${resourceName}${identifier}`;
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

  public static getRequestXHeaders(config: { clientIdentifier: string, clientVersion: string }) {
    const requestId = uuid().replace(/\-/g, '');
    return {
      'X-Client-Id': config.clientIdentifier,
      'X-Client-Version': config.clientVersion,
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

  public static getRequestAccountQueryParams(token: Partial<{ companies: Partial<{ name: string }>[] }>, config: Partial<{ authAccountName: string, authUserName: string, authCompany: string }>) {

    const [firstCompany] = token.companies || [];

    const company = config.authCompany
      ? config.authCompany
      : firstCompany?.name;

    return {
      company,
      account: config.authAccountName,
      user: config.authUserName,
    }
  }
}