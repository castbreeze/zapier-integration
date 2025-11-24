# Castbreeze Zapier Integration

The official Zapier integration for [Castbreeze](https://castbreeze.com), enabling you to control your speakers through automated workflows. Stream audio files, play notifications, and integrate your speaker system with thousands of apps via Zapier.

> **Currently Supported Speakers:** Sonos (support for additional speaker brands coming soon)

## Features

### Actions

#### 🎵 Play Audio
Play audio clips (music, podcasts, notifications) on Sonos without interrupting current playback. Perfect for one-time audio clips that stop automatically.

- **Use Cases:** Doorbell notifications, TTS announcements, alert sounds
- **Clip Types:**
  - Custom Audio: Upload your own MP3/WAV files
  - Built-in Chime: Use Sonos' built-in chime sound
- **Options:**
  - Select specific Sonos player
  - Set volume (0-100)
  - Priority levels (LOW/HIGH) for managing overlapping clips

#### 📻 Stream File/URL
Start continuous streaming of an audio file that plays indefinitely until stopped.

- **Use Cases:** Background music, radio streams, continuous audio playback
- **Features:**
  - Stream to one or multiple speaker groups
  - Supports MP3, M4A, WAV, FLAC, and other common formats
  - Optional volume control
  - Play on all groups or select specific ones

### Triggers

The integration includes hidden triggers used for dynamic dropdowns:
- **Sonos Players:** Dynamically populate available Sonos players
- **Speaker Groups:** Dynamically populate available speaker groups

## Prerequisites

1. **Supported Speakers:** Currently requires Sonos speakers connected to your network (support for additional brands coming soon)
2. **Castbreeze Account:** Sign up at [castbreeze.com](https://castbreeze.com)
3. **Zapier Account:** Free or paid Zapier account

## Installation

### For Users

1. Visit the [Castbreeze Zapier Integration](https://zapier.com/apps/castbreeze/integrations) page
2. Click "Use this Zap" or create a new Zap
3. Search for "Castbreeze" when adding an action
4. Connect your Castbreeze account via OAuth
5. Configure your desired action

### For Developers

#### Setup

```bash
# Install dependencies
pnpm install

# Build the integration
pnpm run build

# Validate the integration
pnpm run validate

# Run tests
pnpm run test
```

#### Development Commands

```bash
# Watch mode for development
pnpm run watch

# Clean build artifacts
pnpm run clean

# Push to Zapier (requires authentication)
pnpm run push
```

## Authentication

The integration uses **OAuth 2.1 with PKCE** for secure authentication:

- **Authorization URL:** `https://api.castbreeze.com/oauth/authorize`
- **Token URL:** `https://api.castbreeze.com/oauth/token`
- **Client ID:** `zapier-client-1`
- **Scope:** `playback-control-all`

### Token Management

- Access tokens are automatically refreshed when expired
- Refresh tokens are preserved across token refreshes
- The integration handles 401 errors and triggers automatic token refresh

## API Endpoints

The integration communicates with the Castbreeze API:

- **Base URL:** `https://api.castbreeze.com`
- **API Version:** v2
- **Key Endpoints:**
  - `/oauth/authorize` - OAuth authorization
  - `/oauth/token` - Token exchange and refresh
  - `/api/v2/whoami` - Authentication test
  - `/api/v2/sonos/households` - List households
  - `/api/v2/sonos/groups` - List speaker groups
  - `/api/v2/sonos/players/{playerId}/audioClip` - Play audio clip
  - `/api/v2/sonos/play-url` - Stream audio URL

## Project Structure

```
zapier-integration/
├── src/
│   ├── index.ts              # Main integration entry point
│   ├── authentication.ts     # OAuth 2.1 configuration
│   ├── types.ts             # TypeScript type definitions
│   ├── creates/             # Zapier actions
│   │   ├── sonosPlayAudioClip.ts
│   │   └── sonosStreamFile.ts
│   ├── triggers/            # Dynamic dropdown triggers
│   │   ├── sonosGroups.ts
│   │   └── sonosPlayers.ts
│   └── common/              # Shared utilities
│       ├── sonosData.ts
│       └── sonosPlayback.ts
├── package.json
├── tsconfig.json
└── .zapierapprc             # Zapier CLI configuration
```

## Configuration

### Environment Variables

- `CASTBREEZE_API_URL` - Override the default API URL (default: `https://api.castbreeze.com`)

### Zapier Configuration

The integration is configured in [`src/index.ts`](src/index.ts):

- **Platform Version:** Uses latest Zapier platform core
- **Auto Refresh:** Enabled for automatic token refresh
- **PKCE:** Enabled for enhanced security
- **Request Middleware:** Adds Authorization headers automatically
- **Response Middleware:** Handles errors and token refresh

## Usage Examples

### Example 1: Doorbell Notification

**Trigger:** Ring Doorbell pressed  
**Action:** Castbreeze - Play Audio  
**Configuration:**
- Player: Front Room Speaker
- Clip Type: Custom Audio
- File: doorbell-chime.mp3
- Priority: HIGH

### Example 2: Daily News Briefing

**Trigger:** Schedule (Every day at 7 AM)  
**Action:** Castbreeze - Stream File/URL  
**Configuration:**
- Speaker Groups: Kitchen, Bedroom
- File: news-briefing.mp3
- Volume: 40

### Example 3: Smart Home Alert

**Trigger:** Smart Home - Motion detected  
**Action:** Castbreeze - Play Audio  
**Configuration:**
- Player: All Players
- Clip Type: CHIME
- Priority: LOW

## Error Handling

The integration includes comprehensive error handling:

- **401 Unauthorized:** Automatically triggers token refresh
- **403 Forbidden:** Returns permission error
- **4xx/5xx Errors:** Extracts and returns detailed error messages
- **Token Expiration:** Automatic refresh with retry logic

## Testing

The integration includes test utilities:

```bash
# Run all tests
pnpm run test

# Test authentication
zapier test --auth

# Test specific action
zapier test --action=sonosPlayAudioClip
```

## Deployment

### Version Management

Update version in [`package.json`](package.json):

```json
{
  "version": "1.0.17"
}
```

### Publishing

```bash
# Build and validate
pnpm run build
pnpm run validate

# Push to Zapier
pnpm run push

# Promote to production (via Zapier dashboard)
zapier promote 1.0.17
```

## Support

- **Documentation:** [castbreeze.com/docs](https://castbreeze.com/docs)
- **Issues:** Report bugs via GitHub issues
- **Email:** support@castbreeze.com

## Technical Details

### TypeScript

The integration is written in TypeScript with strict type checking:
- Node.js >= 24.0.0
- TypeScript 5.7+
- ES Modules (type: "module")

### Dependencies

- `zapier-platform-core`: ^18.0.1 - Zapier platform SDK
- `@types/node`: ^22.10.1 - Node.js type definitions
- `jest`: ^29.7.0 - Testing framework

### Supported Speaker Systems

**Currently Supported:**
- ✅ Sonos (all models with API support)

**Coming Soon:**
- 🔜 Additional speaker brands and systems

We're actively working on expanding support to more speaker systems. Check back for updates or contact us if you'd like to request support for a specific brand.

### Audio Format Support

**Play Audio (audioClip):**
- MP3
- WAV

**Stream File/URL:**
- MP3
- M4A
- WAV
- FLAC
- Other common audio formats supported by Sonos

## License

MIT License - see [LICENSE](LICENSE) file for details

Copyright (c) 2025 Sem Postma <spostma@castbreeze.com>

## Author

**Sem Postma**
- Email: spostma@castbreeze.com
- Website: [castbreeze.com](https://castbreeze.com)

---

**Part of the Castbreeze ecosystem:**
- Zapier Integration: Castbreeze for Zapier
- API: Castbreeze API
- Chrome Extension: [Cast to Sonos](https://casttosonos.com) - [Chrome Web Store](https://chromewebstore.google.com/detail/cast-to-sonos/defbpbmenfaikcnhmamnghdlcmahjaib)
