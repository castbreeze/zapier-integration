import type { ZObject } from 'zapier-platform-core';
import type { PlayUrlBundle, PlayUrlOutput } from '../types.js';
import { performSonosPlayback } from '../common/sonosPlayback.js';

const perform = async (
  z: ZObject,
  bundle: PlayUrlBundle
): Promise<PlayUrlOutput> => {
  const { file, speakerGroups, volume } = bundle.inputData;
  
  // Zapier file input provides a URL to the file
  // The file parameter will be a URL string when a file is provided
  const fileUrl = typeof file === 'string' ? file : (file as any)?.url || file;
  
  if (!fileUrl) {
    throw new Error('No file URL provided. Please ensure a file is selected.');
  }
  
  return performSonosPlayback(z, {
    url: fileUrl,
    speakerGroups,
    volume,
    accessToken: bundle.authData.access_token
  });
};

export default {
  key: 'sonosStreamFile',
  noun: 'Stream File',
  display: {
    label: 'Stream File/Url',
    description: 'Start continuous streaming of an audio file that plays indefinitely. Use "Play Audio" for one-time clips.',
  },
  operation: {
    inputFields: [
      {
        key: 'file',
        label: 'Audio File/Url',
        type: 'file',
        required: true,
        helpText: 'Select an audio file to play on your Sonos speakers. Supports MP3, M4A, WAV, FLAC, and other common audio formats.'
      },
      {
        key: 'speakerGroups',
        label: 'Speaker Groups',
        type: 'string',
        required: false,
        list: true,
        dynamic: 'speakerGroups.id.name',
        helpText: 'Select one or more speaker groups to play on. Select "All Groups" to play on all available speakers. If not specified, will play on all groups.'
      },
      {
        key: 'volume',
        label: 'Volume (1-100)',
        type: 'integer',
        required: false,
        helpText: 'Optional: Set the playback volume (1-100). If not specified, the current volume will remain unchanged.'
      },
    ],
    perform: perform,
    sample: {
      id: 'session_456',
      url: 'https://zapier.com/engine/hydrate/abc123/file.mp3',
      groups: ['group_789'],
      successfulGroups: ['group_789'],
      failedGroups: 0,
      volume: 50,
      status: 'playing',
      timestamp: '2024-01-01T12:00:00Z'
    }
  }
};