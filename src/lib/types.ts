// ============================================================================
// Base Entity Types
// ============================================================================

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
  question_id: string;
  content: string;
  is_correct_answer: boolean;
}

export interface Question {
  id: string;
  module_id: string;
  slug: string;
  content: string;
  choices: Choice[];
}

// API Response types for Module Detail
export interface ChoiceFromAPI {
  id: string;
  content: string;
  is_correct_answer: boolean;
}

export interface QuestionFromAPI {
  id: string;
  content: string;
  slug: string;
  choices: Choice[];
  next_question_slug?: string;
}

// ============================================================================
// Form Input Types (for submissions to API)
// ============================================================================

/** Choice input for creating or updating questions (id is optional for new choices) */
export interface ChoiceInput {
  id?: string;
  content: string;
  is_correct_answer: boolean;
}

/** Question input for creating or updating questions (id is optional for new questions) */
export interface QuestionInput {
  id?: string;
  content: string;
  slug?: string;
  choices: ChoiceInput[];
}

export interface ModuleDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  is_published: boolean;
  subject: Subject;
  grade: Grade;
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

export interface Module {
  id: string;
  user_id: string;
  subject_id: string;
  grade_id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  is_published: boolean;
  questions_count: number;
  subject: Subject;
  grade: Grade;
}

// ============================================================================
// Common API Types
// ============================================================================

/** Pagination metadata */
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================================
// API-Specific Response Types
// ============================================================================

/** Modules list API response */
export interface ModulesResponse {
  modules: Module[];
  pagination: Pagination;
}

/** Individual submission item from API */
export interface SubmissionItem {
  student_name: string;
  total_correct: number;
  total_questions: number;
  submitted_at: string;
}

/** Module reference in submissions */
export interface ModuleReference {
  id: string;
  title: string;
  slug: string;
  grade: Grade;
  subject: Subject;
}

/** Module with submissions from API */
export interface ModuleWithSubmissions {
  module: ModuleReference;
  total_submissions: number;
  submissions: SubmissionItem[];
}

// ============================================================================
// Dashboard-Specific Types
// ============================================================================

/** Dashboard statistics data */
export interface DashboardStats {
  total_modules: number;
  total_subjects: number;
  total_grades: number;
  total_submitted_submissions: number;
}
