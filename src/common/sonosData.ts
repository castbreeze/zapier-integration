import type { ZObject, HttpResponse } from 'zapier-platform-core';
import type {
  SpeakerGroupsBundle,
  SpeakerGroup,
  SonosPlayerOption,
  SonosHouseholdsResponse,
  SonosGroupsResponse,
  SonosHousehold,
} from '../types.js';

/**
 * Shared function to fetch Sonos households, groups, and players
 * This avoids duplicate API calls when populating different dropdowns
 */
export async function fetchSonosData(
  z: ZObject,
  bundle: SpeakerGroupsBundle
): Promise<{ groups: SpeakerGroup[]; players: SonosPlayerOption[] }> {
  const apiUrl = process.env.CASTBREEZE_API_URL || 'https://api.casttosonos.com';

  // Check if we have an access token
  if (!bundle.authData || !bundle.authData.access_token) {
    z.console.log('No auth data found in bundle.');
    throw new Error('Please authenticate first.');
  }

  // First, fetch all households
  const householdsResponse: HttpResponse = await z.request({
    url: `${apiUrl}/api/v2/sonos/households`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  });

  z.console.log('Households response status:', householdsResponse.status);

  if (householdsResponse.status !== 200) {
    z.console.error(
      'Failed to fetch households:',
      householdsResponse.status,
      householdsResponse.content
    );
    throw new Error(`Failed to fetch households: ${householdsResponse.content}`);
  }

  const householdsData = householdsResponse.json as SonosHouseholdsResponse;
  const households = householdsData.households || [];

  if (households.length === 0) {
    z.console.log('No households found for the user.');
    throw new Error('No Sonos households found for the authenticated user.');
  }

  // Fetch groups and players for each household
  const allGroupsPromises = households.map(
    async (household: SonosHousehold, index: number) => {
      const groupsResponse: HttpResponse = await z.request({
        url: `${apiUrl}/api/v2/sonos/households/${household.id}/groups`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bundle.authData.access_token}`,
        },
      });

      if (groupsResponse.status !== 200) {
        throw new Error(`Failed to fetch groups for household ${household.id}`);
      }

      const groupsData = groupsResponse.json as SonosGroupsResponse;
      const groups = groupsData.groups || [];
      const players = groupsData.players || [];
      const householdLabel = households.length > 1 ? ` (Household ${index + 1})` : '';

      return {
        groups: groups.map((group) => ({
          id: group.id,
          name: `${group.name || `Group ${group.id.slice(-8)}`}${householdLabel}`,
        })),
        players: players.map((player) => ({
          id: player.id,
          name: `${player.name || `Player ${player.id.slice(-8)}`}${householdLabel}`,
        })),
      };
    }
  );

  const allData = await Promise.all(allGroupsPromises);
  
  const allGroups = allData.flatMap(d => d.groups);
  const allPlayers = allData.flatMap(d => d.players);

  return {
    groups: allGroups,
    players: allPlayers
  };
}