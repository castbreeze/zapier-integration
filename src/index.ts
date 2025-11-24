import packageJson from '../package.json' with { type: 'json' };
import zapier from 'zapier-platform-core';
import type { ZObject, Bundle, HttpResponse, HttpRequestOptions } from 'zapier-platform-core';

// Import authentication
import authentication from './authentication.js';

// Import creates (actions)
import sonosPlayAudioClip from './creates/sonosPlayAudioClip.js';
import sonosStreamFile from './creates/sonosStreamFile.js';

// Import triggers (for dynamic dropdowns)
import sonosGroups from './triggers/sonosGroups.js';
import sonosPlayers from './triggers/sonosPlayers.js';

// Import types
import type { AuthData, TokenResponse } from './types.js';

export default {
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will need to know these before we can upload.
  version: packageJson.version,
  platformVersion: zapier.version,

  // Authentication configuration
  authentication: authentication,

  // Flags
  flags: {
    cleanInputData: false
  },

  // Triggers (hidden, used for dynamic dropdowns)
  triggers: {
    [sonosGroups.key]: sonosGroups,
    [sonosPlayers.key]: sonosPlayers,
  },

  // No searches needed
  searches: {},

  // If you want your creates to show up, you better include it here!
  // Order matters: playAudioClip is the primary action
  creates: {
    [sonosPlayAudioClip.key]: sonosPlayAudioClip,
    [sonosStreamFile.key]: sonosStreamFile,
  },

  resources: {},

  // Optional: Add request middleware for common headers
  beforeRequest: [
    (request: HttpRequestOptions, _z: ZObject, bundle: Bundle): HttpRequestOptions => {
      // Add Authorization header for OAuth
      if (bundle.authData && (bundle.authData as AuthData).access_token) {
        request.headers = request.headers || {};
        request.headers['Authorization'] = `Bearer ${(bundle.authData as AuthData).access_token}`;
      }
      return request;
    }
  ],

  // Optional: Add response middleware for error handling and token refresh
  afterResponse: [
    async (response: HttpResponse, z: ZObject, bundle: Bundle): Promise<HttpResponse> => {
      // Check for token expiration errors
      if (response.status === 401) {
        z.console.log('Received 401 response, checking for token expiration');
        
        try {
          const errorData = response.json as any;
          
          // Check if it's a token expiration error
          if (errorData && (errorData.error === 'invalid_token' || errorData.error === 'token_expired')) {
            z.console.log('Detected expired token, triggering automatic refresh via RefreshAuthError');
            
            // Throw RefreshAuthError to trigger Zapier's automatic token refresh
            // Zapier will call refreshAccessToken and retry the request automatically
            throw new (z.errors as any).RefreshAuthError('Access token expired');
          }
        } catch (parseError) {
          // If we can't parse the error, it might still be an auth error
          z.console.log('Could not parse 401 error response, treating as auth error');
        }
        
        // Generic 401 error - likely needs reconnection
        throw new (z.errors as any).RefreshAuthError('Authentication failed. Please reconnect your Sonos account.');
      }
      
      if (response.status === 403) {
        throw new Error('Access denied. Please verify your permissions.');
      }
      
      if (response.status >= 400) {
        // Try to extract error details from response
        try {
          const errorData = response.json as any;
          if (errorData && errorData.error_description) {
            throw new Error(`API Error: ${errorData.error_description}`);
          }
        } catch (e) {
          // Fall through to generic error
        }
        throw new Error(`API request failed with status ${response.status}: ${response.content}`);
      }
      
      return response;
    }
  ]
};