import type { ZObject, HttpResponse } from 'zapier-platform-core';
import type { AudioClipBundle, AudioClipResponse, AudioClipOutput } from '../types.js';

const perform = async (
  z: ZObject,
  bundle: AudioClipBundle
): Promise<AudioClipOutput> => {
  const {
    playerId,
    file,
    volume,
    priority,
    clipType
  } = bundle.inputData;
  
  const apiUrl = process.env.CASTBREEZE_API_URL || 'https://api.casttosonos.com';
  
  const selectedClipType = clipType || 'CUSTOM';
  
  // Build the request body according to Sonos API spec
  const requestBody: any = {
    name: 'Zapier Audio Clip',
    appId: 'com.casttosonos.zapier',
    clipType: selectedClipType,
  };
  
  // Only require file URL for CUSTOM clip type
  if (selectedClipType === 'CUSTOM') {
    // Zapier file input provides a URL to the file
    const fileUrl = typeof file === 'string' ? file : (file as any)?.url || file;
    
    if (!fileUrl) {
      throw new Error('No file URL provided. Please ensure a file is selected.');
    }
    
    requestBody.streamUrl = fileUrl;
  }
  
  // Add optional parameters only if provided
  if (priority) requestBody.priority = priority;
  if (volume !== undefined && volume !== null) requestBody.volume = volume;
  
  // Call the Sonos audioClip API through our proxy
  const response: HttpResponse = await z.request({
    url: `${apiUrl}/api/v2/sonos/players/${playerId}/audioClip`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bundle.authData.access_token}`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  if (response.status !== 200) {
    const errorData = response.json as any || {};
    throw new Error(`Failed to load audio clip: ${errorData.error_description || errorData.message || response.content}`);
  }

  const result = response.json as AudioClipResponse;
  
  return {
    id: result.id,
    playerId: playerId,
    name: result.name,
    status: result.status || 'scheduled',
    timestamp: new Date().toISOString()
  };
};

export default {
  key: 'sonosPlayAudioClip',
  noun: 'Audio Clip',
  display: {
    label: 'Play Audio',
    description: 'Play audio (music, podcast, notification) on Sonos without interrupting current playback. Perfect for one-time audio clips that stop automatically.',
  },
  operation: {
    inputFields: [
      {
        key: 'playerId',
        label: 'Sonos Player',
        type: 'string',
        required: true,
        dynamic: 'sonosPlayers.id.name',
        helpText: 'Select the Sonos player to play the audio on.'
      },
      {
        key: 'clipType',
        label: 'Clip Type',
        type: 'string',
        required: false,
        choices: {
          'CUSTOM': 'Custom Audio',
          'CHIME': 'Built-in Chime',
        },
        default: 'CUSTOM',
        altersDynamicFields: true,
        helpText: 'Type of audio clip. Use "Custom Audio" for uploaded files.'
      },
      (z: ZObject, bundle: AudioClipBundle) => {
        const fields: any[] = [];
        
        // Only show file field when clipType is CUSTOM
        if (!bundle.inputData.clipType || bundle.inputData.clipType === 'CUSTOM') {
          fields.push({
            key: 'file',
            label: 'Audio File/Url',
            type: 'file',
            required: true,
            helpText: 'Select an audio file to play. Only supports MP3, WAV'
          });
        }
        
        return fields;
      },
      {
        key: 'volume',
        label: 'Volume',
        type: 'integer',
        required: false,
        helpText: 'Optional: Set playback volume (0-100). Defaults to current player volume.'
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'string',
        required: false,
        choices: {
          'LOW': 'Low Priority',
          'HIGH': 'High Priority'
        },
        helpText: 'Optional: High priority can interrupt low priority clips. Low cannot interrupt high.'
      }
    ],
    perform: perform,
    sample: {
      id: 'clip_123',
      playerId: 'RINCON_542A1BC905B801400',
      name: 'Zapier Audio Clip',
      status: 'scheduled',
      timestamp: '2024-01-01T12:00:00Z'
    }
  }
};