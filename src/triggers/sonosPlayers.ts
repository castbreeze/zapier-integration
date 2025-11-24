import type { ZObject } from "zapier-platform-core";
import type { SpeakerGroupsBundle, SonosPlayerOption } from "../types.js";
import { fetchSonosData } from "../common/sonosData.js";

const perform = async (
  z: ZObject,
  bundle: SpeakerGroupsBundle
): Promise<SonosPlayerOption[]> => {
  const { players } = await fetchSonosData(z, bundle);
  
  return players;
};

export default {
  key: "sonosPlayers",
  noun: "Sonos Player",
  display: {
    label: "Get Sonos Players",
    description: "Retrieves the list of individual Sonos players available in the user's households.",
    hidden: true,
  },
  operation: {
    type: "polling",
    perform: perform,
    canPaginate: false,
    outputFields: [
      { key: "id", label: "Player ID", type: "string" },
      { key: "name", label: "Player Name", type: "string" },
    ],
  },
};