import { HttpRequestOptions, HttpResponse } from './core/error-response.model';

declare var globalThis: {
    fetch: (url: string, opt: HttpRequestOptions) => Promise<HttpResponse>,
    require: (it: string) => void;
    btoa: (s: string) => string;
    URLSearchParams: any;
    Buffer?: { from: (s: string) => { toString: (t: string) => string } }
};

declare var window: any;

if (typeof window === 'undefined') {
    // node
    require('isomorphic-fetch');
    globalThis.URLSearchParams = require('url').URLSearchParams
}

const fetch = globalThis.fetch;
const URLSearchParams = globalThis.URLSearchParams;

function toBase64(str: string): string {
    return !!globalThis.Buffer
        ? globalThis.Buffer.from(str).toString('base64')
        : globalThis.btoa(unescape(encodeURIComponent(str)))
}

export {
    fetch,
    toBase64,
    URLSearchParams
}
