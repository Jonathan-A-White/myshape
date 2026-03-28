import { useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { GiftScoreBar } from "@/components/data-display/GiftScoreBar";
import { DISCChart } from "@/components/data-display/DISCChart";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useToast } from "@/contexts/ToastContext";
import { getTop3Gifts, calculateGiftScores } from "@/core/scoring";
import { calculateDISCScores, discDescriptions } from "@/core/disc";
import { downloadPDF } from "@/services/pdfService";

export function FinalResultsPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { addToast } = useToast();

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const assessment = currentAssessment;
  const allScores = calculateGiftScores(assessment.spiritualGifts.answers);
  const top3 = getTop3Gifts(assessment.spiritualGifts.answers);
  const discProfile = calculateDISCScores(assessment.personality.groups);

  const recipientEmail = localStorage.getItem("myshape-recipient-email") || "";

  const handleDownload = () => {
    downloadPDF(assessment);
    addToast("success", "PDF downloaded successfully!");
  };

  const handleEmail = () => {
    downloadPDF(assessment);
    const subject = encodeURIComponent(
      `MySHAPE Assessment — ${assessment.participant.name}`,
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease find my completed SHAPE Assessment attached.\n\n— ${assessment.participant.name}`,
    );
    window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`);
    addToast("info", "PDF downloaded. Please attach it to the email that just opened.");
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="My SHAPE Results" backTo="/assessment" />
      <div className="flex-1 space-y-6 p-4">
        {/* Participant info */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {assessment.participant.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {assessment.participant.church} • {assessment.participant.date}
          </p>
        </div>

        {/* Top 3 Spiritual Gifts */}
        <section>
          <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            S — Spiritual Gifts (Top 3)
          </h3>
          <div className="space-y-2">
            {top3.map((g) => (
              <div
                key={g.gift.letter}
                className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
              >
                <GiftScoreBar
                  letter={g.gift.letter}
                  name={g.gift.name}
                  total={g.total}
                  maxScore={25}
                  isTop3={true}
                />
                <p className="mt-1 pl-11 text-sm text-gray-600 dark:text-gray-400">
                  {g.gift.description}
                </p>
              </div>
            ))}
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-primary dark:text-blue-400">
              View all gift scores
            </summary>
            <div className="mt-2 space-y-1">
              {[...allScores]
                .sort((a, b) => b.total - a.total)
                .map((s) => (
                  <GiftScoreBar
                    key={s.gift.letter}
                    letter={s.gift.letter}
                    name={s.gift.name}
                    total={s.total}
                    maxScore={25}
                    isTop3={s.isTop3}
                  />
                ))}
            </div>
          </details>
        </section>

        {/* Heart */}
        <section>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            H — Heart
          </h3>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-sm">
              <strong>People to Serve:</strong>{" "}
              {assessment.heart.peopleToServe.join(", ")}
            </p>
            <p className="mt-1 text-sm">
              <strong>Issues & Causes:</strong>{" "}
              {assessment.heart.issuesAndCauses.join(", ")}
            </p>
          </div>
        </section>

        {/* Abilities */}
        <section>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            A — Abilities (Top 5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {assessment.abilities.selected.map((a) => (
              <span
                key={a}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-blue-900/30 dark:text-blue-300"
              >
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* Personality DISC */}
        <section>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            P — Personality (DISC)
          </h3>
          <div className="mb-3 text-center">
            <span className="text-3xl font-bold text-primary dark:text-blue-400">
              {discProfile.profileCode}
            </span>
          </div>
          <DISCChart scores={discProfile.scores} />
          <div className="mt-3 space-y-2">
            <p className="text-sm">
              <strong>
                {discProfile.primary} — {discDescriptions[discProfile.primary].name}:
              </strong>{" "}
              {discDescriptions[discProfile.primary].characteristics}
            </p>
            <p className="text-sm">
              <strong>
                {discProfile.secondary} — {discDescriptions[discProfile.secondary].name}:
              </strong>{" "}
              {discDescriptions[discProfile.secondary].characteristics}
            </p>
          </div>
        </section>

        {/* Experiences */}
        <section>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            E — Experiences
          </h3>
          <div className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
            {assessment.experiences.studiedInSchool && (
              <p>
                <strong>Studied:</strong> {assessment.experiences.studiedInSchool}
              </p>
            )}
            {assessment.experiences.occupation && (
              <p>
                <strong>Occupation:</strong> {assessment.experiences.occupation}
              </p>
            )}
            {assessment.experiences.hobbies && (
              <p>
                <strong>Hobbies:</strong> {assessment.experiences.hobbies}
              </p>
            )}
            {assessment.experiences.churchServing && (
              <p>
                <strong>Church:</strong> {assessment.experiences.churchServing}
              </p>
            )}
          </div>
        </section>

        {/* Action buttons */}
        <div className="space-y-3 pb-6">
          <button
            onClick={handleDownload}
            className="w-full rounded-lg bg-primary py-3 text-center font-semibold text-white shadow-md"
          >
            Download PDF
          </button>
          <button
            onClick={handleEmail}
            className="w-full rounded-lg border-2 border-primary py-3 text-center font-semibold text-primary dark:border-blue-400 dark:text-blue-400"
          >
            Email to Pastor/Leader
          </button>
          <Link
            to="/assessment/review"
            className="block w-full rounded-lg border-2 border-gray-300 py-3 text-center font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300"
          >
            Review All Questions & Answers
          </Link>
        </div>
      </div>
    </div>
  );
}
