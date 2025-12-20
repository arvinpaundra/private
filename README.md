# Private - Modern Learning Management System

Private is a full-fledged Learning Management System (LMS) application built with a modern tech stack. It provides an intuitive platform for admins to create and manage educational content, and for students to learn and take quizzes.

## Key Features

- **Admin Dashboard:** A centralized interface to manage all aspects of the platform.
- **Content Management:** CRUD (Create, Read, Update, Delete) capabilities for:
  - **Subjects:** Organize courses by category (e.g., Biology, Math).
  - **Grades:** Group modules by educational level (e.g., Grade 10, Grade 11).
  - **Modules:** Create individual learning units with descriptions and questions.
- **Quiz Builder:** Easily add multiple-choice questions to each module.
- **Student View:** A clean and engaging interface for students to take modules and quizzes.
- **Submission Tracking:** View student submissions, track scores, and monitor progress for each module.
- **AI-Powered Features:** Automatically generate module content summaries using generative AI.

## Tech Stack

- **Framework:** Next.js (with App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS & shadcn/ui
- **State Management:** React Hooks & Server Actions
- **AI Features:** Genkit
- **Linting/Formatting:** ESLint & Prettier (configured by default)

## Getting Started

To run the local development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

## Project Structure

- `src/app/dashboard`: Contains all routes and pages for the admin dashboard.
- `src/app/m/[slug]`: The dynamic route for the student-facing module page.
- `src/components`: Reusable React components, organized by feature (auth, dashboard) and UI.
- `src/lib`: Contains the core application logic, including data actions (`data-actions.ts`), type definitions (`types.ts`), and utilities.
- `src/actions`: Next.js Server Actions for handling data mutations and server-side logic.
- `src/ai`: Contains Genkit flows for AI-powered features.
