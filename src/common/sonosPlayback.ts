import type { ZObject, HttpResponse } from 'zapier-platform-core';
import type { PlayUrlResult, PlayUrlOutput } from '../types.js';

export interface PlaybackOptions {
  url: string;
  speakerGroups?: string[];
  volume?: number;
  accessToken: string;
}

/**
 * Core playback function shared between playUrl and playFile actions
 */
export async function performSonosPlayback(
  z: ZObject,
  options: PlaybackOptions
): Promise<PlayUrlOutput> {
  const { url, speakerGroups, volume, accessToken } = options;
  
  const apiUrl = process.env.CASTBREEZE_API_URL || 'https://api.casttosonos.com';
  
  try {
    // Prepare groups - can be a single group, array of groups, or '*' for all
    let groups: string | string[] = speakerGroups || [];
    
    // If no groups specified, default to all groups
    if (!groups || (Array.isArray(groups) && groups.length === 0)) {
      groups = '*';
    }
    
    // If it's an array with a single '*', use '*'
    if (Array.isArray(groups) && groups.length === 1 && groups[0] === '*') {
      groups = '*';
    }
    
    // Use the extended playUrl endpoint
    const playResponse: HttpResponse = await z.request({
      url: `${apiUrl}/api/v2/extended/playUrl`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        groups,
        url,
        volume,
        metadata: {}
      }
    });

    if (playResponse.status !== 200) {
      const errorData = playResponse.json as any || {};
      throw new Error(`Failed to play URL: ${errorData.error_description || playResponse.content}`);
    }

    const result = playResponse.json as PlayUrlResult;
    
    // Format the response
    const successfulGroups = result.successful || [];
    const failedGroups = result.failed || [];
    
    return {
      id: successfulGroups.length > 0 ? successfulGroups[0].sessionId : 'unknown',
      url: url,
      groups: groups,
      successfulGroups: successfulGroups.map(s => s.groupId),
      failedGroups: failedGroups.length,
      volume: volume,
      status: successfulGroups.length > 0 ? 'playing' : 'failed',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    // Enhanced error reporting
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to extract more details from the error
    const errorObj = error as any;
    if (errorObj.json) {
      const errorData = errorObj.json;
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      } else if (errorData.errorCode) {
        errorMessage = `${errorData.reason || errorData.message || errorMessage} [${errorData.errorCode}]`;
      }
    }
    
    // Log the full error for debugging
    z.console.log('Full error details:', JSON.stringify({
      message: error instanceof Error ? error.message : 'Unknown error',
      status: errorObj.status,
      json: errorObj.json,
      stack: error instanceof Error ? error.stack : undefined
    }));
    
    throw new Error(`Cast2Sonos playback failed: ${errorMessage}`);
  }
}