export interface Grade {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  choices: Choice[];
  correctAnswer: string; // This will be the id of the correct choice
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  subjectId: string;
  gradeId: string;
  description: string;
  isPublished: boolean;
  questions: Question[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Submission {
  id: string;
  studentName: string;
  moduleId: string;
  score: number;
  submittedAt: string;
}
