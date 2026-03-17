import { jsPDF } from "jspdf";
import type { Assessment } from "@/contracts/types";
import { calculateGiftScores, getTop3Gifts } from "@/core/scoring";
import { calculateDISCScores, discDescriptions } from "@/core/disc";
import { giftMap } from "@/core/giftMap";
import {
  spiritualGiftQuestions,
  personalityTraitGroups,
} from "@/core/staticData";

export function generatePDF(assessment: Assessment): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = 1;
  const totalPages = 13;

  function addPageNumber() {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
    doc.setTextColor(0);
  }

  function newPage() {
    doc.addPage();
    currentPage++;
  }

  // === PAGE 1: Cover ===
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SHAPE", pageWidth / 2, 80, { align: "center" });
  doc.text("ASSESSMENT", pageWidth / 2, 95, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(assessment.participant.name || "Participant", pageWidth / 2, 130, {
    align: "center",
  });
  doc.text(assessment.participant.church || "", pageWidth / 2, 142, {
    align: "center",
  });
  doc.text(assessment.participant.date || "", pageWidth / 2, 154, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.text("S - Spiritual Gifts", pageWidth / 2, 180, { align: "center" });
  doc.text("H - Heart", pageWidth / 2, 188, { align: "center" });
  doc.text("A - Abilities", pageWidth / 2, 196, { align: "center" });
  doc.text("P - Personality", pageWidth / 2, 204, { align: "center" });
  doc.text("E - Experiences", pageWidth / 2, 212, { align: "center" });
  addPageNumber();

  // === PAGE 2: Spiritual Gifts Intro ===
  newPage();
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Spiritual Gifts Assessment", margin, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const introText =
    "Read each statement below. Rate yourself on a scale of 1 to 5, where 1 means 'never true' and 5 means 'always true'. There are no right or wrong answers. Answer according to who you are, not who you would like to be.";
  doc.text(introText, margin, 40, { maxWidth: contentWidth });
  doc.text(
    "Scale: 1 = Never true  |  2 = Rarely true  |  3 = Sometimes true  |  4 = Often true  |  5 = Always true",
    margin,
    60,
    { maxWidth: contentWidth },
  );
  addPageNumber();

  // === PAGES 3-5: Questions with answers ===
  const questionsPerPage = [25, 40, 30]; // Q1-25, Q26-65, Q66-95
  let qStart = 0;

  for (let p = 0; p < 3; p++) {
    newPage();
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Spiritual Gifts Questions", margin, 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    let y = 30;
    const count = questionsPerPage[p];

    for (let i = 0; i < count && qStart + i < spiritualGiftQuestions.length; i++) {
      const q = spiritualGiftQuestions[qStart + i];
      const answer = assessment.spiritualGifts.answers[String(q.id)] || 0;

      const qText = `${q.id}. ${q.text}`;
      const lines: string[] = doc.splitTextToSize(qText, contentWidth - 15);

      if (y + lines.length * 4 > pageHeight - 20) break;

      doc.text(lines, margin, y);
      doc.setFont("helvetica", "bold");
      doc.text(`[${answer || " "}]`, pageWidth - margin - 10, y);
      doc.setFont("helvetica", "normal");
      y += lines.length * 4 + 2;
    }
    qStart += count;
    addPageNumber();
  }

  // === PAGE 6: Answer Key Grid ===
  newPage();
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Answer Key — Spiritual Gifts Scoring", margin, 20);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  const allScores = calculateGiftScores(assessment.spiritualGifts.answers);
  const top3 = getTop3Gifts(assessment.spiritualGifts.answers);

  let y = 30;
  // Header row
  doc.setFont("helvetica", "bold");
  doc.text("Gift", margin, y);
  doc.text("Q1", margin + 35, y);
  doc.text("Q2", margin + 48, y);
  doc.text("Q3", margin + 61, y);
  doc.text("Q4", margin + 74, y);
  doc.text("Q5", margin + 87, y);
  doc.text("Total", margin + 102, y);
  doc.text("Letter", margin + 118, y);
  doc.text("Gift Name", margin + 132, y);
  doc.setFont("helvetica", "normal");
  y += 5;

  giftMap.forEach((gift, idx) => {
    const answers = gift.questions.map(
      (qId) => assessment.spiritualGifts.answers[String(qId)] || 0,
    );
    const total = allScores[idx].total;
    const isTop = allScores[idx].isTop3;

    if (isTop) doc.setFont("helvetica", "bold");

    doc.text(`${idx + 1}`, margin, y);
    answers.forEach((a, i) => {
      doc.text(String(a), margin + 35 + i * 13, y);
    });
    doc.text(String(total), margin + 102, y);
    doc.text(gift.letter, margin + 118, y);
    doc.text(gift.name, margin + 132, y);

    if (isTop) doc.setFont("helvetica", "normal");
    y += 5;
  });

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Top 3 Spiritual Gifts:", margin, y);
  y += 5;
  top3.forEach((g, i) => {
    doc.text(`${i + 1}. ${g.gift.name} (${g.total})`, margin + 5, y);
    y += 5;
  });
  addPageNumber();

  // === PAGE 7: Heart - Reflections + People to Serve ===
  newPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Heart — Reflection Questions", margin, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  y = 38;
  const reflections = [
    {
      q: "What drives you? What are you passionate about?",
      a: assessment.heart.reflectionQuestions.whatDrivesYou,
    },
    {
      q: "Who do you feel called to help?",
      a: assessment.heart.reflectionQuestions.whoToHelp,
    },
    {
      q: "What needs are you drawn to?",
      a: assessment.heart.reflectionQuestions.needsDrawnTo,
    },
    {
      q: "What cause are you most passionate about?",
      a: assessment.heart.reflectionQuestions.passionateCause,
    },
  ];

  reflections.forEach((r) => {
    doc.setFont("helvetica", "bold");
    doc.text(r.q, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const lines: string[] = doc.splitTextToSize(r.a || "(no response)", contentWidth - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4 + 6;
  });

  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("People to Serve (Top 3):", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  assessment.heart.peopleToServe.forEach((p) => {
    doc.text(`• ${p}`, margin + 5, y);
    y += 5;
  });
  addPageNumber();

  // === PAGE 8: Issues/Causes + Abilities ===
  newPage();
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  y = 25;
  doc.text("Issues & Causes (Top 3):", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  assessment.heart.issuesAndCauses.forEach((c) => {
    doc.text(`• ${c}`, margin + 5, y);
    y += 5;
  });

  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Abilities — Top 5", margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  assessment.abilities.selected.forEach((a, i) => {
    doc.text(`${i + 1}. ${a}`, margin + 5, y);
    y += 5;
  });
  addPageNumber();

  // === PAGE 9: Personality intro ===
  newPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Personality — DISC Assessment", margin, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "For each group of traits, you selected which trait is MOST like you (M)",
    margin,
    40,
  );
  doc.text("and which is LEAST like you (L).", margin, 47);
  addPageNumber();

  // === PAGE 10: Groups 1-12 ===
  newPage();
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Personality Trait Groups (1-12)", margin, 20);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  y = 28;
  for (let g = 0; g < 12; g++) {
    const group = personalityTraitGroups[g];
    const selection = assessment.personality.groups[String(group.id)];

    doc.setFont("helvetica", "bold");
    doc.text(`Group ${group.id}:`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 4;

    group.traits.forEach((trait, i) => {
      let marker = "  ";
      if (selection) {
        if (selection.most === i) marker = "M ";
        if (selection.least === i) marker = "L ";
      }
      doc.text(`${marker}${trait}`, margin + 3, y);
      y += 3.5;
    });
    y += 2;
  }
  addPageNumber();

  // === PAGE 11: Groups 13-24 ===
  newPage();
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Personality Trait Groups (13-24)", margin, 20);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  y = 28;
  for (let g = 12; g < 24; g++) {
    const group = personalityTraitGroups[g];
    const selection = assessment.personality.groups[String(group.id)];

    doc.setFont("helvetica", "bold");
    doc.text(`Group ${group.id}:`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 4;

    group.traits.forEach((trait, i) => {
      let marker = "  ";
      if (selection) {
        if (selection.most === i) marker = "M ";
        if (selection.least === i) marker = "L ";
      }
      doc.text(`${marker}${trait}`, margin + 3, y);
      y += 3.5;
    });
    y += 2;
  }
  addPageNumber();

  // === PAGE 12: Experiences ===
  newPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Experiences", margin, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  y = 40;
  const experiences = [
    {
      q: "What did you study in school?",
      a: assessment.experiences.studiedInSchool,
    },
    {
      q: "What do you do for a living? If retired, what did you do?",
      a: assessment.experiences.occupation,
    },
    { q: "What hobbies do you enjoy?", a: assessment.experiences.hobbies },
    {
      q: "Within the church, where have you enjoyed serving in the past?",
      a: assessment.experiences.churchServing,
    },
    {
      q: "Most painful experience:",
      a: assessment.experiences.painfulExperience,
    },
  ];

  experiences.forEach((e) => {
    doc.setFont("helvetica", "bold");
    doc.text(e.q, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const lines: string[] = doc.splitTextToSize(e.a || "(no response)", contentWidth - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4 + 8;
  });
  addPageNumber();

  // === PAGE 13: Results Summary ===
  newPage();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("My SHAPE Profile", pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(assessment.participant.name, pageWidth / 2, 33, { align: "center" });

  y = 45;

  // Top 3 Gifts
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("S — Spiritual Gifts (Top 3)", margin, y);
  y += 7;
  doc.setFontSize(9);
  top3.forEach((g, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${g.gift.name} (${g.total}/25)`, margin + 3, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(g.gift.description, margin + 6, y);
    y += 6;
  });

  // Heart
  y += 3;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("H — Heart", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("People: " + assessment.heart.peopleToServe.join(", "), margin + 3, y);
  y += 5;
  doc.text("Causes: " + assessment.heart.issuesAndCauses.join(", "), margin + 3, y);
  y += 8;

  // Abilities
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("A — Abilities (Top 5)", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(assessment.abilities.selected.join(", "), margin + 3, y, {
    maxWidth: contentWidth,
  });
  y += 10;

  // DISC
  const discProfile = calculateDISCScores(assessment.personality.groups);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("P — Personality (DISC Profile)", margin, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`Profile: ${discProfile.profileCode}`, margin + 3, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Primary: ${discDescriptions[discProfile.primary].name} — ${discDescriptions[discProfile.primary].characteristics}`,
    margin + 3,
    y,
    { maxWidth: contentWidth },
  );
  y += 8;
  doc.text(
    `Secondary: ${discDescriptions[discProfile.secondary].name} — ${discDescriptions[discProfile.secondary].characteristics}`,
    margin + 3,
    y,
    { maxWidth: contentWidth },
  );
  y += 10;

  // Experiences summary
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("E — Experiences", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (assessment.experiences.studiedInSchool) {
    doc.text("Studied: " + assessment.experiences.studiedInSchool, margin + 3, y, {
      maxWidth: contentWidth,
    });
    y += 5;
  }
  if (assessment.experiences.occupation) {
    doc.text("Occupation: " + assessment.experiences.occupation, margin + 3, y, {
      maxWidth: contentWidth,
    });
    y += 5;
  }

  addPageNumber();

  return doc;
}

export function downloadPDF(assessment: Assessment): void {
  const doc = generatePDF(assessment);
  const name =
    assessment.participant.name.replace(/\s+/g, "-").toLowerCase() || "assessment";
  const date = assessment.participant.date || new Date().toISOString().split("T")[0];
  doc.save(`myshape-${name}-${date}.pdf`);
}
