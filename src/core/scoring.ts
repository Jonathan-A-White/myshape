import { giftMap, type GiftMapping } from "@/core/giftMap";

export interface GiftScore {
  gift: GiftMapping;
  total: number;
  isTop3: boolean;
}

export function calculateGiftScores(
  answers: Record<string, number>,
): GiftScore[] {
  const scores = giftMap.map((gift) => {
    const total = gift.questions.reduce((sum, qId) => {
      return sum + (answers[String(qId)] || 0);
    }, 0);
    return { gift, total, isTop3: false };
  });

  // Sort by total descending, then by gift letter alphabetically for ties
  const sorted = [...scores].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.gift.letter.localeCompare(b.gift.letter);
  });

  // Mark top 3
  const top3Letters = new Set(sorted.slice(0, 3).map((s) => s.gift.letter));
  return scores.map((s) => ({
    ...s,
    isTop3: top3Letters.has(s.gift.letter),
  }));
}

export function getTop3Gifts(answers: Record<string, number>): GiftScore[] {
  return calculateGiftScores(answers)
    .filter((s) => s.isTop3)
    .sort(
      (a, b) =>
        b.total - a.total || a.gift.letter.localeCompare(b.gift.letter),
    );
}
