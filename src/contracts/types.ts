import type { ReactNode } from "react";

export type AssessmentStatus = "in_progress" | "complete";
export type SectionStatus = "not_started" | "in_progress" | "complete";

export interface Participant {
  name: string;
  email: string;
  church: string;
  date: string;
}

export interface SpiritualGiftsData {
  status: SectionStatus;
  answers: Record<string, number>;
}

export interface HeartData {
  status: SectionStatus;
  reflectionQuestions: {
    whatDrivesYou: string;
    whoToHelp: string;
    needsDrawnTo: string;
    passionateCause: string;
  };
  peopleToServe: string[];
  issuesAndCauses: string[];
}

export interface AbilitiesData {
  status: SectionStatus;
  selected: string[];
}

export interface PersonalityData {
  status: SectionStatus;
  groups: Record<string, { most: number; least: number }>;
}

export interface ExperiencesData {
  status: SectionStatus;
  studiedInSchool: string;
  occupation: string;
  hobbies: string;
  churchServing: string;
  painfulExperience: string;
}

export interface Assessment {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: AssessmentStatus;
  participant: Participant;
  spiritualGifts: SpiritualGiftsData;
  heart: HeartData;
  abilities: AbilitiesData;
  personality: PersonalityData;
  experiences: ExperiencesData;
}

export type CreateAssessmentInput = Omit<
  Assessment,
  "id" | "createdAt" | "updatedAt"
>;

export interface ExportEnvelope {
  appName: string;
  version: number;
  exportedAt: number;
  type: "full" | "single";
  data: {
    assessments: Assessment[];
  };
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export interface PageHeaderProps {
  title: string;
  backTo?: string;
  rightAction?: ReactNode;
}
