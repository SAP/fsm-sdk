import { DTOModels } from './dto-name.model';

type Maybe<T> = T | undefined;

export interface BatchResponseJson<T> {
  body: { data: { [dtoName: string]: T }[] };
  statusCode: Maybe<number>;
  contentType: Maybe<string>;
  requestOptions: {
    url: Maybe<string>;
    contentId: Maybe<string>;
  };
}

export class BatchResponse<T> {

  private parseResponseContentType(response: string): Maybe<string> {
    const matches = response.match(new RegExp('(content-type: )(.*)', 'ig'));
    return !matches || !matches[1] // the first content-type is the type of the request
      ? undefined
      : matches[1].toLowerCase().replace('content-type: ', '').trim();
  }

  private parseRequestURL(response: string): Maybe<string> {
    const matches = response.match(new RegExp('(http|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i'));
    return !matches
      ? undefined
      : matches[0];
  }

  private parseResponseStatusCode(response: string): Maybe<number> {
    const matches = response.match(new RegExp('(HTTP\/1.1 )([0-9]+)'));
    return !matches || !matches[0]
      ? undefined
      : parseInt(matches[0].replace('HTTP/1.1 ', '').trim(), 10);
  }

  private parseResponseBody(response: string) {
    try {
      const [jsonString] = response.split('\n')
        .filter(line => line.trim().indexOf('{') === 0);

      const result = typeof jsonString === 'undefined' || !jsonString || jsonString === 'undefined' ? '{}' : jsonString;

      return JSON.parse(result) as { data: [] };
    } catch (ex) {
      throw new Error(`Error (${ex instanceof Error && ex.message ? ex.message : ex}) parsing body of ${response}`);
    }
  }

  private parseRequestContentId(response: string): Maybe<string> {
    const matches = response.match(new RegExp('(Content-ID: )(.*)'));
    return !matches || !matches[0]
      ? undefined
      : matches[0].replace('Content-ID: ', '').trim();
  }

  private parseChildResponse<T>(response: string): BatchResponseJson<T> {
    return {
      body: this.parseResponseBody(response),
      statusCode: this.parseResponseStatusCode(response),
      contentType: this.parseResponseContentType(response),
      requestOptions: {
        url: this.parseRequestURL(response),
        contentId: this.parseRequestContentId(response)
      }
    };
  }

  constructor(private body: string) {

  }

  public toJson<T extends DTOModels>() {
    return this.body.split('Content-ID')
      .map((it: string) => 'Content-ID' + it)
      .filter((it: string, idx: number) => idx !== 0)
      .map((it: string) => this.parseChildResponse<T>(it));
  }
}
