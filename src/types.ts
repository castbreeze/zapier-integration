import type { Bundle, ZObject } from 'zapier-platform-core';

// OAuth Token Response
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Auth Data stored in bundle
export interface AuthData extends Record<string, unknown> {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

// Sonos API Types
export interface SonosHousehold {
  id: string;
  name?: string;
}

export interface SonosPlayer {
  id: string;
  name?: string;
  websocketUrl?: string;
  softwareVersion?: string;
  apiVersion?: string;
  minApiVersion?: string;
  capabilities?: string[];
  deviceIds?: string[];
}

export interface SonosGroup {
  id: string;
  name?: string;
  coordinatorId?: string;
  playbackState?: string;
  playerIds?: string[];
}

export interface SonosHouseholdsResponse {
  households: SonosHousehold[];
}

export interface SonosGroupsResponse {
  groups: SonosGroup[];
  players?: SonosPlayer[];
}

// Speaker Group for dropdown
export interface SpeakerGroup {
  id: string;
  name: string;
}

// Player for dropdown (same structure as SpeakerGroup for consistency)
export type SonosPlayerOption = SpeakerGroup;

// Play URL Request
export interface PlayUrlInput {
  url: string;
  speakerGroups?: string[];
  volume?: number;
}

// Play URL Response
export interface PlayUrlResult {
  successful: Array<{
    groupId: string;
    sessionId: string;
  }>;
  failed: Array<{
    groupId: string;
    error: string;
  }>;
}

export interface PlayUrlOutput {
  id: string;
  url: string;
  groups: string | string[];
  successfulGroups: string[];
  failedGroups: number;
  volume?: number;
  status: string;
  timestamp: string;
}

// Zapier Bundle Types
export type AuthBundle = Bundle & { authData: AuthData };
export type PlayUrlBundle = Bundle & { authData: AuthData; inputData: PlayUrlInput };
export type SpeakerGroupsBundle = Bundle & { authData: AuthData };

// Audio Clip Types
export interface AudioClipInput {
  playerId: string;
  priority?: 'LOW' | 'HIGH';
  clipType?: 'CHIME' | 'CUSTOM';
  streamUrl?: string;
  volume?: number;
  clipLEDBehavior?: 'NONE' | 'WHITE_LED_QUICK_BREATHING';
}

export interface AudioClipResponse {
  id: string;
  name: string;
  appId: string;
  priority: string;
  clipType: string;
  status: string;
}

export interface AudioClipOutput {
  id: string;
  playerId: string;
  name: string;
  status: string;
  timestamp: string;
}

export type AudioClipBundle = Bundle & { authData: AuthData; inputData: AudioClipInput };

// Zapier Z Object type
export type ZapierZ = ZObject;