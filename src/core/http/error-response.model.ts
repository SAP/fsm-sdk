export type ErrorResponse<TError, TOptions> = {
  statusCode: number,
  message: string,
  error: TError,
  response: HttpResponse;
  options: TOptions;
}

export type HttpResponse = {
  headers: Iterable<[string, string]> & { get: (key: string) => string | null };
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: string;
  url: string;
  json<T>(): Promise<T>;
  text(): Promise<string>;
}

export type HttpRequestOptions = {
  body: ArrayBuffer
  | ArrayBufferView
  | NodeJS.ReadableStream
  | string
  | any;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  headers: { [key: string]: string }
}