import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { GiftScoreBar } from "@/components/data-display/GiftScoreBar";
import { useAssessment } from "@/contexts/AssessmentContext";
import { calculateGiftScores, getTop3Gifts } from "@/core/scoring";

const MAX_SCORE = 25;

export function SpiritualGiftsResultsPage() {
  const { currentAssessment } = useAssessment();
  const answers = currentAssessment?.spiritualGifts.answers ?? {};
  const allScores = calculateGiftScores(answers);
  const top3 = getTop3Gifts(answers);

  if (!currentAssessment) {
    return (
      <div>
        <PageHeader title="Spiritual Gifts Results" backTo="/assessment" />
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">
            No assessment in progress. Please start a new assessment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Spiritual Gifts Results"
        backTo="/assessment"
      />

      <div className="flex-1 px-4 py-6">
        {/* Top 3 Gifts highlight */}
        {top3.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">
              Your Top Spiritual Gifts
            </h2>
            <div className="space-y-4">
              {top3.map((score, index) => (
                <div
                  key={score.gift.letter}
                  className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gift-high text-lg font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {score.gift.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {score.total} / {MAX_SCORE}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {score.gift.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Scores */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            All Gift Scores
          </h2>
          <div className="space-y-2">
            {allScores.map((score) => (
              <GiftScoreBar
                key={score.gift.letter}
                letter={score.gift.letter}
                name={score.gift.name}
                total={score.total}
                maxScore={MAX_SCORE}
                isTop3={score.isTop3}
              />
            ))}
          </div>
        </section>

        {/* Back to Assessment button */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/assessment"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md hover:opacity-90"
          >
            Back to Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
