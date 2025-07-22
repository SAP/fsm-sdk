import assert from 'assert';
import { ClientConfigBuilder } from '../integration-test.config';
import { HttpService } from '../../core/http/http-service';
import { OAuthService } from '../../core/oauth/oauth.service';
import { OAuthTokenResponse } from '../../core/oauth/oauth-token-response.model';
import { ClientConfig } from '../../core/client-config.model';


describe('OAuthService', () => {

  const tokenMock: OAuthTokenResponse = {

    expires_in: 9999999,
    // THIS IS NOT A REAL TOKEN, JUST A MOCK FOR TESTING
    access_token: 'eyJhbGciOiJub25lIn0.eyJleHAiOiA5OTk5OTk5fQ.',
    token_type: 'bearer',

    contentType: 'client',

    content: {
      "exp": 9999999
    }
  };

  describe('ensureToken', () => {

    it('should fetch token if not present', done => {

      const auth = new OAuthService({ request: () => Promise.resolve(tokenMock) } as any as HttpService);

      auth.ensureToken({ ...ClientConfigBuilder.getConfig('client_credentials'), oauthEndpoint: undefined, debug: true, tokenCacheFilePath: 'coresystems-oauth2-token.json' } as ClientConfig)
        .then(token => assert.deepStrictEqual(token, tokenMock))
        .then(() => done())
        .catch(e => done(e));

    });

    it('should refresh token if expired', done => {

      const httpStub = { request: () => Promise.resolve(JSON.stringify(tokenMock)) } as any as HttpService;
      const loggerStub = { error: () => { } }
      const auth = new OAuthService(httpStub, loggerStub);

      const invalidToken = { ...tokenMock, expires_in: 0 };
      auth.setToken(invalidToken);

      auth.ensureToken({ ...ClientConfigBuilder.getConfig('client_credentials') as ClientConfig, debug: false, tokenCacheFilePath: 'i/n/v/a/l/i/d' })
        .then(token => assert.deepStrictEqual(token, tokenMock))
        .then(() => done())
        .catch(e => done(e));

    });

    it('should NOT refresh token if still valid', done => {

      const httpStub = { request: () => Promise.resolve(JSON.stringify(tokenMock)) } as any as HttpService;
      const auth = new OAuthService(httpStub);

      const validToken = { ...tokenMock, expires_in: 8888888 };
      auth.setToken(validToken);

      auth.ensureToken({ ...ClientConfigBuilder.getConfig('client_credentials') as ClientConfig, debug: false, authGrantType: 'client_credentials' })
        .then(token => assert.deepStrictEqual(token, validToken))
        .then(() => done())
        .catch(e => done(e))

    });

  });

});