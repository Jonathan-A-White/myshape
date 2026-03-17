type DISCType = "D" | "I" | "S" | "C";

// For each group, map row positions (0-3) to DISC types
export const discMapping: Record<string, DISCType[]> = {
  "1": ["S", "I", "C", "D"],
  "2": ["I", "C", "D", "S"],
  "3": ["C", "D", "S", "I"],
  "4": ["C", "S", "D", "I"],
  "5": ["I", "C", "D", "S"],
  "6": ["D", "S", "I", "C"],
  "7": ["C", "S", "D", "I"],
  "8": ["D", "I", "S", "C"],
  "9": ["I", "S", "D", "C"],
  "10": ["D", "S", "I", "C"],
  "11": ["I", "S", "C", "D"],
  "12": ["I", "D", "C", "S"],
  "13": ["D", "I", "S", "C"],
  "14": ["C", "D", "I", "S"],
  "15": ["S", "I", "C", "D"],
  "16": ["I", "S", "C", "D"],
  "17": ["C", "S", "I", "D"],
  "18": ["I", "S", "C", "D"],
  "19": ["C", "D", "I", "S"],
  "20": ["D", "S", "C", "I"],
  "21": ["I", "S", "D", "C"],
  "22": ["I", "C", "D", "S"],
  "23": ["I", "C", "D", "S"],
  "24": ["D", "S", "I", "C"],
};

export interface DISCScores {
  D: { most: number; least: number; difference: number };
  I: { most: number; least: number; difference: number };
  S: { most: number; least: number; difference: number };
  C: { most: number; least: number; difference: number };
}

export interface DISCProfile {
  scores: DISCScores;
  primary: DISCType;
  secondary: DISCType;
  profileCode: string;
}

export const discDescriptions: Record<DISCType, { name: string; characteristics: string }> = {
  D: { name: "Dominant", characteristics: "Direct, decisive, competitive, results-oriented, enjoys challenges" },
  I: { name: "Influencing", characteristics: "Enthusiastic, optimistic, collaborative, expressive, people-oriented" },
  S: { name: "Steady", characteristics: "Patient, reliable, team-oriented, calm, values stability and harmony" },
  C: { name: "Conscientious", characteristics: "Analytical, detail-oriented, accurate, systematic, quality-focused" },
};

export function calculateDISCScores(groups: Record<string, { most: number; least: number }>): DISCProfile {
  const scores: DISCScores = {
    D: { most: 0, least: 0, difference: 0 },
    I: { most: 0, least: 0, difference: 0 },
    S: { most: 0, least: 0, difference: 0 },
    C: { most: 0, least: 0, difference: 0 },
  };

  for (const [groupId, selection] of Object.entries(groups)) {
    const mapping = discMapping[groupId];
    if (!mapping) continue;

    const mostType = mapping[selection.most];
    const leastType = mapping[selection.least];

    if (mostType) scores[mostType].most++;
    if (leastType) scores[leastType].least++;
  }

  // Calculate differences
  for (const type of ["D", "I", "S", "C"] as DISCType[]) {
    scores[type].difference = scores[type].most - scores[type].least;
  }

  // Determine primary and secondary (by most count, break ties by difference)
  const ranked = (["D", "I", "S", "C"] as DISCType[]).sort(
    (a, b) => scores[b].most - scores[a].most || scores[b].difference - scores[a].difference,
  );

  return {
    scores,
    primary: ranked[0],
    secondary: ranked[1],
    profileCode: ranked[0] + ranked[1],
  };
}
