import type { ZObject, Bundle, HttpResponse } from 'zapier-platform-core';
import type { TokenResponse, AuthData, SonosHouseholdsResponse } from './types.js';

/**
 * Exchange authorization code for access token
 * Uses standard OAuth 2.1 token endpoint with PKCE
 */
const getAccessToken = async (
  z: ZObject,
  bundle: Bundle
): Promise<TokenResponse> => {
  const code = bundle.inputData.code as string;
  
  if (!code) {
    throw new Error('Missing authorization code');
  }

  const response: HttpResponse = await z.request({
    url: 'https://api.casttosonos.com/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: bundle.inputData.redirect_uri as string,
      client_id: 'zapier-client-1',
      code_verifier: bundle.inputData.code_verifier as string,
    }
  });

  if (response.status !== 200) {
    throw new Error(`Token exchange failed: ${response.content}`);
  }

  const data = response.json as TokenResponse;
  if (!data || !data.access_token) {
    throw new Error('Token response missing access_token');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type || 'Bearer',
    scope: data.scope
  };
};

/**
 * Refresh access token using OAuth 2.1 refresh token grant
 */
const refreshAccessToken = async (
  z: ZObject,
  bundle: Bundle & { authData: AuthData }
): Promise<TokenResponse> => {
  const refreshToken = bundle.authData.refresh_token;
  
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  try {
    const response: HttpResponse = await z.request({
      url: 'https://api.casttosonos.com/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'zapier-client-1',
      }
    });

    if (response.status !== 200) {
      z.console.error('Token refresh failed:', {
        status: response.status,
        content: response.content,
        json: response.json
      });
      throw new Error(`Failed to refresh access token: ${response.content}`);
    }

    const data = response.json as TokenResponse;
    if (!data || !data.access_token) {
      throw new Error('Refresh response missing access_token');
    }

    // Always preserve the refresh token - use new one if provided, otherwise keep the old one
    // This is critical because some OAuth providers don't return a new refresh token
    const newRefreshToken = data.refresh_token || refreshToken;
    
    z.console.log('Token refresh successful', {
      hasNewRefreshToken: !!data.refresh_token,
      expiresIn: data.expires_in
    });

    return {
      access_token: data.access_token,
      refresh_token: newRefreshToken,
      expires_in: data.expires_in,
      token_type: data.token_type || 'Bearer',
      scope: data.scope
    };
  } catch (error) {
    z.console.error('Token refresh error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any).status,
      json: (error as any).json
    });
    throw error;
  }
};

/**
 * Test authentication by calling the whoami endpoint
 * This is a lightweight endpoint that verifies the token is valid
 */
const testAuth = async (
  z: ZObject,
  bundle: Bundle & { authData: AuthData }
): Promise<{ authenticated: boolean; hasSonosToken: boolean; hasSonosRefreshToken: boolean }> => {
  const accessToken = bundle.authData.access_token;

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  try {
    const response: HttpResponse = await z.request({
      url: 'https://api.casttosonos.com/api/v2/whoami',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    z.console.log('Auth test response:', {
      status: response.status,
      content: response.content,
      json: response.json
    });

    if (response.status !== 200) {
      throw new Error(`Authentication failed (${response.status}): ${response.content}`);
    }

    const data = response.json as { hasSonosToken: boolean; hasSonosRefreshToken: boolean };
    
    z.console.log('Whoami response:', data);
    
    // Authentication is successful if we have Sonos tokens
    return {
      authenticated: true,
      ...data
    };
  } catch (error) {
    z.console.error('Auth test error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any).status,
      json: (error as any).json
    });
    throw error;
  }
};

export default {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: 'https://api.casttosonos.com/oauth/authorize',
      params: {
        client_id: 'zapier-client-1',
        response_type: 'code',
        scope: 'playback-control-all',
        state: '{{bundle.inputData.state}}',
        // PKCE parameters are automatically added by Zapier
      }
    },
    getAccessToken,
    refreshAccessToken,
    autoRefresh: true,
    // Enable PKCE (Zapier will handle code_challenge generation)
    enablePkce: true,
  },
  fields: [],
  test: testAuth,
  connectionLabel: 'Sonos Account ({{bundle.authData.scope}})'
};