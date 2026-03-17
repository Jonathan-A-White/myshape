export interface GiftMapping {
  letter: string;
  name: string;
  description: string;
  questions: number[];
}

export const giftMap: GiftMapping[] = [
  { letter: "A", name: "Administration", description: "Organizing people, tasks, and events to achieve goals efficiently", questions: [1, 20, 39, 58, 77] },
  { letter: "B", name: "Apostleship", description: "Starting new churches or ministries where they do not yet exist", questions: [2, 21, 40, 59, 78] },
  { letter: "C", name: "Craftsmanship", description: "Working creatively with hands — wood, cloth, metal, glass, etc.", questions: [3, 22, 41, 60, 79] },
  { letter: "D", name: "Creative Communication", description: "Communicating God's truth through art, drama, music, writing", questions: [4, 23, 42, 61, 80] },
  { letter: "E", name: "Discernment", description: "Distinguishing between spiritual truth and error, good and evil", questions: [5, 24, 43, 62, 81] },
  { letter: "F", name: "Encouragement", description: "Strengthening and reassuring those who are discouraged", questions: [6, 25, 44, 63, 82] },
  { letter: "G", name: "Evangelism", description: "Communicating the gospel with clarity and effectiveness", questions: [7, 26, 45, 64, 83] },
  { letter: "H", name: "Faith", description: "Trusting God to answer prayer and accomplish great things", questions: [8, 27, 46, 65, 84] },
  { letter: "I", name: "Giving", description: "Contributing resources generously to support God's work", questions: [9, 28, 47, 66, 85] },
  { letter: "J", name: "Helps", description: "Working behind the scenes to support the work of others", questions: [10, 29, 48, 67, 86] },
  { letter: "K", name: "Hospitality", description: "Creating welcoming environments and caring for others' needs", questions: [11, 30, 49, 68, 87] },
  { letter: "L", name: "Intercession", description: "Praying consistently and faithfully on behalf of others", questions: [12, 31, 50, 69, 88] },
  { letter: "M", name: "Knowledge", description: "Seeking, studying, and understanding Biblical truth deeply", questions: [13, 32, 51, 70, 89] },
  { letter: "N", name: "Leadership", description: "Motivating and guiding others to accomplish goals and vision", questions: [14, 33, 52, 71, 90] },
  { letter: "O", name: "Mercy", description: "Empathizing with hurting people and helping in their healing", questions: [15, 34, 53, 72, 91] },
  { letter: "P", name: "Prophecy", description: "Boldly speaking truth that confronts and calls for change", questions: [16, 35, 54, 73, 92] },
  { letter: "Q", name: "Shepherding", description: "Nurturing and providing long-term care and guidance for others", questions: [17, 36, 55, 74, 93] },
  { letter: "R", name: "Teaching", description: "Communicating Scripture so others can understand and apply it", questions: [18, 37, 56, 75, 94] },
  { letter: "S", name: "Wisdom", description: "Applying Biblical truth practically to life's complex situations", questions: [19, 38, 57, 76, 95] },
];
