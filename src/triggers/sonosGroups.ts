import type { ZObject } from "zapier-platform-core";
import type { SpeakerGroupsBundle, SpeakerGroup } from "../types.js";
import { fetchSonosData } from "../common/sonosData.js";

const perform = async (
  z: ZObject,
  bundle: SpeakerGroupsBundle
): Promise<SpeakerGroup[]> => {
  const { groups } = await fetchSonosData(z, bundle);
  
  return [{ id: "*", name: "All Groups" }, ...groups];
};

export default {
  key: "sonosGroups",
  noun: "Speaker Group",
  display: {
    label: "Get Speaker Groups",
    description: "Retrieves the list of Sonos speaker groups available in the user's households.",
    hidden: true,
  },
  operation: {
    type: "polling",
    perform: perform,
    canPaginate: false,
    outputFields: [
      { key: "id", label: "Group ID", type: "string" },
      { key: "name", label: "Group Name", type: "string" },
    ],
  },
};
